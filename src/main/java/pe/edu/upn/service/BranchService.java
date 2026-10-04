package pe.edu.upn.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.BranchDto;
import pe.edu.upn.entity.Branch;
import pe.edu.upn.exception.NotFoundException;
import pe.edu.upn.repository.BranchRepository;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BranchService {
    private final BranchRepository branches;

    public BranchService(BranchRepository branches) { this.branches = branches; }

    public List<BranchDto> findAll() {
        List<BranchDto> result = new ArrayList<>();
        for (Branch branch : branches.findAll()) result.add(new BranchDto(branch));
        return result;
    }

    public BranchDto findById(Long id) { return new BranchDto(getBranch(id)); }

    @Transactional
    public BranchDto create(BranchDto data) {
        Branch branch = new Branch();
        copyFields(branch, data);
        return new BranchDto(branches.save(branch));
    }

    @Transactional
    public BranchDto update(Long id, BranchDto data) {
        Branch branch = getBranch(id);
        copyFields(branch, data);
        return new BranchDto(branches.save(branch));
    }

    private Branch getBranch(Long id) {
        return branches.findById(id).orElseThrow(() -> new NotFoundException("Sucursal no encontrada."));
    }

    private void copyFields(Branch branch, BranchDto data) {
        branch.setName(data.getName().trim());
        branch.setAddress(data.getAddress().trim());
        branch.setLocation(data.getLocation().trim());
        branch.setActive(data.getActive());
    }
}
