package pe.edu.upn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upn.entity.StockMovement;
import java.util.List;

public interface MovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findTop10ByOrderByDateDescIdDesc();
}
