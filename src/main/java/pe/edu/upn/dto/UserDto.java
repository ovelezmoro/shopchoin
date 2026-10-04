package pe.edu.upn.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import pe.edu.upn.entity.User;
import pe.edu.upn.entity.UserRole;

public class UserDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @NotBlank @Size(max = 120)
    private String names;
    @NotBlank @Email @Size(max = 254)
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 8, max = 72)
    private String password;
    @NotNull
    private UserRole role;
    @NotNull
    private Boolean active = true;

    public UserDto() { }
    public UserDto(User user) {
        id = user.getId();
        names = user.getNames();
        email = user.getEmail();
        role = user.getRole();
        active = user.isActive();
    }

    public Long getId() { return id; }
    public String getNames() { return names; }
    public void setNames(String names) { this.names = names; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
