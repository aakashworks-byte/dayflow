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

  doc.text(`Designation:`, 18, 61);
  doc.text(`${designation}`, 50, 61);

  doc.text(`Department:`, 18, 67);
  doc.text(`${department}`, 50, 67);

  // Column 2
  doc.text(`Bank Account:`, 115, 49);
  doc.text(`HDFC Bank (•••• 8842)`, 148, 49);

  doc.text(`PAN / Tax ID:`, 115, 55);
  doc.text(`ABCDE••••F`, 148, 55);

  doc.text(`UAN Number:`, 115, 61);
  doc.text(`100984758392`, 148, 61);

  doc.text(`Tax Regime:`, 115, 67);
  doc.setFont("helvetica", "bold");
  doc.text(`New Regime (FY 26-27)`, 148, 67);
  doc.setFont("helvetica", "normal");

  // Earnings & Deductions Table Header
  const startY = 78;
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

  currentY += 32;

  // Financial Year YTD Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("FY 2026-27 YEAR-TO-DATE (YTD) SUMMARY:", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`Annual CTC: ${formatINR(salary.gross_earnings * 12)} | YTD Gross: ${formatINR(salary.gross_earnings * 4)} | YTD Tax Deductions: ${formatINR(salary.total_deductions * 4)} | YTD Net Disbursed: ${formatINR(salary.net_salary * 4)}`, 18, currentY + 11);

  currentY += 22;

  // Signatures / Statutory Notes
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Note: This is a system generated payslip generated by Dayflow HRMS and does not require a physical signature.", 14, currentY);
  doc.text("Tax regime: New Tax Regime (Section 115BAC). Form 16 Part A & B will be issued by June 15, 2027 for AY 2027-28.", 14, currentY + 4);

  // Save the PDF file to trigger download
  const cleanMonth = slip.month.replace(/\s+/g, "_");
  doc.save(`Dayflow_Payslip_FY26-27_${cleanMonth}_${employeeCode}.pdf`);
}
