package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.*;
import pe.edu.upn.service.InventoryService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class MovementController {
    private final InventoryService service;
    public MovementController(InventoryService service) { this.service = service; }

    @GetMapping
    public List<MovementDto> findAll(@RequestParam(required = false) Long productId,
                                     @RequestParam(required = false) Long branchId) {
        return service.findMovements(productId, branchId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    public ResponseEntity<MovementDto> create(@Valid @RequestBody MovementRequest data, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMovement(data, principal.getName()));
    }
}
