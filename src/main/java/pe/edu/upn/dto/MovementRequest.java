package pe.edu.upn.dto;

import jakarta.validation.constraints.*;
import pe.edu.upn.entity.MovementType;

public class MovementRequest {
    @NotNull @Positive
    private Long productId;
    @NotNull @Positive
    private Long branchId;
    @NotNull
    private MovementType type;
    @NotNull @Positive @Max(1000000)
    private Integer quantity;
    @NotBlank @Size(max = 120)
    private String reference;
    @NotNull @Size(max = 1000)
    private String observation = "";

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }
}
