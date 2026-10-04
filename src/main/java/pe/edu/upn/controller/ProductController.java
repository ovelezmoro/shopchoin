package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.ProductDto;
import pe.edu.upn.service.ProductService;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public List<ProductDto> findAll(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) Long categoryId,
                                    @RequestParam(required = false) Boolean active) {
        return service.findAll(search, categoryId, active);
    }

    @GetMapping("/{id}")
    public ProductDto findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductDto data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductDto data) {
        return service.update(id, data);
    }
}
