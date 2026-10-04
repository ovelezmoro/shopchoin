package pe.edu.upn.service;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import pe.edu.upn.entity.User;
import pe.edu.upn.repository.UserRepository;
import java.util.Locale;

@Service
public class ShopchainUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public ShopchainUserDetailsService(UserRepository users) { this.users = users; }

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = users.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!user.isActive())
                .build();
    }
}
