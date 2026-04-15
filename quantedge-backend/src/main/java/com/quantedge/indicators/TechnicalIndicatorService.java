package com.quantedge.indicators;

import com.quantedge.marketdata.HistoricalPrice;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TechnicalIndicatorService {

    public BigDecimal calculateSMA(List<HistoricalPrice> prices, int period) {
        if (prices == null || prices.size() < period) {
            return BigDecimal.ZERO;
        }
        
        List<HistoricalPrice> recentPrices = prices.subList(prices.size() - period, prices.size());
        BigDecimal sum = recentPrices.stream()
                .map(HistoricalPrice::getClosePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateRSI(List<HistoricalPrice> prices, int period) {
        if (prices == null || prices.size() <= period) {
            return BigDecimal.ZERO;
        }

        BigDecimal gainSum = BigDecimal.ZERO;
        BigDecimal lossSum = BigDecimal.ZERO;

        // Calculate initial Average Gain and Average Loss
        for (int i = prices.size() - period; i < prices.size(); i++) {
            BigDecimal currentPrice = prices.get(i).getClosePrice();
            BigDecimal previousPrice = prices.get(i - 1).getClosePrice();
            BigDecimal change = currentPrice.subtract(previousPrice);

            if (change.compareTo(BigDecimal.ZERO) > 0) {
                gainSum = gainSum.add(change);
            } else {
                lossSum = lossSum.add(change.abs());
            }
        }

        BigDecimal averageGain = gainSum.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);
        BigDecimal averageLoss = lossSum.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);

        if (averageLoss.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("100.00");
        }

        BigDecimal rs = averageGain.divide(averageLoss, 4, RoundingMode.HALF_UP);
        BigDecimal rsi = new BigDecimal("100.00").subtract(
                new BigDecimal("100.00").divide(BigDecimal.ONE.add(rs), 4, RoundingMode.HALF_UP)
        );

        return rsi;
    }

    public String analyzeTrend(List<HistoricalPrice> prices) {
        BigDecimal sma50 = calculateSMA(prices, 50);
        BigDecimal sma200 = calculateSMA(prices, 200);
        BigDecimal rsi14 = calculateRSI(prices, 14);

        if (sma50.compareTo(sma200) > 0 && rsi14.compareTo(new BigDecimal("50")) > 0) {
            return "BULLISH";
        } else if (sma50.compareTo(sma200) < 0 && rsi14.compareTo(new BigDecimal("50")) < 0) {
            return "BEARISH";
        }
        return "NEUTRAL";
    }
}
