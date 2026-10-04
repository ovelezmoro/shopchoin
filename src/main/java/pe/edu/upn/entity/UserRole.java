package pe.edu.upn.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    ADMIN("ADMINISTRADOR"), WAREHOUSE("ALMACÉN"), STORE("TIENDA");

    private final String label;

    UserRole(String label) { this.label = label; }

    @JsonValue
    public String label() { return label; }
}
