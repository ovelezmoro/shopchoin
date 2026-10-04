package pe.edu.upn.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.*;
import pe.edu.upn.entity.*;
import pe.edu.upn.repository.*;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final ProductRepository products;
    private final BranchRepository branches;
    private final OrderRepository orders;
    private final InventoryRepository inventory;
    private final MovementRepository movements;

    public DashboardService(ProductRepository products, BranchRepository branches, OrderRepository orders,
                            InventoryRepository inventory, MovementRepository movements) {
        this.products = products;
        this.branches = branches;
        this.orders = orders;
        this.inventory = inventory;
        this.movements = movements;
    }

    public List<DashboardMetricDto> metrics() {
        long units = 0;
        long lowStock = 0;
        for (Inventory item : inventory.findAll()) {
            units += item.getStock();
            if (item.getStock() <= item.getMinimumStock()) lowStock++;
        }
        return List.of(
                new DashboardMetricDto("Productos", String.valueOf(products.count()), "bi-box-seam"),
                new DashboardMetricDto("Unidades en stock", String.valueOf(units), "bi-boxes"),
                new DashboardMetricDto("Pedidos", String.valueOf(orders.count()), "bi-bag"),
                new DashboardMetricDto("Alertas de stock", String.valueOf(lowStock), "bi-exclamation-triangle"));
    }

    public List<BranchSummaryDto> branchSummary() {
        List<Inventory> stocks = inventory.findAll();
        long total = 0;
        for (Inventory item : stocks) total += item.getStock();
        List<BranchSummaryDto> result = new ArrayList<>();
        for (Branch branch : branches.findAll()) {
            long branchStock = 0;
            for (Inventory item : stocks) {
                if (item.getBranch().getId().equals(branch.getId())) branchStock += item.getStock();
            }
            int percentage = 0;
            if (total > 0) percentage = (int) Math.round(branchStock * 100.0 / total);
            result.add(new BranchSummaryDto(branch.getName(), percentage));
        }
        return result;
    }

    public List<RecentActivityDto> recentActivity() {
        List<RecentActivityDto> result = new ArrayList<>();
        for (StockMovement movement : movements.findTop10ByOrderByDateDescIdDesc()) {
            result.add(new RecentActivityDto(movement.getType().label() + " · " + movement.getReference(),
                    movement.getInventory().getProduct().getName() + " · "
                            + movement.getInventory().getBranch().getName() + " · " + movement.getQuantity()));
        }
        return result;
    }
}
