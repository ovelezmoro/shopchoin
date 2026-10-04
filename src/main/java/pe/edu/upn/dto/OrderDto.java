package pe.edu.upn.dto;

import pe.edu.upn.entity.Order;
import pe.edu.upn.entity.OrderItem;
import pe.edu.upn.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class OrderDto {
    private final Long id;
    private final String number;
    private final Instant date;
    private final String customer;
    private final String customerDocument;
    private final Long branchId;
    private final String branch;
    private final OrderStatus status;
    private final BigDecimal total;
    private final String observations;
    private final List<OrderItemDto> items = new ArrayList<>();

    public OrderDto(Order order) {
        id = order.getId();
        number = "PED-" + id;
        date = order.getDate();
        customer = order.getCustomer();
        customerDocument = order.getCustomerDocument();
        branchId = order.getBranch().getId();
        branch = order.getBranch().getName();
        status = order.getStatus();
        total = order.getTotal();
        observations = order.getObservations();
        for (OrderItem item : order.getItems()) {
            items.add(new OrderItemDto(item));
        }
    }

    public Long getId() { return id; }
    public String getNumber() { return number; }
    public Instant getDate() { return date; }
    public String getCustomer() { return customer; }
    public String getCustomerDocument() { return customerDocument; }
    public Long getBranchId() { return branchId; }
    public String getBranch() { return branch; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
    public String getObservations() { return observations; }
    public List<OrderItemDto> getItems() { return items; }
}
