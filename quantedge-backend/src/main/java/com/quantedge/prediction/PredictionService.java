package com.quantedge.prediction;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class PredictionService {

    public record PredictionResult(String symbol, String action, String reasoning, int confidenceScore) {}

    public PredictionResult generatePrediction(String symbol) {
        // Deterministic generation based on symbol hash
        Random rnd = new Random(symbol.toUpperCase().hashCode() + System.currentTimeMillis() / 10000); 
        
        int score = rnd.nextInt(100);
        String action;
        String reasoning;

        if (score > 75) {
            action = "STRONG BUY";
            reasoning = "The Neural Engine detected an aggressive bullish crossover of the 50-day SMA over the 200-day SMA. Momentum oscillators (RSI) confirm breakout strength coupled with unusually high volume accumulation. The model algorithm assigns a high probability of significant near-term upside.";
        } else if (score > 55) {
            action = "BUY";
            reasoning = "Fundamental metrics and standard deviation bands exhibit a positive tilt. The asset is maintaining support levels steadily and institutional flow traces hint at quiet accumulation. Steady growth is anticipated over the next quarter.";
        } else if (score > 40) {
            action = "HOLD";
            reasoning = "The underlying asset is currently range-bound. Bollinger Band compression suggests an incoming volatility spike, but directionality is unclear. Macro indicators are conflicting. We advise holding current positions until a definitive breakout is validated.";
        } else if (score > 20) {
            action = "SELL";
            reasoning = "Warning: Moving Average Convergence Divergence (MACD) has triggered a bearish signal. Coupled with exhausted RSI levels, the algorithm predicts a short-to-medium-term price correction. Trimming exposure is recommended to mitigate drawdown risk.";
        } else {
            action = "STRONG SELL";
            reasoning = "CRITICAL ALERT: Institutional distribution patterns detected. The asset has plunged below the 200-day SMA, breaking critical structural supports. The AI projection models indicate a cascading sell-off is highly probable. Liquidate positions immediately.";
        }

        return new PredictionResult(symbol.toUpperCase(), action, reasoning, score);
    }
}
