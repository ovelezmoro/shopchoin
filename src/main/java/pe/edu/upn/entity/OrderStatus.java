package pe.edu.upn.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum OrderStatus {
    PENDING("Pendiente"), PREPARING("En preparación"), READY("Listo para retiro"),
    COMPLETED("Completado"), CANCELLED("Cancelado");

    private final String label;

    OrderStatus(String label) { this.label = label; }

    @JsonValue
    public String label() { return label; }

}
