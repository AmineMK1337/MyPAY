package com.mypay.dto;

public class PaymentSummaryResponse {
    private int successCount;
    private double monthTotal;

    public PaymentSummaryResponse() {
    }

    public PaymentSummaryResponse(int successCount, double monthTotal) {
        this.successCount = successCount;
        this.monthTotal = monthTotal;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public double getMonthTotal() {
        return monthTotal;
    }

    public void setMonthTotal(double monthTotal) {
        this.monthTotal = monthTotal;
    }
}
