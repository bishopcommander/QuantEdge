package com.quantedge.portfolio;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolios")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    @GetMapping
    public ResponseEntity<List<PortfolioHolding>> getUserPortfolios() {
        PortfolioHolding h1 = new PortfolioHolding();
        h1.setId(java.util.UUID.randomUUID());
        h1.setSymbol("AAPL");
        h1.setQuantity(new java.math.BigDecimal("50"));
        h1.setAveragePrice(new java.math.BigDecimal("150.25"));

        PortfolioHolding h2 = new PortfolioHolding();
        h2.setId(java.util.UUID.randomUUID());
        h2.setSymbol("MSFT");
        h2.setQuantity(new java.math.BigDecimal("30"));
        h2.setAveragePrice(new java.math.BigDecimal("310.00"));

        PortfolioHolding h3 = new PortfolioHolding();
        h3.setId(java.util.UUID.randomUUID());
        h3.setSymbol("TSLA");
        h3.setQuantity(new java.math.BigDecimal("15"));
        h3.setAveragePrice(new java.math.BigDecimal("195.50"));

        return ResponseEntity.ok(List.of(h1, h2, h3));
    }
}
