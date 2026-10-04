package pe.edu.upn.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.*;
import pe.edu.upn.entity.*;
import pe.edu.upn.exception.BusinessException;
import pe.edu.upn.exception.NotFoundException;
import pe.edu.upn.repository.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class InventoryService {
    private final InventoryRepository inventory;
    private final MovementRepository movements;
    private final ProductRepository products;
    private final BranchRepository branches;

    public InventoryService(InventoryRepository inventory, MovementRepository movements,
                            ProductRepository products, BranchRepository branches) {
        this.inventory = inventory;
        this.movements = movements;
        this.products = products;
        this.branches = branches;
    }

    public List<InventoryDto> findAll(Long productId, Long branchId, String status) {
        if (status != null && !List.of("Disponible", "Stock bajo", "Sin stock").contains(status)) {
            throw new IllegalArgumentException("Estado de inventario inválido.");
        }
        List<InventoryDto> result = new ArrayList<>();
        for (Inventory item : inventory.findAll()) {
            if (productId != null && !productId.equals(item.getProduct().getId())) continue;
            if (branchId != null && !branchId.equals(item.getBranch().getId())) continue;
            InventoryDto dto = new InventoryDto(item);
            if (status == null || status.equals(dto.getStatus())) result.add(dto);
        }
        return result;
    }

    @Transactional
    public InventoryDto create(InventoryRequest data) {
        if (inventory.findByProductIdAndBranchId(data.getProductId(), data.getBranchId()).isPresent()) {
            throw new BusinessException("Ya existe inventario para ese producto y sucursal.");
        }
        Product product = products.findById(data.getProductId())
                .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
        Branch branch = branches.findById(data.getBranchId())
                .orElseThrow(() -> new NotFoundException("Sucursal no encontrada."));
        Inventory item = new Inventory();
        item.setProduct(product);
        item.setBranch(branch);
        item.setMinimumStock(data.getMinimumStock());
        // El inventario inicia en cero; las existencias se cargan mediante movimientos.
        item.setStock(0);
        return new InventoryDto(inventory.save(item));
    }

    public List<MovementDto> findMovements(Long productId, Long branchId) {
        List<MovementDto> result = new ArrayList<>();
        for (StockMovement movement : movements.findAll(Sort.by(Sort.Direction.DESC, "id"))) {
            Inventory item = movement.getInventory();
            if (productId != null && !productId.equals(item.getProduct().getId())) continue;
            if (branchId != null && !branchId.equals(item.getBranch().getId())) continue;
            result.add(new MovementDto(movement));
        }
        return result;
    }

    @Transactional
    public MovementDto createMovement(MovementRequest data, String responsible) {
        Inventory item = getInventory(data.getProductId(), data.getBranchId());
        if (!item.getProduct().isActive() || !item.getBranch().isActive()) {
            throw new BusinessException("El producto y la sucursal deben estar activos.");
        }
        return new MovementDto(applyMovement(item, data.getType(), data.getQuantity(),
                data.getReference(), responsible, data.getObservation()));
    }

    public Inventory getInventory(Long productId, Long branchId) {
        return inventory.findByProductIdAndBranchId(productId, branchId)
                .orElseThrow(() -> new NotFoundException("Inventario no encontrado para el producto y la sucursal."));
    }

    // También lo utiliza OrderService, dentro de la transacción del pedido.
    @Transactional
    public StockMovement applyMovement(Inventory item, MovementType type, int quantity,
                                       String reference, String responsible, String observation) {
        if (quantity <= 0) throw new BusinessException("La cantidad debe ser positiva.");
        int change = quantity;
        if (type == MovementType.EXIT) change = -quantity;
        long newStock = (long) item.getStock() + change;
        if (newStock < 0) throw new BusinessException("Stock insuficiente para " + item.getProduct().getName() + ".");
        if (newStock > Integer.MAX_VALUE) throw new BusinessException("Se excede el máximo de existencias.");
        item.setStock((int) newStock);
        inventory.save(item);

        StockMovement movement = new StockMovement();
        movement.setInventory(item);
        movement.setType(type);
        movement.setQuantity(change);
        movement.setDate(Instant.now());
        movement.setReference(reference);
        movement.setResponsible(responsible);
        movement.setObservation(observation);
        return movements.save(movement);
    }
}
