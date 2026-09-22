/**
 * Display labels for Prisma enums.
 *
 * The database stores SCREAMING_SNAKE enum values; the portal UI has always
 * rendered title-case strings ("Expiring Soon", "Awaiting Customer"). These
 * helpers are the single translation point between the two, so the styling
 * maps in `portal-ui.tsx` and the copy on the pages stay unchanged.
 */

import type {
  BillingCycle,
  Department,
  InvoiceStatus,
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Priority,
  ServiceStatus,
  ServiceType,
  TicketStatus,
} from "@/generated/prisma/client";

export function serviceStatusLabel(status: ServiceStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING":
      return "Pending";
    case "EXPIRING_SOON":
      return "Expiring Soon";
    case "SUSPENDED":
      return "Suspended";
    case "TERMINATED":
      return "Terminated";
  }
}

export function serviceTypeLabel(type: ServiceType) {
  switch (type) {
    case "HOSTING":
      return "Hosting";
    case "DOMAIN":
      return "Domain";
    case "WEBSITE":
      return "Website";
    case "MARKETING":
      return "Marketing";
    case "COMPLIANCE":
      return "Compliance";
    case "EMAIL":
      return "Email";
    case "SOFTWARE":
      return "Software";
    case "OTHER":
      return "Other";
  }
}

export function ticketStatusLabel(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "AWAITING_CUSTOMER":
      return "Awaiting Customer";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
  }
}

export function invoiceStatusLabel(status: InvoiceStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "UNPAID":
      return "Unpaid";
    case "OVERDUE":
      return "Overdue";
    case "PAID":
      return "Paid";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
  }
}

export function orderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "PROVISIONED":
      return "Provisioned";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function departmentLabel(department: Department) {
  switch (department) {
    case "TECHNICAL":
      return "Technical Support";
    case "BILLING":
      return "Billing Support";
    case "SALES":
      return "Sales Enquiries";
  }
}

export function priorityLabel(priority: Priority) {
  switch (priority) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
  }
}

export function paymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "PAYNOW_ECOCASH":
      return "EcoCash";
    case "PAYNOW_ONEMONEY":
      return "OneMoney";
    case "PAYNOW_CARD":
      return "Card payment";
    case "BANK_TRANSFER":
      return "Bank transfer";
    case "CASH":
      return "Cash";
  }
}

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "CANCELLED":
      return "Cancelled";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
  }
}

export function notificationTypeLabel(type: NotificationType) {
  switch (type) {
    case "INVOICE":
      return "Invoice";
    case "PAYMENT":
      return "Payment";
    case "DUE":
      return "Due";
    case "DOMAIN":
      return "Domain";
    case "HOSTING":
      return "Hosting";
    case "RENEWAL":
      return "Renewal";
    case "SUSPENSION":
      return "Suspension";
    case "TICKET":
      return "Ticket";
    case "SECURITY":
      return "Security";
  }
}

/** The "/mo" or "/yr" suffix shown beside a recurring price. */
export function cycleSuffix(cycle: BillingCycle) {
  switch (cycle) {
    case "MONTHLY":
      return "mo";
    case "ANNUALLY":
      return "yr";
    case "ONE_OFF":
      return "once";
  }
}

/** Date and time as the ticket thread shows it, e.g. "15 August 2026, 09:12". */
export function formatDateTime(date: Date) {
  return `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
