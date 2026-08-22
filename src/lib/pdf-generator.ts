import { jsPDF } from "jspdf";
import { formatINR } from "./utils";
import { Payslip, Employee } from "@/types/hrms";

export function generatePayslipPDF(slip: Payslip, user?: Employee | null) {
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
  doc.rect(0, 0, 210, 28, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ACME CORPORATION", 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103 • CIN: U72200KA2023PTC112233", 14, 20);

  // Payslip Period Badge (Top Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`PAYSLIP: ${slip.month.toUpperCase()}`, 196, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Disbursed On: ${slip.payment_date}`, 196, 20, { align: "right" });

  // Employee Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 34, 2, 2, "FD");

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EMPLOYEE SUMMARY", 18, 41);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  // Column 1
  doc.text(`Employee Name:`, 18, 48);
  doc.setFont("helvetica", "bold");
  doc.text(`${employeeName}`, 48, 48);
  doc.setFont("helvetica", "normal");

  doc.text(`Employee ID:`, 18, 54);
  doc.setFont("helvetica", "bold");
  doc.text(`${employeeCode}`, 48, 54);
  doc.setFont("helvetica", "normal");

  doc.text(`Designation:`, 18, 60);
  doc.text(`${designation}`, 48, 60);

  doc.text(`Department:`, 18, 65);
  doc.text(`${department}`, 48, 65);

  // Column 2
  doc.text(`Bank Account:`, 115, 48);
  doc.text(`HDFC Bank (•••• 8842)`, 145, 48);

  doc.text(`PAN Number:`, 115, 54);
  doc.text(`ABCDE••••F`, 145, 54);

  doc.text(`UAN Number:`, 115, 60);
  doc.text(`100984758392`, 145, 60);

  doc.text(`Working Days:`, 115, 65);
  doc.text(`${slip.working_days} Days (Attended)`, 145, 65);

  // Earnings & Deductions Table Header
  const startY = 74;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 91, 8, "F");
  doc.rect(105, startY, 91, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("EARNINGS", 18, startY + 5.5);
  doc.text("AMOUNT (INR)", 98, startY + 5.5, { align: "right" });

  doc.text("DEDUCTIONS & TAXES", 109, startY + 5.5);
  doc.text("AMOUNT (INR)", 190, startY + 5.5, { align: "right" });

  // Rows
  const earningsList = [
    { label: "Basic Pay", amt: salary.basic },
    { label: "House Rent Allowance (HRA)", amt: salary.hra },
    { label: "Special Allowance", amt: salary.special_allowance },
    { label: "Conveyance Allowance", amt: salary.conveyance_allowance },
    { label: "Medical Allowance", amt: salary.medical_allowance },
  ];

  const deductionsList = [
    { label: "Provident Fund (Employee PF)", amt: salary.provident_fund },
    { label: "Professional Tax (PT)", amt: salary.professional_tax },
    { label: "Income Tax (TDS)", amt: salary.income_tax_tds },
    { label: "—", amt: 0 },
    { label: "—", amt: 0 },
  ];

  let currentY = startY + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  for (let i = 0; i < 5; i++) {
    const e = earningsList[i];
    const d = deductionsList[i];

    // Earning column
    doc.text(e.label, 18, currentY);
    doc.text(formatINR(e.amt), 98, currentY, { align: "right" });

    // Deduction column
    doc.text(d.label, 109, currentY);
    if (d.amt > 0) {
      doc.text(formatINR(d.amt), 190, currentY, { align: "right" });
    } else {
      doc.text("—", 190, currentY, { align: "right" });
    }

    currentY += 8;
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, 196, currentY);
  currentY += 6;

  // Subtotals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  doc.text("Total Gross Earnings", 18, currentY);
  doc.text(formatINR(salary.gross_earnings), 98, currentY, { align: "right" });

  doc.text("Total Deductions", 109, currentY);
  doc.text(formatINR(salary.total_deductions), 190, currentY, { align: "right" });

  currentY += 12;

  // Net Pay Highlight Box
  doc.setFillColor(243, 232, 255); // Light purple bg
  doc.setDrawColor(192, 132, 252);
  doc.roundedRect(14, currentY, 182, 24, 2, 2, "FD");

  doc.setTextColor(88, 28, 135);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NET TAKE-HOME SALARY (INR)", 20, currentY + 9);

  doc.setFontSize(16);
  doc.text(formatINR(salary.net_salary), 20, currentY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Disbursed to HDFC Bank (•••• 8842)", 190, currentY + 14, { align: "right" });

  currentY += 34;

  // Signatures / Statutory Notes
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 8;

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Note: This is a system generated payslip generated by Dayflow HRMS and does not require a physical signature.", 14, currentY);
  doc.text("Tax regime applied: New Tax Regime (FY 2026-27). Form 16 will be issued by June 15, 2027.", 14, currentY + 5);

  // Save the PDF file to trigger download
  const cleanMonth = slip.month.replace(/\s+/g, "_");
  doc.save(`Dayflow_Salary_Slip_${cleanMonth}_${employeeCode}.pdf`);
}
