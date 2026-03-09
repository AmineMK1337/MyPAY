package com.mypay.controller;

import com.mypay.dto.CreateContractRequest;
import com.mypay.dto.ContractResponse;
import com.mypay.dto.ApiResponse;
import com.mypay.service.ContractService;
import com.mypay.security.JwtUtils;
import com.mypay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:4200")
public class ContractController {

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
            @RequestBody CreateContractRequest request) {

        try {
            String userId = getUserIdFromToken(token);
            System.out.println("✅ Creating contract for user: " + userId);
            ContractResponse contract = contractService.createContract(userId, request);
            System.out.println("✅ Contract created: " + contract.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Contract created successfully", contract));
        } catch (Exception e) {
            System.err.println("❌ Error creating contract: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getUserContracts(
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserIdFromToken(token);
            System.out.println("✅ Fetching contracts for user: " + userId);
            List<ContractResponse> contracts = contractService.getContractsByUser(userId);
            System.out.println("✅ Found " + contracts.size() + " contracts");
            return ResponseEntity.ok(new ApiResponse(true, "Contracts retrieved successfully", contracts));
        } catch (Exception e) {
            System.err.println("❌ Error fetching contracts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse> getActiveContracts(
            @RequestHeader("Authorization") String token) {

        String userId = getUserIdFromToken(token);
        List<ContractResponse> contracts = contractService.getActiveContractsByUser(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Active contracts retrieved successfully", contracts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        ContractResponse contract = contractService.getContract(id);
        return ResponseEntity.ok(new ApiResponse(true, "Contract retrieved successfully", contract));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token,
            @RequestBody CreateContractRequest request) {

        ContractResponse contract = contractService.updateContract(id, request);
        return ResponseEntity.ok(new ApiResponse(true, "Contract updated successfully", contract));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteContract(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        contractService.deleteContract(id);
        return ResponseEntity.ok(new ApiResponse(true, "Contract deleted successfully"));
    }
}
