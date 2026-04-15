package com.quantedge.risk;

import com.quantedge.marketdata.HistoricalPrice;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class RiskAnalysisService {

    public BigDecimal calculateDrawdown(List<HistoricalPrice> prices) {
        if (prices == null || prices.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal peak = prices.get(0).getClosePrice();
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        for (HistoricalPrice price : prices) {
            BigDecimal currentPrice = price.getClosePrice();
            if (currentPrice.compareTo(peak) > 0) {
                peak = currentPrice;
            }

            BigDecimal drawdown = peak.subtract(currentPrice).divide(peak, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        return maxDrawdown;
    }

    public BigDecimal calculateVolatility(List<HistoricalPrice> prices) {
        // A simplified daily volatility calculation
        if (prices == null || prices.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal mean = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(prices.size()), 4, RoundingMode.HALF_UP);

        BigDecimal varianceSum = BigDecimal.ZERO;
        for (HistoricalPrice price : prices) {
            BigDecimal diff = price.getClosePrice().subtract(mean);
            varianceSum = varianceSum.add(diff.multiply(diff));
        }

        BigDecimal variance = varianceSum.divide(new BigDecimal(prices.size()), 4, RoundingMode.HALF_UP);
        return new BigDecimal(Math.sqrt(variance.doubleValue())).setScale(4, RoundingMode.HALF_UP);
    }
}
