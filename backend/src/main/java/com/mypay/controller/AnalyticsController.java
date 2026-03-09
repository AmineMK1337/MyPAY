package com.mypay.controller;

import com.mypay.dto.ApiResponse;
import com.mypay.dto.MonthlyAnalyticsDTO;
import com.mypay.dto.PaymentHistoryDTO;
import com.mypay.repository.UserRepository;
import com.mypay.security.JwtUtils;
import com.mypay.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:4200}")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    private String getUserIdFromToken(String token) {
        String email = jwtUtils.getEmailFromToken(token.replace("Bearer ", ""));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping("/payment-history")
    public ResponseEntity<ApiResponse> getPaymentHistory(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            log.info("Fetching payment history for user: {}", userId);
            List<PaymentHistoryDTO> history = analyticsService.getPaymentHistory(userId);
            log.info("Found {} payment records", history.size());
            return ResponseEntity.ok(new ApiResponse(true, "Payment history retrieved successfully", history));
        } catch (Exception e) {
            log.error("Error fetching payment history: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/monthly-forecast")
    public ResponseEntity<ApiResponse> getMonthlyForecast(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            log.info("Fetching monthly forecast for user: {}", userId);
            MonthlyAnalyticsDTO analytics = analyticsService.getMonthlyAnalytics(userId);
            log.info("Calculated analytics with {} categories", analytics.getExpenseData().size());
            return ResponseEntity.ok(new ApiResponse(true, "Monthly forecast retrieved successfully", analytics));
        } catch (Exception e) {
            log.error("Error fetching monthly forecast: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }
}
