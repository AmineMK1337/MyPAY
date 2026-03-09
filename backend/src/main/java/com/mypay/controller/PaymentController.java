package com.mypay.controller;

import com.mypay.dto.ApiResponse;
import com.mypay.dto.OnlinePaymentRequest;
import com.mypay.dto.OnlinePaymentResponse;
import com.mypay.model.Payment;
import com.mypay.repository.UserRepository;
import com.mypay.security.JwtUtils;
import com.mypay.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, JwtUtils jwtUtils, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @PostMapping("/online")
    public ResponseEntity<ApiResponse> payOnline(
            @RequestHeader("Authorization") String token,
            @RequestBody OnlinePaymentRequest request) {
        try {
            String userId = getUserIdFromToken(token);
            OnlinePaymentResponse response = paymentService.processOnlinePayment(userId, request);
            return ResponseEntity.ok(new ApiResponse(true, "Payment processed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse> getMyPayments(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            List<Payment> payments = paymentService.getPaymentsByUser(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Payments retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new ApiResponse(false, e.getMessage()));
        }
    }

    private String getUserIdFromToken(String token) {
        String email = jwtUtils.getEmailFromToken(token.replace("Bearer ", ""));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
