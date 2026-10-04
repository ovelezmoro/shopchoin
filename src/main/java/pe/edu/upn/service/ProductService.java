package pe.edu.upn.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.ProductDto;
import pe.edu.upn.entity.Category;
import pe.edu.upn.entity.Product;
import pe.edu.upn.exception.NotFoundException;
import pe.edu.upn.repository.CategoryRepository;
import pe.edu.upn.repository.ProductRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductService(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    public List<ProductDto> findAll(String search, Long categoryId, Boolean active) {
        List<ProductDto> result = new ArrayList<>();
        for (Product product : products.findAll()) {
            if (categoryId != null && !categoryId.equals(product.getCategory().getId())) continue;
            if (active != null && active != product.isActive()) continue;
            String text = product.getName() + " " + product.getSku() + " " + product.getBrand();
            if (search != null && !text.toLowerCase(Locale.ROOT).contains(search.trim().toLowerCase(Locale.ROOT))) continue;
            result.add(new ProductDto(product));
        }
        return result;
    }

    public ProductDto findById(Long id) { return new ProductDto(getProduct(id)); }

    @Transactional
    public ProductDto create(ProductDto data) {
        Product product = new Product();
        copyFields(product, data);
        return new ProductDto(products.save(product));
    }

    @Transactional
    public ProductDto update(Long id, ProductDto data) {
        Product product = getProduct(id);
        copyFields(product, data);
        return new ProductDto(products.save(product));
    }

    private Product getProduct(Long id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado."));
    }

    private void copyFields(Product product, ProductDto data) {
        Category category = categories.findById(data.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada."));
        product.setSku(data.getSku().trim().toUpperCase(Locale.ROOT));
        product.setName(data.getName().trim());
        product.setBrand(data.getBrand().trim());
        product.setCategory(category);
        product.setPrice(data.getPrice());
        product.setDescription(data.getDescription());
        product.setImage(data.getImage());
        product.setActive(data.getActive());
    }
}
