package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.*;
import pe.edu.upn.service.OrderService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @GetMapping
    public List<OrderDto> findAll(@RequestParam(required = false) Long branchId,
                                  @RequestParam(required = false) String status) {
        return service.findAll(branchId, status);
    }

    @GetMapping("/{id}")
    public OrderDto findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE')")
    public ResponseEntity<OrderDto> create(@Valid @RequestBody OrderRequest data, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(data, principal.getName()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE', 'WAREHOUSE')")
    public OrderDto changeStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusRequest data,
                                Principal principal) {
        return service.changeStatus(id, data.getStatus(), principal.getName());
    }
}
