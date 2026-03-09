package com.mypay.dto;

public class MonthlyTrendDTO {
    private String month;
    private double amount;

    public MonthlyTrendDTO() {
    }

    public MonthlyTrendDTO(String month, double amount) {
        this.month = month;
        this.amount = amount;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}
