module.exports = {
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMISSION_CELL: 'ADMISSION_CELL',
    FEE_OPERATION: 'FEE_OPERATION',
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
  },
  
  PAYMENT_FREQUENCIES: {
    YEARLY: 'yearly',
    SEMESTER: 'semester',
    INSTALLMENT: 'installment',
  },
  
  PAYMENT_MODES: {
    CASH: 'cash',
    CHEQUE: 'cheque',
    BANK_TRANSFER: 'bank_transfer',
    ONLINE: 'online',
  },
  
  FEE_STATUS: {
    PENDING: 'pending',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue',
  },
  
  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },
  
  LEAVE_TYPES: {
    CASUAL: 'casual',
    SICK: 'sick',
    EARNED: 'earned',
    UNPAID: 'unpaid',
  },
  
  PAYROLL_STATUS: {
    DRAFT: 'draft',
    FINALIZED: 'finalized',
    PAID: 'paid',
  },
  
  SALARY_CALCULATION_TYPES: {
    MONTHLY: 'monthly',
    PER_DAY: 'per_day',
  },
};
