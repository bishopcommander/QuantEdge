package com.quantedge.prediction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/prediction")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/{symbol}")
    public ResponseEntity<PredictionService.PredictionResult> getPrediction(@PathVariable String symbol) {
        PredictionService.PredictionResult result = predictionService.generatePrediction(symbol);
        return ResponseEntity.ok(result);
    }
}
