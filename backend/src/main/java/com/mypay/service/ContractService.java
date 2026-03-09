package com.mypay.service;

import com.mypay.dto.CreateContractRequest;
import com.mypay.dto.ContractResponse;
import com.mypay.model.Contract;
import com.mypay.repository.ContractRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private final ContractRepository contractRepository;

    public ContractService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public ContractResponse createContract(String userId, CreateContractRequest request) {
        Contract contract = new Contract();
        contract.setUserId(userId);
        contract.setType(request.getContractType());
        contract.setDescription(request.getContractName());
        contract.setProvider(request.getProvider());
        contract.setMonthlyPayment(request.getAmount());
        contract.setDueDate(request.getDueDate());
        contract.setStartDate(java.time.LocalDate.now().toString());
        contract.setStatus("ACTIVE");
        contract.setCreatedAt(System.currentTimeMillis());
        contract.setUpdatedAt(System.currentTimeMillis());

        contract = contractRepository.save(contract);

        return convertToResponse(contract, request);
    }

    public List<ContractResponse> getContractsByUser(String userId) {
        List<Contract> contracts = contractRepository.findByUserId(userId);
        return contracts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ContractResponse> getActiveContractsByUser(String userId) {
        List<Contract> contracts = contractRepository.findByUserIdAndStatus(userId, "ACTIVE");
        return contracts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ContractResponse getContract(String contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        return convertToResponse(contract);
    }

    public ContractResponse updateContract(String contractId, CreateContractRequest request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setType(request.getContractType());
        contract.setDescription(request.getContractName());
        contract.setProvider(request.getProvider());
        contract.setMonthlyPayment(request.getAmount());
        contract.setDueDate(request.getDueDate());
        contract.setUpdatedAt(System.currentTimeMillis());

        contract = contractRepository.save(contract);

        return convertToResponse(contract, request);
    }

    public void deleteContract(String contractId) {
        contractRepository.deleteById(contractId);
    }

    private ContractResponse convertToResponse(Contract contract) {
        return new ContractResponse(
                contract.getId(),
                contract.getType(),
                contract.getDescription(),
                contract.getProvider(),
                contract.getMonthlyPayment(),
                contract.getDueDate(),
                "MONTHLY",
                contract.getStatus(),
                contract.getCreatedAt(),
                new ContractResponse.NotificationSettings(true, false, true));
    }

    private ContractResponse convertToResponse(Contract contract, CreateContractRequest request) {
        ContractResponse.NotificationSettings notifications = null;
        if (request.getNotifications() != null) {
            notifications = new ContractResponse.NotificationSettings(
                    request.getNotifications().isNotifyBefore(),
                    request.getNotifications().isRemindDays(),
                    request.getNotifications().isAlertDelay());
        } else {
            notifications = new ContractResponse.NotificationSettings(true, false, true);
        }

        return new ContractResponse(
                contract.getId(),
                contract.getType(),
                contract.getDescription(),
                contract.getProvider(),
                contract.getMonthlyPayment(),
                contract.getDueDate(),
                request.getFrequency(),
                contract.getStatus(),
                contract.getCreatedAt(),
                notifications);
    }
}
