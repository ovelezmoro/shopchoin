package pe.edu.upn.dto;

import jakarta.validation.constraints.*;

public class InventoryRequest {
    @NotNull @Positive
    private Long productId;
    @NotNull @Positive
    private Long branchId;
    @NotNull @Min(0)
    private Integer minimumStock = 0;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) { this.minimumStock = minimumStock; }
}
