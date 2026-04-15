package com.quantedge.backtest;

import com.quantedge.marketdata.HistoricalPrice;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/backtest")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BacktestController {

    private final BacktestService backtestService;

    public record BacktestRequest(String symbol, BigDecimal initialCapital) {}

    @PostMapping("/simulate")
    public ResponseEntity<BacktestService.BacktestResult> simulateBacktest(@RequestBody BacktestRequest request) {
        // Generate mock historical data
        List<HistoricalPrice> prices = new ArrayList<>();
        Random rnd = new Random(request.symbol().hashCode());
        double currentPrice = 100.0 + rnd.nextDouble() * 50.0;
        
        LocalDate date = LocalDate.now().minusDays(300);
        for (int i = 0; i < 300; i++) {
            HistoricalPrice hp = new HistoricalPrice();
            hp.setId(UUID.randomUUID());
            hp.setSymbol(request.symbol());
            hp.setTradeDate(date);
            
            double change = (rnd.nextDouble() - 0.48) * 5.0; // slight upward drift
            currentPrice += change;
            if (currentPrice < 1) currentPrice = 1;
            
            hp.setClosePrice(BigDecimal.valueOf(currentPrice));
            prices.add(hp);
            date = date.plusDays(1);
        }

        BacktestService.BacktestResult result = backtestService.simulateSMACrossover(prices, request.initialCapital());
        return ResponseEntity.ok(result);
    }
}
