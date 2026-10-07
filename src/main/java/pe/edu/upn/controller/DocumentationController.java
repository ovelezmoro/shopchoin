package pe.edu.upn.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.URI;

@RestController
public class DocumentationController {
    @GetMapping(value = "/api/docs", produces = "text/html;charset=UTF-8")
    public Resource swaggerUi() {
        return new ClassPathResource("docs/index.html");
    }

    @GetMapping("/api/docs/")
    public ResponseEntity<Void> canonicalDocsUrl(HttpServletRequest request) {
        return ResponseEntity.status(302)
                .location(URI.create(request.getContextPath() + "/api/docs")).build();
    }

    @GetMapping(value = "/api/openapi.yml", produces = "application/yaml;charset=UTF-8")
    public Resource openapi() {
        return new ClassPathResource("openapi.yml");
    }
}
