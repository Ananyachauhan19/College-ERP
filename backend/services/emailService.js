const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[Email] Configured custom SMTP transporter.');
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Initialized Ethereal test mailer: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email] Failed to create test email account, using mock logger.', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log(`[Email Mock Sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
          return { messageId: 'mock-' + Date.now() };
        },
      };
    }
  }

  return transporter;
}

/**
 * Sends email asynchronously and logs the event to NotificationLog.
 */
async function sendNotificationEmail({ to, subject, html, eventType, relatedId = null }) {
  try {
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"EduCore College ERP" <admissions@educore.edu>',
      to,
      subject,
      html,
    };

    const info = await mailer.sendMail(mailOptions);
    let previewUrl = null;
    if (typeof nodemailer.getTestMessageUrl === 'function') {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      if (previewUrl) {
        console.log(`[Email Sent] Preview URL: ${previewUrl}`);
      }
    }

    await NotificationLog.create({
      recipientEmail: to,
      subject,
      eventType,
      status: 'sent',
      previewUrl,
      relatedId,
    });

    return { success: true, previewUrl };
  } catch (err) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err.message);
    await NotificationLog.create({
      recipientEmail: to,
      subject,
      eventType,
      status: 'failed',
      error: err.message,
      relatedId,
    });
    return { success: false, error: err.message };
  }
}

// 1. Admission Confirmation Email
async function sendAdmissionConfirmation({ student, courseName, defaultPassword }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Welcome to EduCore Institute!</h2>
      <p>Dear <strong>${student.name}</strong>,</p>
      <p>Your admission has been confirmed successfully for the course <strong>${courseName}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Admission No:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${student.admissionNo}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Total Course Fee:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">₹${student.totalCourseFee.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Payment Plan:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${student.paymentFrequency.toUpperCase()}</td></tr>
      </table>
      <div style="background: #eef2ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h4 style="margin-top: 0; color: #3730a3;">Portal Access Credentials:</h4>
        <p style="margin: 4px 0;"><strong>Username:</strong> ${student.email}</p>
        <p style="margin: 4px 0;"><strong>Default Password:</strong> ${defaultPassword}</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Please log in to your Student Dashboard to view your fee schedule, upcoming due dates, and make payments online.</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;

  return sendNotificationEmail({
    to: student.email,
    subject: `Admission Confirmation - Admission No: ${student.admissionNo}`,
    html,
    eventType: 'ADMISSION_CONFIRMATION',
    relatedId: student._id,
  });
}

// 2. Payment Receipt Email
async function sendPaymentReceiptEmail({ student, receipt, transaction }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Payment Receipt Confirmed</h2>
      <p>Dear <strong>${student.name}</strong>,</p>
      <p>We acknowledge receipt of your fee payment. The details are as follows:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Receipt No:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${receipt.receiptNo}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Fee Period:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${receipt.periodName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Amount Received:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">₹${receipt.amountPaid.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Payment Mode:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${receipt.paymentMode.toUpperCase()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Transaction Reference:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${transaction.transactionNo}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Remaining Period Balance:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">₹${receipt.remainingBalance.toLocaleString()}</td></tr>
      </table>
      <p>You can download the full PDF receipt anytime from your Student Portal under <strong>Payment History</strong>.</p>
      <p style="color: #64748b; font-size: 12px;">Office of Financial Operations, EduCore College ERP.</p>
    </div>
  `;

  return sendNotificationEmail({
    to: student.email,
    subject: `Fee Payment Receipt - ${receipt.receiptNo}`,
    html,
    eventType: 'PAYMENT_RECEIPT',
    relatedId: receipt._id,
  });
}

// 3. Leave Decision Email
async function sendLeaveDecisionEmail({ teacher, leaveRequest }) {
  const isApproved = leaveRequest.status === 'approved';
  const color = isApproved ? '#10b981' : '#ef4444';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">Leave Request ${isApproved ? 'Approved' : 'Rejected'}</h2>
      <p>Dear <strong>${teacher.name}</strong>,</p>
      <p>Your leave application from <strong>${new Date(leaveRequest.startDate).toLocaleDateString()}</strong> to <strong>${new Date(leaveRequest.endDate).toLocaleDateString()}</strong> (${leaveRequest.totalDays} day(s)) has been <strong>${leaveRequest.status.toUpperCase()}</strong> by the Administration.</p>
      <div style="background: #f8fafc; padding: 12px; border-left: 4px solid ${color}; margin: 15px 0;">
        <p style="margin: 0;"><strong>Administrator Remarks:</strong> ${leaveRequest.decisionRemarks || 'No remarks provided.'}</p>
      </div>
      <p>Please check your Teacher Dashboard for updated leave balance details.</p>
      <p style="color: #64748b; font-size: 12px;">Human Resources & Academic Administration.</p>
    </div>
  `;

  return sendNotificationEmail({
    to: teacher.email,
    subject: `Leave Request Update: ${leaveRequest.status.toUpperCase()} (${leaveRequest.leaveType.toUpperCase()})`,
    html,
    eventType: 'LEAVE_DECISION',
    relatedId: leaveRequest._id,
  });
}

// 4. Payslip Generation Email
async function sendPayslipEmail({ teacher, payroll }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Monthly Payslip Available - ${payroll.payrollMonth}</h2>
      <p>Dear <strong>${teacher.name}</strong>,</p>
      <p>Your payslip for the month of <strong>${payroll.payrollMonth}</strong> has been generated.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Base Salary:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">₹${payroll.baseSalary.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Allowances:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">+ ₹${payroll.allowances.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Leave Deductions:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626;">- ₹${payroll.leaveDeduction.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Net Payable:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">₹${payroll.netPayable.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Payment Status:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${payroll.status.toUpperCase()}</td></tr>
      </table>
      <p>Log in to your Teacher Portal to view your complete breakdown and download your payslip.</p>
      <p style="color: #64748b; font-size: 12px;">Finance & Payroll Department.</p>
    </div>
  `;

  return sendNotificationEmail({
    to: teacher.email,
    subject: `Monthly Payslip Generated - ${payroll.payrollMonth}`,
    html,
    eventType: 'PAYSLIP_GENERATED',
    relatedId: payroll._id,
  });
}

module.exports = {
  sendAdmissionConfirmation,
  sendPaymentReceiptEmail,
  sendLeaveDecisionEmail,
  sendPayslipEmail,
};
