package pe.edu.upn.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public class OrderRequest {
    @NotBlank @Size(max = 160)
    private String customer;
    @NotBlank @Size(max = 30)
    private String customerDocument;
    @NotNull @Positive
    private Long branchId;
    @NotNull @Size(max = 1000)
    private String observations = "";
    @NotEmpty @Size(max = 100) @Valid
    private List<@NotNull OrderItemRequest> items;

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }
    public String getCustomerDocument() { return customerDocument; }
    public void setCustomerDocument(String customerDocument) { this.customerDocument = customerDocument; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
