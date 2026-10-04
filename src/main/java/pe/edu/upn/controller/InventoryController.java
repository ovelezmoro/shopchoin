package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.*;
import pe.edu.upn.service.InventoryService;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;
    public InventoryController(InventoryService service) { this.service = service; }

    @GetMapping
    public List<InventoryDto> findAll(@RequestParam(required = false) Long productId,
                                      @RequestParam(required = false) Long branchId,
                                      @RequestParam(required = false) String status) {
        return service.findAll(productId, branchId, status);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    public ResponseEntity<InventoryDto> create(@Valid @RequestBody InventoryRequest data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(data));
    }
}
