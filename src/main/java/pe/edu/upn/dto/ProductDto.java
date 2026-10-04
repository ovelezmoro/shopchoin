package pe.edu.upn.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import pe.edu.upn.entity.Product;
import java.math.BigDecimal;

public class ProductDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @NotBlank @Size(max = 60)
    private String sku;
    @NotBlank @Size(max = 160)
    private String name;
    @NotBlank @Size(max = 80)
    private String brand;
    @NotNull @Positive
    private Long categoryId;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String category;
    @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2)
    private BigDecimal price;
    @NotNull @Size(max = 2000)
    private String description = "";
    @NotNull @Size(max = 10000)
    private String image = "";
    @NotNull
    private Boolean active = true;

    public ProductDto() { }
    public ProductDto(Product product) {
        id = product.getId();
        sku = product.getSku();
        name = product.getName();
        brand = product.getBrand();
        categoryId = product.getCategory().getId();
        category = product.getCategory().getName();
        price = product.getPrice();
        description = product.getDescription();
        image = product.getImage();
        active = product.isActive();
    }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
