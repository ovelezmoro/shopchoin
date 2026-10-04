package pe.edu.upn.dto;

import jakarta.validation.constraints.*;

public class OrderItemRequest {
    @NotNull @Positive
    private Long productId;
    @NotNull @Positive @Max(10000)
    private Integer quantity;
    @Min(1) @Max(60)
    private Integer size;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
}
