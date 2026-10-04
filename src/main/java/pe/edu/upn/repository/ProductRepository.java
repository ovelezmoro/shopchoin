package pe.edu.upn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upn.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
