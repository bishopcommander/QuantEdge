package com.quantedge.backtest;

import com.quantedge.indicators.TechnicalIndicatorService;
import com.quantedge.marketdata.HistoricalPrice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BacktestService {

    private final TechnicalIndicatorService indicatorService;

    public BacktestResult simulateSMACrossover(List<HistoricalPrice> prices, BigDecimal initialCapital) {
        if (prices == null || prices.size() < 200) {
            return new BacktestResult(initialCapital, initialCapital, BigDecimal.ZERO);
        }

        boolean inPosition = false;
        BigDecimal capital = initialCapital;
        BigDecimal holdings = BigDecimal.ZERO;

        for (int i = 200; i < prices.size(); i++) {
            List<HistoricalPrice> window = prices.subList(0, i + 1);
            BigDecimal sma50 = indicatorService.calculateSMA(window, 50);
            BigDecimal sma200 = indicatorService.calculateSMA(window, 200);
            
            BigDecimal currentPrice = prices.get(i).getClosePrice();

            if (sma50.compareTo(sma200) > 0 && !inPosition) {
                // Buy signal
                holdings = capital.divide(currentPrice, 4, RoundingMode.DOWN);
                capital = capital.subtract(holdings.multiply(currentPrice));
                inPosition = true;
            } else if (sma50.compareTo(sma200) < 0 && inPosition) {
                // Sell signal
                capital = capital.add(holdings.multiply(currentPrice));
                holdings = BigDecimal.ZERO;
                inPosition = false;
            }
        }

        // Close any open positions at the end
        if (inPosition) {
            BigDecimal lastPrice = prices.get(prices.size() - 1).getClosePrice();
            capital = capital.add(holdings.multiply(lastPrice));
        }

        BigDecimal netProfit = capital.subtract(initialCapital);
        return new BacktestResult(initialCapital, capital, netProfit);
    }

    public record BacktestResult(BigDecimal initialCapital, BigDecimal finalCapital, BigDecimal netProfit) {}
}
