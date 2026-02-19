package com.mypay.repository;

import com.mypay.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByUserId(String userId);

    List<Payment> findByContractId(String contractId);

    List<Payment> findByUserIdAndStatus(String userId, String status);
}
