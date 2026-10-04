package pe.edu.upn.dto;

import pe.edu.upn.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDto {
    private final Long productId;
    private final String product;
    private final BigDecimal price;
    private final int quantity;
    private final BigDecimal subtotal;
    private final Integer size;

    public OrderItemDto(OrderItem item) {
        productId = item.getProduct().getId();
        product = item.getProductName();
        price = item.getPrice();
        quantity = item.getQuantity();
        subtotal = price.multiply(BigDecimal.valueOf(quantity));
        size = item.getSize();
    }

    public Long getProductId() { return productId; }
    public String getProduct() { return product; }
    public BigDecimal getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public BigDecimal getSubtotal() { return subtotal; }
    public Integer getSize() { return size; }
}
