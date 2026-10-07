package pe.edu.upn;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import pe.edu.upn.controller.DocumentationController;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DocumentationTest {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;
    @Autowired @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping mappings;

    @Test
    void swaggerAndItsAssetsArePublicUnderTheContextPath() throws Exception {
        mvc.perform(get("/shopchain/api/docs").contextPath("/shopchain"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("docs/assets/swagger-ui-bundle.js")));
        for (String asset : new String[]{"assets/swagger-ui.css", "assets/swagger-ui-bundle.js", "init.js"}) {
            mvc.perform(get("/shopchain/api/docs/" + asset).contextPath("/shopchain"))
                    .andExpect(status().isOk());
        }
        mvc.perform(get("/shopchain/api/docs/").contextPath("/shopchain"))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("/shopchain/api/docs"));
    }

    @Test
    void publishedContractCoversEveryBusinessRouteAndResolvesReferences() throws Exception {
        String yaml = mvc.perform(get("/shopchain/api/openapi.yml").contextPath("/shopchain"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/yaml"))
                .andReturn().getResponse().getContentAsString();
        LoaderOptions options = new LoaderOptions();
        options.setAllowDuplicateKeys(false);
        JsonNode spec = mapper.valueToTree(new Yaml(new SafeConstructor(options)).load(yaml));
        assertThat(spec.path("openapi").asText()).isEqualTo("3.0.3");
        assertThat(spec.at("/servers/0/url").asText()).isEqualTo(".");
        checkReferences(spec, spec);

        assertThat(spec.at("/components/securitySchemes/bearerAuth/scheme").asText()).isEqualTo("bearer");
        assertThat(spec.at("/paths/~1auth~1csrf").isMissingNode()).isTrue();
        assertThat(spec.at("/paths/~1auth~1logout").isMissingNode()).isTrue();
        Set<String> expected = new HashSet<>();
        mappings.getHandlerMethods().forEach((mapping, handler) -> {
            if (handler.getBeanType().getPackageName().equals("pe.edu.upn.controller")
                    && handler.getBeanType() != DocumentationController.class) {
                mapping.getPatternValues().forEach(path -> mapping.getMethodsCondition().getMethods()
                        .forEach(method -> expected.add(method.name() + " " + path.substring("/api".length()))));
            }
        });
        Set<String> actual = new HashSet<>();
        Set<String> operationIds = new HashSet<>();
        spec.path("paths").fields().forEachRemaining(path -> path.getValue().fields().forEachRemaining(operation -> {
            if (Set.of("get", "post", "put", "patch", "delete").contains(operation.getKey())) {
                actual.add(operation.getKey().toUpperCase() + " " + path.getKey());
                assertThat(operationIds.add(operation.getValue().path("operationId").asText())).isTrue();
                assertThat(operation.getValue().path("responses").isEmpty()).isFalse();
            }
        }));
        assertThat(actual).containsExactlyInAnyOrderElementsOf(expected);
    }

    @Test
    void publicDocumentationDoesNotExposeBusinessEndpoints() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    private void checkReferences(JsonNode node, JsonNode root) {
        if (node.has("$ref")) {
            String ref = node.path("$ref").asText();
            assertThat(ref).startsWith("#/");
            assertThat(root.at(ref.substring(1)).isMissingNode()).as(ref).isFalse();
        }
        node.forEach(child -> checkReferences(child, root));
    }
}
