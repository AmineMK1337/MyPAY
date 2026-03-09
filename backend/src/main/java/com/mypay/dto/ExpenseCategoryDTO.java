package com.mypay.dto;

public class ExpenseCategoryDTO {
    private String name;
    private double amount;
    private String color;
    private double percentage;
    private String icon;

    public ExpenseCategoryDTO() {
    }

    public ExpenseCategoryDTO(String name, double amount, String color, double percentage, String icon) {
        this.name = name;
        this.amount = amount;
        this.color = color;
        this.percentage = percentage;
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
