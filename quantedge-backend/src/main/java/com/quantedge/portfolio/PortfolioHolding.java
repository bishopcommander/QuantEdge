package com.quantedge.portfolio;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "portfolio_holdings")
public class PortfolioHolding {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID portfolioId;
    private String symbol;
    private BigDecimal quantity;
    private BigDecimal averagePrice;
    private LocalDateTime createdAt = LocalDateTime.now();
}
