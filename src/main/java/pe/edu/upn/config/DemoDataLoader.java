package pe.edu.upn.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.entity.*;
import pe.edu.upn.repository.*;
import pe.edu.upn.service.InventoryService;
import java.math.BigDecimal;

@Component
@Profile("dev")
public class DemoDataLoader implements CommandLineRunner {
    private final UserRepository users;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final BranchRepository branches;
    private final InventoryRepository inventory;
    private final InventoryService inventoryService;
    private final PasswordEncoder passwordEncoder;
    private final String demoPassword;

    public DemoDataLoader(UserRepository users, CategoryRepository categories, ProductRepository products,
                          BranchRepository branches, InventoryRepository inventory, InventoryService inventoryService,
                          PasswordEncoder passwordEncoder, @Value("${shopchain.demo.password}") String demoPassword) {
        this.users = users;
        this.categories = categories;
        this.products = products;
        this.branches = branches;
        this.inventory = inventory;
        this.inventoryService = inventoryService;
        this.passwordEncoder = passwordEncoder;
        this.demoPassword = demoPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Solo se carga la demostración sobre una base vacía, sin reemplazar datos existentes.
        if (users.count() > 0 || categories.count() > 0 || products.count() > 0 || branches.count() > 0) return;

        User admin = new User();
        admin.setNames("Administrador ShopChain");
        admin.setEmail("admin@shopchain.pe");
        admin.setPasswordHash(passwordEncoder.encode(demoPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        users.save(admin);

        Category running = new Category();
        running.setName("Running");
        categories.save(running);

        Product[] demoProducts = {
                product("NK-PEG-001", "Nike Air Zoom Pegasus", "Nike", "429.90", running),
                product("AD-ULT-014", "Adidas Ultraboost Light", "Adidas", "499.90", running),
                product("PM-VEL-006", "Puma Velocity Nitro", "Puma", "359.90", running),
                product("NB-1080-021", "New Balance 1080", "New Balance", "479.90", running),
                product("AS-NIM-013", "Asics Gel Nimbus", "Asics", "459.90", running),
                product("NK-REV-017", "Nike Revolution", "Nike", "299.90", running)
        };
        Branch[] demoBranches = {
                branch("San Miguel", "Av. La Marina 2000", "Lima"),
                branch("San Isidro", "Av. Javier Prado 420", "Lima"),
                branch("Breña", "Jr. Huaraz 780", "Lima"),
                branch("Bellavista", "Av. Colonial 4580", "Callao")
        };
        int[][] stocks = {{12, 8, 4, 12}, {5, 6, 3, 4}, {2, 1, 1, 3}, {7, 6, 4, 5}, {1, 2, 1, 1}, {0, 0, 0, 0}};
        for (int p = 0; p < demoProducts.length; p++) {
            for (int b = 0; b < demoBranches.length; b++) {
                Inventory item = new Inventory();
                item.setProduct(demoProducts[p]);
                item.setBranch(demoBranches[b]);
                item.setMinimumStock(3);
                item.setStock(0);
                inventory.save(item);
                if (stocks[p][b] > 0) {
                    inventoryService.applyMovement(item, MovementType.ENTRY, stocks[p][b],
                            "CARGA-INICIAL", admin.getEmail(), "Existencias de demostración");
                }
            }
        }
    }

    private Product product(String sku, String name, String brand, String price, Category category) {
        Product product = new Product();
        product.setSku(sku);
        product.setName(name);
        product.setBrand(brand);
        product.setPrice(new BigDecimal(price));
        product.setCategory(category);
        product.setDescription("Calzado deportivo para entrenamiento.");
        product.setImage("");
        product.setActive(true);
        return products.save(product);
    }

    private Branch branch(String name, String address, String location) {
        Branch branch = new Branch();
        branch.setName(name);
        branch.setAddress(address);
        branch.setLocation(location);
        branch.setActive(true);
        return branches.save(branch);
    }
}
