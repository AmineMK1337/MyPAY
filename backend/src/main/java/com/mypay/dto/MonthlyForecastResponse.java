package com.mypay.dto;

public class MonthlyForecastResponse {
    private double totalMonthlyPayment;
    private int activeContracts;

    public MonthlyForecastResponse(double totalMonthlyPayment, int activeContracts) {
        this.totalMonthlyPayment = totalMonthlyPayment;
        this.activeContracts = activeContracts;
    }

    public double getTotalMonthlyPayment() {
        return totalMonthlyPayment;
    }

    public void setTotalMonthlyPayment(double totalMonthlyPayment) {
        this.totalMonthlyPayment = totalMonthlyPayment;
    }

    public int getActiveContracts() {
        return activeContracts;
    }

    public void setActiveContracts(int activeContracts) {
        this.activeContracts = activeContracts;
    }
}
