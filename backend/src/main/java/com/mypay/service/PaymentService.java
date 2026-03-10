package com.mypay.service;

import com.mypay.dto.OnlinePaymentRequest;
import com.mypay.dto.OnlinePaymentResponse;
import com.mypay.model.Contract;
import com.mypay.model.Payment;
import com.mypay.repository.ContractRepository;
import com.mypay.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;

    public PaymentService(PaymentRepository paymentRepository, ContractRepository contractRepository) {
        this.paymentRepository = paymentRepository;
        this.contractRepository = contractRepository;
    }

    @Transactional
    public OnlinePaymentResponse processOnlinePayment(String userId, OnlinePaymentRequest request) {
        validateRequest(request);

        String description = "Paiement";
        String category = "bank";

        if (request.getContractId() != null && !request.getContractId().isBlank()) {
            Contract contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new RuntimeException("Contract not found"));

            if (!userId.equals(contract.getUserId())) {
                throw new RuntimeException("Unauthorized contract access");
            }

            // Store contract details in payment before contract is deleted
            description = contract.getDescription() != null ? contract.getDescription() : "Paiement de contrat";
            category = determineCategory(contract);
        }

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setContractId(request.getContractId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("CARD");
        payment.setStatus("SUCCESS");
        payment.setDescription(description);
        payment.setCategory(category);
        payment.setPaymentDate(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        return new OnlinePaymentResponse(
                payment.getId(),
                maskCard(request.getCardNumber()),
                payment.getStatus());
    }

    public List<Payment> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    private void validateRequest(OnlinePaymentRequest request) {
        if (request.getAmount() <= 0) {
            throw new RuntimeException("Invalid payment amount");
        }
        if (request.getCardNumber() == null || request.getCardNumber().isBlank()) {
            throw new RuntimeException("Card number is required");
        }
        if (request.getExpiry() == null || request.getExpiry().isBlank()) {
            throw new RuntimeException("Card expiry is required");
        }
        if (request.getCvc() == null || request.getCvc().isBlank()) {
            throw new RuntimeException("Card CVC is required");
        }
        if (request.getCardholderName() == null || request.getCardholderName().isBlank()) {
            throw new RuntimeException("Cardholder name is required");
        }
    }

    private String maskCard(String rawCardNumber) {
        String digits = rawCardNumber.replaceAll("\\D", "");
        String last4 = digits.length() >= 4 ? digits.substring(digits.length() - 4) : "0000";
        return "**** **** **** " + last4;
    }

    private String determineCategory(Contract contract) {
        if (contract.getCategory() != null && !contract.getCategory().isEmpty()) {
            return contract.getCategory().toLowerCase();
        }

        String type = contract.getType() != null ? contract.getType().toLowerCase() : "";
        if (type.contains("insurance")) {
            return "insurance";
        } else if (type.contains("loan")) {
            return "card";
        } else if (type.contains("leasing")) {
            return "card";
        }

        return "subscription";
    }
}
