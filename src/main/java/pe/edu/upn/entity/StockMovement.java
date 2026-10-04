package pe.edu.upn.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;
    private int quantity;
    @Column(nullable = false)
    private Instant date;
    @Column(nullable = false, length = 120)
    private String reference;
    @Column(nullable = false, length = 254)
    private String responsible;
    @Column(nullable = false, length = 1000)
    private String observation;

    public Long getId() { return id; }
    public Inventory getInventory() { return inventory; }
    public void setInventory(Inventory inventory) { this.inventory = inventory; }
    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }
    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }
}
