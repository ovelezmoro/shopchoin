package pe.edu.upn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upn.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
