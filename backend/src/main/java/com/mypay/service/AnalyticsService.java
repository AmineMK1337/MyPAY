package com.mypay.service;

import com.mypay.dto.*;
import com.mypay.model.Contract;
import com.mypay.model.Payment;
import com.mypay.repository.ContractRepository;
import com.mypay.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;

    public AnalyticsService(PaymentRepository paymentRepository, ContractRepository contractRepository) {
        this.paymentRepository = paymentRepository;
        this.contractRepository = contractRepository;
    }

    public List<PaymentHistoryDTO> getPaymentHistory(String userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        
        return payments.stream().map(payment -> {
            // Use description and category stored in payment record
            String description = payment.getDescription() != null ? payment.getDescription() : "Paiement";
            String category = payment.getCategory() != null ? payment.getCategory() : "bank";
            
            String status = payment.getStatus() != null ? payment.getStatus().toLowerCase() : "pending";
            if (status.equals("success")) {
                status = "paid";
            } else if (status.equals("failed")) {
                status = "late";
            }
            
            return new PaymentHistoryDTO(
                payment.getId(),
                description,
                payment.getAmount(),
                payment.getPaymentDate() != null ? payment.getPaymentDate() : LocalDateTime.now(),
                status,
                category
            );
        }).collect(Collectors.toList());
    }

    public MonthlyAnalyticsDTO getMonthlyAnalytics(String userId) {
        List<Contract> contracts = contractRepository.findByUserId(userId);
        List<Payment> payments = paymentRepository.findByUserId(userId);
        
        // Calculate total monthly expenses from active contracts
        double totalMonthlyExpenses = contracts.stream()
            .filter(c -> "ACTIVE".equals(c.getStatus()))
            .mapToDouble(Contract::getMonthlyPayment)
            .sum();
        
        // Set budget limit (can be made configurable per user)
        double budgetLimit = totalMonthlyExpenses > 0 ? totalMonthlyExpenses * 1.2 : 2500.0;
        
        // Group contracts by category
        Map<String, Double> categoryExpenses = contracts.stream()
            .filter(c -> "ACTIVE".equals(c.getStatus()))
            .collect(Collectors.groupingBy(
                this::determineCategory,
                Collectors.summingDouble(Contract::getMonthlyPayment)
            ));
        
        // Convert to expense category DTOs
        List<ExpenseCategoryDTO> expenseData = new ArrayList<>();
        Map<String, String> categoryColors = getCategoryColors();
        Map<String, String> categoryIcons = getCategoryIcons();
        
        categoryExpenses.forEach((category, amount) -> {
            double percentage = totalMonthlyExpenses > 0 ? (amount / totalMonthlyExpenses) * 100 : 0;
            expenseData.add(new ExpenseCategoryDTO(
                capitalize(category),
                amount,
                categoryColors.getOrDefault(category, "#8B5CF6"),
                Math.round(percentage * 10.0) / 10.0,
                categoryIcons.getOrDefault(category, "💰")
            ));
        });
        
        // Calculate monthly trends (last 6 months)
        List<MonthlyTrendDTO> monthlyTrend = calculateMonthlyTrends(userId, payments, totalMonthlyExpenses);
        
        return new MonthlyAnalyticsDTO(
            totalMonthlyExpenses,
            budgetLimit,
            expenseData,
            monthlyTrend
        );
    }

    private String determineCategory(Contract contract) {
        if (contract.getCategory() != null && !contract.getCategory().isEmpty()) {
            return contract.getCategory().toLowerCase();
        }
        
        // Infer from contract type
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

    private Map<String, String> getCategoryColors() {
        Map<String, String> colors = new HashMap<>();
        colors.put("insurance", "#00d4ff");
        colors.put("card", "#a78bfa");
        colors.put("subscription", "#10b981");
        colors.put("bank", "#f59e0b");
        colors.put("shopping", "#ef4444");
        return colors;
    }

    private Map<String, String> getCategoryIcons() {
        Map<String, String> icons = new HashMap<>();
        icons.put("insurance", "🛡️");
        icons.put("card", "💳");
        icons.put("subscription", "📡");
        icons.put("bank", "🏦");
        icons.put("shopping", "🛍️");
        return icons;
    }

    private List<MonthlyTrendDTO> calculateMonthlyTrends(String userId, List<Payment> payments, double projectedAmount) {
        List<MonthlyTrendDTO> trends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String monthName = month.format(formatter);
            
            // Calculate actual spending for past months
            if (i > 0) {
                double monthAmount = payments.stream()
                    .filter(p -> p.getPaymentDate() != null)
                    .filter(p -> {
                        LocalDateTime paymentDate = p.getPaymentDate();
                        return paymentDate.getYear() == month.getYear() && 
                               paymentDate.getMonthValue() == month.getMonthValue();
                    })
                    .mapToDouble(Payment::getAmount)
                    .sum();
                trends.add(new MonthlyTrendDTO(monthName, monthAmount));
            } else {
                // Current month: use projected amount
                trends.add(new MonthlyTrendDTO(monthName, projectedAmount));
            }
        }
        
        return trends;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
