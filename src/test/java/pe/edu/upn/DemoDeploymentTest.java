package pe.edu.upn;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "JWT_SECRET=deployment-test-key-only-for-automated-tests-2026",
        "DEMO_ADMIN_PASSWORD=deployment-test-password",
        "CORS_ALLOWED_ORIGINS=https://frontend.example.com"
})
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class DemoDeploymentTest {
    @Autowired private MockMvc mvc;

    @Test
    void demoStartsWithSeededAdminAndPublicRenderHealthCheck() throws Exception {
        mvc.perform(get("/api/openapi.yml"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/auth/login")
                        .header("Origin", "https://frontend.example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"identifier":"admin@shopchain.pe","password":"deployment-test-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://frontend.example.com"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }
}
