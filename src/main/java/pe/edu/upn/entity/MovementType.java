package pe.edu.upn.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum MovementType {
    ENTRY("ENTRADA"), EXIT("SALIDA"), REPLENISHMENT("REPOSICIÓN");

    private final String label;

    MovementType(String label) { this.label = label; }

    @JsonValue
    public String label() { return label; }
}
