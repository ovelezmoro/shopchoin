package pe.edu.upn.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import pe.edu.upn.entity.Branch;

public class BranchDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @NotBlank @Size(max = 120)
    private String name;
    @NotBlank @Size(max = 250)
    private String address;
    @NotBlank @Size(max = 120)
    private String location;
    @NotNull
    private Boolean active = true;

    public BranchDto() { }
    public BranchDto(Branch branch) {
        id = branch.getId();
        name = branch.getName();
        address = branch.getAddress();
        location = branch.getLocation();
        active = branch.isActive();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
