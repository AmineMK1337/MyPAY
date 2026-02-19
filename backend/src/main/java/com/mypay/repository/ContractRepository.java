package com.mypay.repository;

import com.mypay.model.Contract;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends MongoRepository<Contract, String> {

    List<Contract> findByUserId(String userId);

    List<Contract> findByUserIdAndStatus(String userId, String status);
}
