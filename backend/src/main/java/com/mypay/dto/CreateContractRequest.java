package com.mypay.dto;

public class CreateContractRequest {
    private String contractType;
    private String contractName;
    private String provider;
    private double amount;
    private String dueDate;
    private String frequency;
    private NotificationSettings notifications;

    public static class NotificationSettings {
        private boolean notifyBefore;
        private boolean remindDays;
        private boolean alertDelay;

        public NotificationSettings() {
        }

        public NotificationSettings(boolean notifyBefore, boolean remindDays, boolean alertDelay) {
            this.notifyBefore = notifyBefore;
            this.remindDays = remindDays;
            this.alertDelay = alertDelay;
        }

        public boolean isNotifyBefore() {
            return notifyBefore;
        }

        public void setNotifyBefore(boolean notifyBefore) {
            this.notifyBefore = notifyBefore;
        }

        public boolean isRemindDays() {
            return remindDays;
        }

        public void setRemindDays(boolean remindDays) {
            this.remindDays = remindDays;
        }

        public boolean isAlertDelay() {
            return alertDelay;
        }

        public void setAlertDelay(boolean alertDelay) {
            this.alertDelay = alertDelay;
        }
    }

    public CreateContractRequest() {
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public String getContractName() {
        return contractName;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public NotificationSettings getNotifications() {
        return notifications;
    }

    public void setNotifications(NotificationSettings notifications) {
        this.notifications = notifications;
    }
}
