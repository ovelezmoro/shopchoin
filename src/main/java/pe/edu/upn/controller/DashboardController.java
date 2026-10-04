package pe.edu.upn.controller;

import org.springframework.web.bind.annotation.*;
import pe.edu.upn.dto.*;
import pe.edu.upn.service.DashboardService;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping("/metrics")
    public List<DashboardMetricDto> metrics() { return service.metrics(); }

    @GetMapping("/branches")
    public List<BranchSummaryDto> branches() { return service.branchSummary(); }

    @GetMapping("/activity")
    public List<RecentActivityDto> activity() { return service.recentActivity(); }
}
