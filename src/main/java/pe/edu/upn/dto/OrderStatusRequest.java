package pe.edu.upn.dto;

import jakarta.validation.constraints.NotNull;
import pe.edu.upn.entity.OrderStatus;

public class OrderStatusRequest {
    @NotNull
    private OrderStatus status;

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}
