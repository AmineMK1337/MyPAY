package com.mypay.dto;

public class OnlinePaymentResponse {
    private String paymentId;
    private String maskedCard;
    private String status;

    public OnlinePaymentResponse() {
    }

    public OnlinePaymentResponse(String paymentId, String maskedCard, String status) {
        this.paymentId = paymentId;
        this.maskedCard = maskedCard;
        this.status = status;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getMaskedCard() {
        return maskedCard;
    }

    public void setMaskedCard(String maskedCard) {
        this.maskedCard = maskedCard;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
