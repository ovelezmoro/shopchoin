package pe.edu.upn;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.TestSecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import pe.edu.upn.entity.*;
import pe.edu.upn.repository.*;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "admin@shopchain.pe", roles = "ADMIN")
class ShopchainApiTest {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private CategoryRepository categories;
    @Autowired private BranchRepository branches;
    @Autowired private InventoryRepository inventory;
    @Autowired private MovementRepository movements;
    @Autowired private OrderRepository orders;
    @Autowired private PasswordEncoder encoder;

    private Product product;
    private Branch branch;
    private Category category;

    @BeforeEach
    void prepareDatabase() {
        movements.deleteAll();
        orders.deleteAll();
        inventory.deleteAll();
        products.deleteAll();
        branches.deleteAll();
        categories.deleteAll();
        users.deleteAll();

        User admin = new User();
        admin.setNames("Administrador");
        admin.setEmail("admin@shopchain.pe");
        admin.setPasswordHash(encoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        users.save(admin);

        category = new Category();
        category.setName("Running");
        categories.save(category);
        product = new Product();
        product.setSku("TEST-001");
        product.setName("Zapatilla de prueba");
        product.setBrand("Nike");
        product.setCategory(category);
        product.setPrice(new BigDecimal("129.90"));
        product.setDescription("");
        product.setImage("");
        product.setActive(true);
        products.save(product);
        branch = new Branch();
        branch.setName("San Miguel");
        branch.setAddress("Av. La Marina");
        branch.setLocation("Lima");
        branch.setActive(true);
        branches.save(branch);
        Inventory item = new Inventory();
        item.setProduct(product);
        item.setBranch(branch);
        item.setStock(5);
        item.setMinimumStock(2);
        inventory.save(item);
    }

    @Test
    @WithAnonymousUser
    void sessionLoginCsrfAndLogoutWorkTogether() throws Exception {
        // Esta prueba usa la sesión real, sin reemplazarla con la identidad de prueba.
        TestSecurityContextHolder.clearContext();
        mvc.perform(get("/api/products")).andExpect(status().isUnauthorized());
        MvcResult csrfResult = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) csrfResult.getRequest().getSession();
        String token = json(csrfResult).get("token").asText();

        mvc.perform(post("/api/auth/login").session(session)
                        .header("X-CSRF-TOKEN", token)
                        .param("identifier", " ADMIN@SHOPCHAIN.PE ").param("password", "admin123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@shopchain.pe"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/categories").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Training\"}"))
                .andExpect(status().isForbidden());

        // Spring cambia el token al iniciar sesión; se solicita uno nuevo antes de escribir.
        token = json(mvc.perform(get("/api/auth/csrf").session(session)).andReturn()).get("token").asText();
        mvc.perform(post("/api/categories").session(session).header("X-CSRF-TOKEN", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Training\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithAnonymousUser
    void rejectsIncorrectPasswordAndInactiveUsers() throws Exception {
        mvc.perform(post("/api/auth/login").with(csrf()).param("identifier", "admin@shopchain.pe")
                        .param("password", "incorrecta"))
                .andExpect(status().isUnauthorized());
        User admin = users.findByEmail("admin@shopchain.pe").orElseThrow();
        admin.setActive(false);
        users.save(admin);
        mvc.perform(post("/api/auth/login").with(csrf()).param("identifier", "admin@shopchain.pe")
                        .param("password", "admin123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void productCrudFiltersValidationAndUniqueness() throws Exception {
        String body = productBody("NEW-001");
        MvcResult created = mvc.perform(post("/api/products").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.category").value("Running")).andReturn();
        long id = json(created).get("id").asLong();
        mvc.perform(get("/api/products/{id}", id)).andExpect(status().isOk());
        mvc.perform(put("/api/products/{id}", id).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("\"active\":true", "\"active\":false")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/products").param("search", "NEW-001").param("active", "false"))
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(post("/api/products").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/products").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("99.90", "-1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields.price").exists());
        mvc.perform(get("/api/products/999999")).andExpect(status().isNotFound());
        mvc.perform(get("/api/products/not-a-number")).andExpect(status().isBadRequest());
    }

    @Test
    void branchAndInventoryCreationUseExistingReferences() throws Exception {
        MvcResult created = mvc.perform(post("/api/branches").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Breña\",\"address\":\"Jr. Huaraz\",\"location\":\"Lima\"}"))
                .andExpect(status().isCreated()).andReturn();
        long branchId = json(created).get("id").asLong();
        String body = "{\"productId\":" + product.getId() + ",\"branchId\":" + branchId + ",\"minimumStock\":3}";
        mvc.perform(post("/api/inventory").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.stock").value(0))
                .andExpect(jsonPath("$.status").value("Sin stock"));
        mvc.perform(post("/api/inventory").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/inventory").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("\"productId\":" + product.getId(), "\"productId\":999999")))
                .andExpect(status().isNotFound());
    }

    @Test
    void usersArePersistedWithHashedPasswordsAndUniqueEmails() throws Exception {
        String body = """
                {"names":"Almacenero","email":"warehouse@shopchain.pe","password":"password123",
                 "role":"ALMACÉN","active":true}
                """;
        mvc.perform(post("/api/users").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("ALMACÉN"))
                .andExpect(jsonPath("$.password").doesNotExist());
        User user = users.findByEmail("warehouse@shopchain.pe").orElseThrow();
        assertThat(encoder.matches("password123", user.getPasswordHash())).isTrue();
        mvc.perform(post("/api/users").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/users/{id}", user.getId()).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace(",\"password\":\"password123\"", "").replace("true", "false")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        assertThat(users.findById(user.getId()).orElseThrow().getPasswordHash()).isEqualTo(user.getPasswordHash());
    }

    @Test
    @WithMockUser(roles = "STORE")
    void storeCannotAdministerUsersOrRegisterManualMovements() throws Exception {
        mvc.perform(get("/api/users")).andExpect(status().isForbidden());
        mvc.perform(post("/api/products").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(productBody("NEW-001"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/stock-movements").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(movementBody("ENTRADA", 2))).andExpect(status().isForbidden());
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test
    void stockMovementsUpdateStockAndRejectInsufficientBalance() throws Exception {
        mvc.perform(post("/api/stock-movements").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(movementBody("SALIDA", 3)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.quantity").value(-3))
                .andExpect(jsonPath("$.responsible").value("admin@shopchain.pe"));
        assertThat(stock()).isEqualTo(2);
        mvc.perform(get("/api/inventory").param("status", "Stock bajo"))
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(post("/api/stock-movements").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(movementBody("SALIDA", 3))).andExpect(status().isConflict());
        assertThat(stock()).isEqualTo(2);
        assertThat(movements.count()).isEqualTo(1);
        mvc.perform(post("/api/stock-movements").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(movementBody("REPOSICIÓN", 4))).andExpect(status().isCreated());
        assertThat(stock()).isEqualTo(6);
        mvc.perform(post("/api/stock-movements").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(movementBody("ENTRADA", 0))).andExpect(status().isBadRequest());
    }

    @Test
    void orderCalculatesPricesAndCancellationRestoresStockOnlyOnce() throws Exception {
        long id = createOrder(2);
        assertThat(stock()).isEqualTo(3);
        mvc.perform(get("/api/orders/{id}", id))
                .andExpect(jsonPath("$.total").value(259.8))
                .andExpect(jsonPath("$.items[0].price").value(129.9))
                .andExpect(jsonPath("$.items[0].subtotal").value(259.8))
                .andExpect(jsonPath("$.status").value("Pendiente"));
        changeStatus(id, "Cancelado", 200);
        assertThat(stock()).isEqualTo(5);
        assertThat(movements.count()).isEqualTo(2);
        changeStatus(id, "Cancelado", 200);
        assertThat(stock()).isEqualTo(5);
        assertThat(movements.count()).isEqualTo(2);
        changeStatus(id, "En preparación", 409);
    }

    @Test
    void failedOrderRollsBackEarlierItemsAndMovements() throws Exception {
        String item = "{\"productId\":" + product.getId() + ",\"quantity\":3}";
        String body = orderBody(item + "," + item);
        mvc.perform(post("/api/orders").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
        assertThat(stock()).isEqualTo(5);
        assertThat(orders.count()).isZero();
        assertThat(movements.count()).isZero();
    }

    @Test
    void ordersFollowStatusSequenceAndKeepHistoricalPrices() throws Exception {
        long id = createOrder(1);
        changeStatus(id, "Completado", 409);
        changeStatus(id, "En preparación", 200);
        changeStatus(id, "Listo para retiro", 200);
        changeStatus(id, "Completado", 200);
        changeStatus(id, "Cancelado", 409);
        product.setPrice(new BigDecimal("999.00"));
        product.setName("Nombre actualizado");
        products.save(product);
        mvc.perform(get("/api/orders/{id}", id)).andExpect(jsonPath("$.total").value(129.9))
                .andExpect(jsonPath("$.items[0].product").value("Zapatilla de prueba"));
        assertThat(stock()).isEqualTo(4);
    }

    @Test
    void rejectsInvalidOrdersAndInactiveProducts() throws Exception {
        mvc.perform(post("/api/orders").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody(""))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/orders").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody("null"))).andExpect(status().isBadRequest());
        product.setActive(false);
        products.save(product);
        mvc.perform(post("/api/orders").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody("{\"productId\":" + product.getId() + ",\"quantity\":1}")))
                .andExpect(status().isConflict());
        assertThat(stock()).isEqualTo(5);
        assertThat(orders.count()).isZero();
    }

    @Test
    void dashboardUsesPersistedData() throws Exception {
        createOrder(2);
        mvc.perform(get("/api/dashboard/metrics")).andExpect(status().isOk())
                .andExpect(jsonPath("$[1].value").value("3"))
                .andExpect(jsonPath("$[2].value").value("1"));
        mvc.perform(get("/api/dashboard/branches"))
                .andExpect(jsonPath("$[0].percentage").value(100));
        mvc.perform(get("/api/dashboard/activity"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithAnonymousUser
    void corsAllowsConfiguredFrontendWithCredentials() throws Exception {
        mvc.perform(options("/api/products").header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type,X-CSRF-TOKEN"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private int stock() {
        return inventory.findByProductIdAndBranchId(product.getId(), branch.getId()).orElseThrow().getStock();
    }

    private String productBody(String sku) {
        return """
                {"sku":"%s","name":"Producto nuevo","brand":"Nike","categoryId":%d,
                 "price":99.90,"description":"","image":"","active":true}
                """.formatted(sku, category.getId());
    }

    private String movementBody(String type, int quantity) {
        return """
                {"productId":%d,"branchId":%d,"type":"%s","quantity":%d,"reference":"TEST"}
                """.formatted(product.getId(), branch.getId(), type, quantity);
    }

    private String orderBody(String items) {
        return """
                {"customer":"Ana","customerDocument":"12345678","branchId":%d,"items":[%s]}
                """.formatted(branch.getId(), items);
    }

    private long createOrder(int quantity) throws Exception {
        String item = "{\"productId\":" + product.getId() + ",\"quantity\":" + quantity + "}";
        MvcResult result = mvc.perform(post("/api/orders").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody(item)))
                .andExpect(status().isCreated()).andReturn();
        return json(result).get("id").asLong();
    }

    private void changeStatus(long id, String next, int expectedStatus) throws Exception {
        mvc.perform(patch("/api/orders/{id}/status", id).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"" + next + "\"}"))
                .andExpect(status().is(expectedStatus));
    }
}
