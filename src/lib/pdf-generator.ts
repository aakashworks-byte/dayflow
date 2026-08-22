import { formatINR } from "./utils";
import { Payslip, Employee } from "@/types/hrms";

export async function generatePayslipPDF(slip: Payslip, user?: Employee | null) {
  // Dynamically load jsPDF on-demand only when downloading
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const employeeName = user?.display_name || slip.employee_name;
  const employeeCode = user?.employee_code || slip.employee_code;
  const designation = user?.job_title || slip.designation;
  const department = user?.department_name || slip.department_name;
  const salary = user?.salary_structure || slip.structure;

  // Background Header Accent
  doc.setFillColor(124, 58, 237); // Purple #7C3AED
  doc.rect(0, 0, 210, 30, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ACME CORPORATION", 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103 • CIN: U72200KA2023PTC112233", 14, 19);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL YEAR: FY 2026-27 | ASSESSMENT YEAR: AY 2027-28", 14, 25);

  // Payslip Period Badge (Top Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`SALARY SLIP: ${slip.month.toUpperCase()}`, 196, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Pay Period: 1st - 31st ${slip.month}`, 196, 19, { align: "right" });
  doc.text(`Disbursed On: ${slip.payment_date}`, 196, 25, { align: "right" });

  // Employee Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 35, 182, 38, 2, 2, "FD");

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EMPLOYEE & FINANCIAL YEAR SUMMARY", 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  // Column 1
  doc.text(`Employee Name:`, 18, 49);
  doc.setFont("helvetica", "bold");
  doc.text(`${employeeName}`, 50, 49);
  doc.setFont("helvetica", "normal");

  doc.text(`Employee ID:`, 18, 55);
  doc.setFont("helvetica", "bold");
  doc.text(`${employeeCode}`, 50, 55);
  doc.setFont("helvetica", "normal");

  doc.text(`Department:`, 18, 61);
  doc.text(`${department}`, 50, 61);

  doc.text(`Designation:`, 18, 67);
  doc.text(`${designation}`, 50, 67);

  // Column 2
  doc.text(`Tax Regime:`, 110, 49);
  doc.setFont("helvetica", "bold");
  doc.text(`Section 115BAC (New)`, 145, 49);
  doc.setFont("helvetica", "normal");

  doc.text(`Bank Account:`, 110, 55);
  doc.text(`${slip.account_number_masked}`, 145, 55);

  doc.text(`PAN Number:`, 110, 61);
  doc.text(`${slip.pan_masked}`, 145, 61);

  doc.text(`UAN Number:`, 110, 67);
  doc.text(`${slip.uan_number}`, 145, 67);

  // Earnings & Deductions Tables
  let startY = 80;

  // Earnings Header
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, startY, 88, 8, 1, 1, "F");
  doc.setTextColor(67, 56, 202);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("GROSS EARNINGS", 18, startY + 5.5);
  doc.text("AMOUNT (INR)", 98, startY + 5.5, { align: "right" });

  // Deductions Header
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(108, startY, 88, 8, 1, 1, "F");
  doc.setTextColor(185, 28, 28);
  doc.text("DEDUCTIONS & TAX", 112, startY + 5.5);
  doc.text("AMOUNT (INR)", 192, startY + 5.5, { align: "right" });

  // Items Rows
  const earningsItems = [
    { label: "Basic Salary", amount: salary.basic },
    { label: "House Rent Allowance (HRA)", amount: salary.hra },
    { label: "Special Allowance", amount: salary.special_allowance },
    { label: "Conveyance Allowance", amount: salary.conveyance_allowance },
    { label: "Medical Allowance", amount: salary.medical_allowance },
  ];

  const deductionsItems = [
    { label: "Provident Fund (PF)", amount: salary.provident_fund },
    { label: "Professional Tax (PT)", amount: salary.professional_tax },
    { label: "Income Tax (TDS / Sec 192)", amount: salary.income_tax_tds },
    { label: "Voluntary PF / Other", amount: 0 },
    { label: "Leave Deductions", amount: 0 },
  ];

  let currentY = startY + 14;
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  for (let i = 0; i < 5; i++) {
    // Earnings row
    doc.text(earningsItems[i].label, 18, currentY);
    doc.text(formatINR(earningsItems[i].amount), 98, currentY, { align: "right" });

    // Deductions row
    doc.text(deductionsItems[i].label, 112, currentY);
    doc.text(formatINR(deductionsItems[i].amount), 192, currentY, { align: "right" });

    // Subtle divider line
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 2, 102, currentY + 2);
    doc.line(108, currentY + 2, 196, currentY + 2);

    currentY += 8;
  }

  // Totals Row
  currentY += 2;
  doc.setFillColor(243, 244, 246);
  doc.rect(14, currentY, 88, 8, "F");
  doc.rect(108, currentY, 88, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Total Gross Earnings", 18, currentY + 5.5);
  doc.text(formatINR(salary.gross_earnings), 98, currentY + 5.5, { align: "right" });

  doc.text("Total Deductions", 112, currentY + 5.5);
  doc.text(formatINR(salary.total_deductions), 192, currentY + 5.5, { align: "right" });

  // Net Disbursed Box
  currentY += 16;
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(196, 181, 253);
  doc.roundedRect(14, currentY, 182, 22, 2, 2, "FD");

  doc.setTextColor(109, 40, 217);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NET TAKE-HOME PAY (MONTHLY DISBURSEMENT)", 18, currentY + 8);

  doc.setFontSize(15);
  doc.setTextColor(76, 29, 149);
  doc.text(formatINR(salary.net_salary), 192, currentY + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Amount in Words: One Lakh Eighty Thousand Rupees Only", 18, currentY + 16);

  // Compliance & Statutory Footer Notes
  currentY += 30;
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text("Statutory Notes & Declarations:", 14, currentY);
  doc.text("1. This document is a computer-generated salary slip and requires no physical signature.", 14, currentY + 4.5);
  doc.text("2. Income tax has been computed as per the Default New Tax Regime under Section 115BAC of the Income Tax Act, 1961.", 14, currentY + 9);
  doc.text("3. For queries related to Form 16, HRA exemptions, or investment declarations, contact payroll@dayflow.io.", 14, currentY + 13.5);

  // Digital Verification Signature Line
  doc.setDrawColor(203, 213, 225);
  doc.line(140, currentY + 22, 196, currentY + 22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Authorized Signatory", 140, currentY + 26);
  doc.setFont("helvetica", "normal");
  doc.text("Acme Corp Human Resources", 140, currentY + 30);

  // Save the generated PDF
  doc.save(`Dayflow_Payslip_FY26-27_${slip.month.replace(" ", "_")}_EMP-001.pdf`);
}
