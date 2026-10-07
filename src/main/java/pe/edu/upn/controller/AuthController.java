package pe.edu.upn.controller;

import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.LoginRequest;
import pe.edu.upn.dto.LoginResponse;
import pe.edu.upn.dto.UserDto;
import pe.edu.upn.service.JwtService;
import pe.edu.upn.service.UserService;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService users;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwt;

    public AuthController(UserService users, AuthenticationManager authenticationManager, JwtService jwt) {
        this.users = users;
        this.authenticationManager = authenticationManager;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest data) {
        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(data.getIdentifier(), data.getPassword()));
        LoginResponse response = new LoginResponse(jwt.createToken(authentication), jwt.getExpiresIn(),
                users.findByEmail(authentication.getName()));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(response);
    }

    @GetMapping("/me")
    public UserDto currentUser(Principal principal) { return users.findByEmail(principal.getName()); }
}
