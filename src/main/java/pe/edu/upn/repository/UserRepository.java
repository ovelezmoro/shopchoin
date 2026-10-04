package pe.edu.upn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upn.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
