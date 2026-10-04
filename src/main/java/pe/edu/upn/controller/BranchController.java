package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.BranchDto;
import pe.edu.upn.service.BranchService;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {
    private final BranchService service;
    public BranchController(BranchService service) { this.service = service; }

    @GetMapping
    public List<BranchDto> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public BranchDto findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto> create(@Valid @RequestBody BranchDto data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BranchDto update(@PathVariable Long id, @Valid @RequestBody BranchDto data) {
        return service.update(id, data);
    }
}
