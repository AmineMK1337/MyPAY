package com.mypay.service;

import com.mypay.dto.OnlinePaymentRequest;
import com.mypay.dto.OnlinePaymentResponse;
import com.mypay.model.Contract;
import com.mypay.model.Payment;
import com.mypay.repository.ContractRepository;
import com.mypay.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;

    public PaymentService(PaymentRepository paymentRepository, ContractRepository contractRepository) {
        this.paymentRepository = paymentRepository;
        this.contractRepository = contractRepository;
    }

    public OnlinePaymentResponse processOnlinePayment(String userId, OnlinePaymentRequest request) {
        validateRequest(request);

        if (request.getContractId() != null && !request.getContractId().isBlank()) {
            Contract contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new RuntimeException("Contract not found"));

            if (!userId.equals(contract.getUserId())) {
                throw new RuntimeException("Unauthorized contract access");
            }
        }

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setContractId(request.getContractId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("CARD");
        payment.setStatus("SUCCESS");
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

    public List<Contract> getActiveContracts(String userId) {
        return contractRepository.findByUserIdAndStatus(userId, "ACTIVE");
    }

    public double getMonthlyForecastTotal(String userId) {
        return getActiveContracts(userId).stream()
                .mapToDouble(Contract::getMonthlyPayment)
                .sum();
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
}
