package pe.edu.upn.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.UserDto;
import pe.edu.upn.entity.User;
import pe.edu.upn.exception.BusinessException;
import pe.edu.upn.exception.NotFoundException;
import pe.edu.upn.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> findAll() {
        List<UserDto> result = new ArrayList<>();
        for (User user : users.findAll()) result.add(new UserDto(user));
        return result;
    }

    public UserDto findById(Long id) { return new UserDto(getUser(id)); }

    public UserDto findByEmail(String email) {
        return new UserDto(users.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado.")));
    }

    @Transactional
    public UserDto create(UserDto data) {
        if (data.getPassword() == null) throw new BusinessException("La contraseña es obligatoria al crear un usuario.");
        User user = new User();
        copyFields(user, data);
        return new UserDto(users.save(user));
    }

    @Transactional
    public UserDto update(Long id, UserDto data) {
        User user = getUser(id);
        copyFields(user, data);
        return new UserDto(users.save(user));
    }

    private User getUser(Long id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
    }

    private void copyFields(User user, UserDto data) {
        user.setNames(data.getNames().trim());
        user.setEmail(data.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setRole(data.getRole());
        user.setActive(data.getActive());
        if (data.getPassword() != null) {
            if (data.getPassword().isBlank() || data.getPassword().length() < 8
                    || data.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new BusinessException("La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes.");
            }
            user.setPasswordHash(passwordEncoder.encode(data.getPassword()));
        }
    }
}
