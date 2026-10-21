import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('educore_token');
        localStorage.removeItem('educore_user');
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// User Management Services
export const userService = {
  getUsers: (params) => API.get('/users', { params }),
  createUser: (userData) => API.post('/users', userData),
  toggleStatus: (id) => API.patch(`/users/${id}/status`),
};

// Academic Services
export const academicService = {
  getDepartments: () => API.get('/academics/departments'),
  createDepartment: (data) => API.post('/academics/departments', data),
  getCourses: () => API.get('/academics/courses'),
  createCourse: (data) => API.post('/academics/courses', data),
  getAcademicYears: () => API.get('/academics/academic-years'),
};

// Admission Services
export const admissionService = {
  getAdmissions: (params) => API.get('/admissions', { params }),
  getAdmission: (id) => API.get(`/admissions/${id}`),
  createAdmission: (data) => API.post('/admissions', data),
  updateAdmission: (id, data) => API.put(`/admissions/${id}`, data),
};

// Fee Management Services
export const feeService = {
  getFeeStructures: () => API.get('/fees/structures'),
  createFeeStructure: (data) => API.post('/fees/structures', data),
  getStudentSchedule: (studentId) => API.get(`/fees/schedule/${studentId}`),
  collectOffline: (data) => API.post('/fees/collect-offline', data),
  getReceipts: (params) => API.get('/fees/receipts', { params }),
  getReceiptDetails: (receiptNo) => API.get(`/fees/receipts/${receiptNo}`),
  applyScholarship: (data) => API.post('/fees/scholarships', data),
};

// Online Payments (Student Gateway)
export const paymentService = {
  createOrder: (data) => API.post('/payments/create-order', data),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getMyHistory: () => API.get('/payments/my-history'),
};

// Leave Management
export const leaveService = {
  applyLeave: (data) => API.post('/leaves/apply', data),
  getMyLeaves: () => API.get('/leaves/my-leaves'),
  getAllLeaves: (params) => API.get('/leaves/all', { params }),
  decideLeave: (id, data) => API.patch(`/leaves/${id}/decision`, data),
};

// Payroll Management
export const payrollService = {
  getSalaryStructures: () => API.get('/payroll/salary-structures'),
  saveSalaryStructure: (data) => API.post('/payroll/salary-structures', data),
  previewCalculation: (data) => API.post('/payroll/calculate', data),
  generatePayroll: (data) => API.post('/payroll/generate', data),
  markPaid: (id) => API.patch(`/payroll/${id}/mark-paid`),
  getAllPayrolls: (params) => API.get('/payroll/all', { params }),
  getMyPayslips: () => API.get('/payroll/my-payslips'),
};

// Reports and Analytics
export const reportService = {
  getSummary: () => API.get('/reports/summary'),
};

// Audit Logs
export const auditService = {
  getAuditLogs: (params) => API.get('/audit', { params }),
};

export default API;
