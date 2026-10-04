package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.UserDto;
import pe.edu.upn.service.UserService;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @GetMapping
    public List<UserDto> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public UserDto findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserDto data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(data));
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserDto data) {
        return service.update(id, data);
    }
}
