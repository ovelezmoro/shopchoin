package pe.edu.upn.dto;

import pe.edu.upn.entity.Inventory;

public class InventoryDto {
    private final Long id;
    private final Long productId;
    private final Long branchId;
    private final String product;
    private final String category;
    private final String branch;
    private final int stock;
    private final int minimumStock;
    private final String status;

    public InventoryDto(Inventory inventory) {
        id = inventory.getId();
        productId = inventory.getProduct().getId();
        branchId = inventory.getBranch().getId();
        product = inventory.getProduct().getName();
        category = inventory.getProduct().getCategory().getName();
        branch = inventory.getBranch().getName();
        stock = inventory.getStock();
        minimumStock = inventory.getMinimumStock();
        if (stock == 0) {
            status = "Sin stock";
        } else if (stock <= minimumStock) {
            status = "Stock bajo";
        } else {
            status = "Disponible";
        }
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public Long getBranchId() { return branchId; }
    public String getProduct() { return product; }
    public String getCategory() { return category; }
    public String getBranch() { return branch; }
    public int getStock() { return stock; }
    public int getMinimumStock() { return minimumStock; }
    public String getStatus() { return status; }
}
