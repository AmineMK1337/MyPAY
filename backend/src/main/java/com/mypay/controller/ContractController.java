package com.mypay.controller;

import com.mypay.dto.CreateContractRequest;
import com.mypay.dto.ContractResponse;
import com.mypay.dto.ApiResponse;
import com.mypay.service.ContractService;
import com.mypay.security.JwtUtils;
import com.mypay.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:4200}")
public class ContractController {

    private static final Logger log = LoggerFactory.getLogger(ContractController.class);

    @Autowired
    private ContractService contractService;

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

    @PostMapping
    public ResponseEntity<ApiResponse> createContract(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateContractRequest request) {

        try {
            String userId = getUserIdFromToken(token);
            log.info("Creating contract for user: {}", userId);
            ContractResponse contract = contractService.createContract(userId, request);
            log.info("Contract created: {}", contract.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Contract created successfully", contract));
        } catch (Exception e) {
            log.error("Error creating contract: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getUserContracts(
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserIdFromToken(token);
            log.info("Fetching contracts for user: {}", userId);
            List<ContractResponse> contracts = contractService.getContractsByUser(userId);
            log.info("Found {} contracts", contracts.size());
            return ResponseEntity.ok(new ApiResponse(true, "Contracts retrieved successfully", contracts));
        } catch (Exception e) {
            log.error("Error fetching contracts: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse> getActiveContracts(
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserIdFromToken(token);
            List<ContractResponse> contracts = contractService.getActiveContractsByUser(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Active contracts retrieved successfully", contracts));
        } catch (Exception e) {
            log.error("Error fetching active contracts: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserIdFromToken(token);
            ContractResponse contract = contractService.getContractForUser(id, userId);
            return ResponseEntity.ok(new ApiResponse(true, "Contract retrieved successfully", contract));
        } catch (Exception e) {
            log.error("Error fetching contract: {}", e.getMessage());
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateContractRequest request) {

        try {
            String userId = getUserIdFromToken(token);
            ContractResponse contract = contractService.updateContractForUser(id, userId, request);
            return ResponseEntity.ok(new ApiResponse(true, "Contract updated successfully", contract));
        } catch (Exception e) {
            log.error("Error updating contract: {}", e.getMessage());
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserIdFromToken(token);
            contractService.deleteContractForUser(id, userId);
            return ResponseEntity.ok(new ApiResponse(true, "Contract deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting contract: {}", e.getMessage());
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }
}
