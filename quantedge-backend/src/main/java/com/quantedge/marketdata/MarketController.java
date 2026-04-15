package com.quantedge.marketdata;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MarketController {

    // A placeholder for the MarketData repository
    // private final HistoricalPriceRepository priceRepository;

    @GetMapping("/trend/{symbol}")
    public ResponseEntity<java.util.Map<String, String>> getTrend(@PathVariable String symbol, @RequestParam(defaultValue = "100") int lookbackDays) {
        
        // Mocked retrieval using deterministic seeded random
        java.util.Random rnd = new java.util.Random(symbol.hashCode());
        boolean isBull = rnd.nextBoolean();
        
        String trend = isBull ? "BULLISH" : "BEARISH";
        String sma50 = String.format("%.2f", 100 + rnd.nextDouble() * 100);
        String sma200 = String.format("%.2f", 100 + rnd.nextDouble() * 100);
        String rsi = String.format("%.2f", 30 + rnd.nextDouble() * 40);

        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("symbol", symbol);
        result.put("trend", trend);
        result.put("sma50", sma50);
        result.put("sma200", sma200);
        result.put("rsi14", rsi);

        return ResponseEntity.ok(result);
    }
    @GetMapping("/history/{symbol}")
    public ResponseEntity<java.util.List<HistoricalPrice>> getHistory(@PathVariable String symbol, @RequestParam(defaultValue = "100") int days) {
        java.util.List<HistoricalPrice> prices = new java.util.ArrayList<>();
        java.util.Random rnd = new java.util.Random(symbol.hashCode());
        double currentPrice = 100.0 + rnd.nextDouble() * 50.0;
        
        java.time.LocalDate date = java.time.LocalDate.now().minusDays(days);
        for (int i = 0; i < days; i++) {
            HistoricalPrice hp = new HistoricalPrice();
            hp.setId(java.util.UUID.randomUUID());
            hp.setSymbol(symbol);
            hp.setTradeDate(date);
            
            double dailyChange = (rnd.nextDouble() - 0.49) * 3.0;
            currentPrice += dailyChange;
            double open = currentPrice;
            double high = open + rnd.nextDouble() * 2;
            double low = open - rnd.nextDouble() * 2;
            double close = open + (rnd.nextDouble() - 0.5) * 2;
            
            hp.setOpenPrice(java.math.BigDecimal.valueOf(open));
            hp.setHighPrice(java.math.BigDecimal.valueOf(high));
            hp.setLowPrice(java.math.BigDecimal.valueOf(low));
            hp.setClosePrice(java.math.BigDecimal.valueOf(close));
            hp.setVolume((long) (1000000 + rnd.nextDouble() * 5000000));
            
            prices.add(hp);
            date = date.plusDays(1);
        }
        return ResponseEntity.ok(prices);
    }
}
