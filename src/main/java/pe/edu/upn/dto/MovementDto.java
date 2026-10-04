package pe.edu.upn.dto;

import pe.edu.upn.entity.StockMovement;
import pe.edu.upn.entity.MovementType;
import java.time.Instant;

public class MovementDto {
    private final Long id;
    private final String code;
    private final Instant date;
    private final Long productId;
    private final String product;
    private final Long branchId;
    private final String branch;
    private final MovementType type;
    private final int quantity;
    private final String reference;
    private final String responsible;
    private final String observation;

    public MovementDto(StockMovement movement) {
        id = movement.getId();
        code = "MOV-" + id;
        date = movement.getDate();
        productId = movement.getInventory().getProduct().getId();
        product = movement.getInventory().getProduct().getName();
        branchId = movement.getInventory().getBranch().getId();
        branch = movement.getInventory().getBranch().getName();
        type = movement.getType();
        quantity = movement.getQuantity();
        reference = movement.getReference();
        responsible = movement.getResponsible();
        observation = movement.getObservation();
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Instant getDate() { return date; }
    public Long getProductId() { return productId; }
    public String getProduct() { return product; }
    public Long getBranchId() { return branchId; }
    public String getBranch() { return branch; }
    public MovementType getType() { return type; }
    public int getQuantity() { return quantity; }
    public String getReference() { return reference; }
    public String getResponsible() { return responsible; }
    public String getObservation() { return observation; }
}
