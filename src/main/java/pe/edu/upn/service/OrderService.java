package pe.edu.upn.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.*;
import pe.edu.upn.entity.*;
import pe.edu.upn.exception.BusinessException;
import pe.edu.upn.exception.NotFoundException;
import pe.edu.upn.repository.BranchRepository;
import pe.edu.upn.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class OrderService {
    private final OrderRepository orders;
    private final BranchRepository branches;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orders, BranchRepository branches, InventoryService inventoryService) {
        this.orders = orders;
        this.branches = branches;
        this.inventoryService = inventoryService;
    }

    public List<OrderDto> findAll(Long branchId, String status) {
        if (status != null) {
            boolean valid = false;
            for (OrderStatus value : OrderStatus.values()) {
                if (value.label().equals(status)) valid = true;
            }
            if (!valid) throw new IllegalArgumentException("Estado de pedido inválido.");
        }
        List<OrderDto> result = new ArrayList<>();
        for (Order order : orders.findAll(Sort.by(Sort.Direction.DESC, "id"))) {
            if (branchId != null && !branchId.equals(order.getBranch().getId())) continue;
            if (status != null && !status.equals(order.getStatus().label())) continue;
            result.add(new OrderDto(order));
        }
        return result;
    }

    public OrderDto findById(Long id) { return new OrderDto(getOrder(id)); }

    @Transactional
    public OrderDto create(OrderRequest data, String responsible) {
        Branch branch = branches.findById(data.getBranchId())
                .orElseThrow(() -> new NotFoundException("Sucursal no encontrada."));
        if (!branch.isActive()) throw new BusinessException("La sucursal está inactiva.");

        Order order = new Order();
        order.setDate(Instant.now());
        order.setCustomer(data.getCustomer().trim());
        order.setCustomerDocument(data.getCustomerDocument().trim());
        order.setBranch(branch);
        order.setStatus(OrderStatus.PENDING);
        order.setObservations(data.getObservations());
        order.setTotal(BigDecimal.ZERO);
        orders.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest requestedItem : data.getItems()) {
            Inventory stock = inventoryService.getInventory(requestedItem.getProductId(), branch.getId());
            Product product = stock.getProduct();
            if (!product.isActive()) throw new BusinessException("El producto está inactivo: " + product.getName());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(requestedItem.getQuantity());
            item.setSize(requestedItem.getSize());
            order.getItems().add(item);
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            inventoryService.applyMovement(stock, MovementType.EXIT, item.getQuantity(),
                    "PED-" + order.getId(), responsible, "Salida por pedido");
        }
        order.setTotal(total);
        return new OrderDto(orders.save(order));
    }

    @Transactional
    public OrderDto changeStatus(Long id, OrderStatus next, String responsible) {
        Order order = getOrder(id);
        OrderStatus current = order.getStatus();
        if (current == next) return new OrderDto(order);

        boolean allowed = false;
        if (current == OrderStatus.PENDING && next == OrderStatus.PREPARING) allowed = true;
        if (current == OrderStatus.PREPARING && next == OrderStatus.READY) allowed = true;
        if (current == OrderStatus.READY && next == OrderStatus.COMPLETED) allowed = true;
        if (next == OrderStatus.CANCELLED && current != OrderStatus.COMPLETED && current != OrderStatus.CANCELLED) {
            allowed = true;
        }
        if (!allowed) throw new BusinessException("El cambio de estado no está permitido.");

        if (next == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Inventory stock = inventoryService.getInventory(item.getProduct().getId(), order.getBranch().getId());
                inventoryService.applyMovement(stock, MovementType.ENTRY, item.getQuantity(),
                        "PED-" + order.getId(), responsible, "Devolución por cancelación");
            }
        }
        order.setStatus(next);
        return new OrderDto(orders.save(order));
    }

    private Order getOrder(Long id) {
        return orders.findById(id).orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
    }
}
