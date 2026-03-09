package com.mypay.dto;

import java.util.List;

public class MonthlyAnalyticsDTO {
    private double projectedExpenses;
    private double budgetLimit;
    private List<ExpenseCategoryDTO> expenseData;
    private List<MonthlyTrendDTO> monthlyTrend;

    public MonthlyAnalyticsDTO() {
    }

    public MonthlyAnalyticsDTO(double projectedExpenses, double budgetLimit, 
                               List<ExpenseCategoryDTO> expenseData, 
                               List<MonthlyTrendDTO> monthlyTrend) {
        this.projectedExpenses = projectedExpenses;
        this.budgetLimit = budgetLimit;
        this.expenseData = expenseData;
        this.monthlyTrend = monthlyTrend;
    }

    public double getProjectedExpenses() {
        return projectedExpenses;
    }

    public void setProjectedExpenses(double projectedExpenses) {
        this.projectedExpenses = projectedExpenses;
    }

    public double getBudgetLimit() {
        return budgetLimit;
    }

    public void setBudgetLimit(double budgetLimit) {
        this.budgetLimit = budgetLimit;
    }

    public List<ExpenseCategoryDTO> getExpenseData() {
        return expenseData;
    }

    public void setExpenseData(List<ExpenseCategoryDTO> expenseData) {
        this.expenseData = expenseData;
    }

    public List<MonthlyTrendDTO> getMonthlyTrend() {
        return monthlyTrend;
    }

    public void setMonthlyTrend(List<MonthlyTrendDTO> monthlyTrend) {
        this.monthlyTrend = monthlyTrend;
    }
}
