package pe.edu.upn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upn.entity.Branch;

public interface BranchRepository extends JpaRepository<Branch, Long> {
}
