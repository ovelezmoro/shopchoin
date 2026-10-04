package pe.edu.upn.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import pe.edu.upn.entity.Category;

public class CategoryDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @NotBlank @Size(max = 80)
    private String name;

    public CategoryDto() { }
    public CategoryDto(Category category) {
        id = category.getId();
        name = category.getName();
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
