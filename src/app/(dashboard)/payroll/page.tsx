"use client";

import React, { useState, useRef } from "react";
import {
  CreditCard,
  Download,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINR, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Payslip } from "@/types/hrms";

export default function PayrollPage() {
  const { user, isHrAdmin } = useAuth();
  const { payslips } = useHRMS();
  const { toast } = useToast();

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips[0]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printableSlipRef = useRef<HTMLDivElement>(null);

  const salary = user?.salary_structure || payslips[0].structure;

  // Handle PDF Generation / Print trigger
  const handleDownloadPdf = async (slip: Payslip) => {
    setSelectedPayslip(slip);
    setIsGeneratingPdf(true);

    toast({
      title: "Generating Official Salary Slip PDF 📄",
      description: `Payslip for ${slip.month} is being generated and formatted...`,
      variant: "purple",
    });

    setTimeout(() => {
      setIsGeneratingPdf(false);
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs px-2 py-0.5 font-semibold">
              Compensation & Benefits
            </Badge>
            <span className="text-xs text-muted-foreground">Currency: INR (₹)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Payroll & Salary Management
            <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Inspect monthly compensation structure, tax deductions, and download official payslips.
          </p>
        </div>

        <Button
          onClick={() => handleDownloadPdf(payslips[0])}
          variant="purple"
          className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md"
          disabled={isGeneratingPdf}
        >
          <Download className="h-4 w-4" />
          {isGeneratingPdf ? "Generating..." : "Download Latest Slip (PDF)"}
        </Button>
      </div>

      {/* Salary Structure Main Highlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Structure Breakdown */}
        <Card className="border border-border/70 rounded-3xl shadow-sm overflow-hidden lg:col-span-2">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="font-bold text-purple-600 text-lg">₹</span>
                Monthly CTC Structure Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed earnings and statutory tax deductions for {user?.display_name || "Employee"}
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs">
              Status: Disbursed
            </Badge>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-6">
            {/* Net Pay Highlight Capsule */}
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/15 via-purple-600/5 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Monthly Net Take-Home Salary
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1">
                  {formatINR(salary.net_salary)}
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Processed into HDFC Bank (•••• 8842) on 31st of each month
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPdf(payslips[0])}
                className="h-9 px-4 rounded-xl text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Download Slip
              </Button>
            </div>

            {/* Side by side: Earnings vs Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Earnings Breakdown */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                    Earnings Breakdown (+)
                  </span>
                  <span className="font-extrabold text-sm text-foreground">
                    {formatINR(salary.gross_earnings)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Pay:</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">House Rent Allowance (HRA):</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Special Allowance:</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.special_allowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conveyance Allowance:</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.conveyance_allowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical Allowance:</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.medical_allowance)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-red-500/20">
                  <span className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wider text-[11px]">
                    Deductions & Taxes (-)
                  </span>
                  <span className="font-extrabold text-sm text-foreground">
                    {formatINR(salary.total_deductions)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provident Fund (Employee PF):</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.provident_fund)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professional Tax (PT):</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.professional_tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax (TDS):</span>
                    <span className="font-semibold text-foreground">{formatINR(salary.income_tax_tds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Statutory & Bank Details */}
        <Card className="border border-border/70 rounded-3xl shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Statutory & Bank Records
            </CardTitle>
            <CardDescription className="text-xs">
              Banking and tax identification details
            </CardDescription>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-semibold text-foreground">HDFC Bank Ltd</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-semibold text-foreground">•••• •••• 8842</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">PAN Card:</span>
                <span className="font-mono font-semibold text-foreground">ABCDE••••F</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">UAN Number:</span>
                <span className="font-mono font-semibold text-foreground">100984758392</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Annual CTC:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {formatINR(salary.gross_earnings * 12)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-[11px] text-muted-foreground leading-relaxed">
            💡 Tax regime applied: <strong>New Tax Regime (FY 2026–27)</strong>. Form 16 will be issued by June 15, 2027.
          </div>
        </Card>
      </div>

      {/* Monthly Payslips Archive Table */}
      <Card className="border border-border/70 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Monthly Payslip History Archive</CardTitle>
          <CardDescription className="text-xs">
            Download past monthly payslips and tax statement slips
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Period</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Gross Earnings</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Disbursed On</TableHead>
                <TableHead className="text-right">Payslip PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((slip) => (
                <TableRow key={slip.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>{slip.month}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{slip.working_days} Days</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-600">
                    {formatINR(slip.structure.gross_earnings)}
                  </TableCell>
                  <TableCell className="text-xs text-red-500">
                    {formatINR(slip.structure.total_deductions)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {formatINR(slip.structure.net_salary)}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {slip.payment_date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPdf(slip)}
                      className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Printable / Viewable Salary Slip Template */}
      <div id="printable-slip" ref={printableSlipRef} className="hidden print:block p-8 bg-white text-black">
        {selectedPayslip && (
          <div className="max-w-3xl mx-auto border border-gray-300 p-8 space-y-6 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold text-purple-900">ACME CORPORATION</h1>
                <p className="text-xs text-gray-600">Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103</p>
                <p className="text-xs text-gray-600">CIN: U72200KA2023PTC112233 • hr@dayflow.io</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded">
                  PAYSLIP - {selectedPayslip.month.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
              <div>
                <p><strong>Employee Name:</strong> {user?.display_name || selectedPayslip.employee_name}</p>
                <p><strong>Employee ID:</strong> {user?.employee_code || selectedPayslip.employee_code}</p>
                <p><strong>Designation:</strong> {user?.job_title || selectedPayslip.designation}</p>
                <p><strong>Department:</strong> {user?.department_name || selectedPayslip.department_name}</p>
              </div>
              <div>
                <p><strong>Bank Account:</strong> {selectedPayslip.account_number_masked}</p>
                <p><strong>PAN:</strong> {selectedPayslip.pan_masked}</p>
                <p><strong>UAN:</strong> {selectedPayslip.uan_number}</p>
                <p><strong>Payment Date:</strong> {selectedPayslip.payment_date}</p>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <table className="w-full text-xs border border-gray-300">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 text-left border-r">Earnings</th>
                  <th className="p-2 text-right border-r">Amount (₹)</th>
                  <th className="p-2 text-left border-r">Deductions</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2 border-r">Basic Pay</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.basic)}</td>
                  <td className="p-2 border-r">Provident Fund (PF)</td>
                  <td className="p-2 text-right">{formatINR(selectedPayslip.structure.provident_fund)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r">House Rent Allowance (HRA)</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.hra)}</td>
                  <td className="p-2 border-r">Professional Tax (PT)</td>
                  <td className="p-2 text-right">{formatINR(selectedPayslip.structure.professional_tax)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r">Special Allowance</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.special_allowance)}</td>
                  <td className="p-2 border-r">Income Tax (TDS)</td>
                  <td className="p-2 text-right">{formatINR(selectedPayslip.structure.income_tax_tds)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r">Conveyance Allowance</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.conveyance_allowance)}</td>
                  <td className="p-2 border-r">—</td>
                  <td className="p-2 text-right">—</td>
                </tr>
                <tr>
                  <td className="p-2 border-r">Medical Allowance</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.medical_allowance)}</td>
                  <td className="p-2 border-r">—</td>
                  <td className="p-2 text-right">—</td>
                </tr>
                <tr className="font-bold bg-gray-50 border-t">
                  <td className="p-2 border-r">Gross Earnings</td>
                  <td className="p-2 text-right border-r">{formatINR(selectedPayslip.structure.gross_earnings)}</td>
                  <td className="p-2 border-r">Total Deductions</td>
                  <td className="p-2 text-right">{formatINR(selectedPayslip.structure.total_deductions)}</td>
                </tr>
              </tbody>
            </table>

            {/* Net Pay Box */}
            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded">
              <div>
                <p className="text-xs font-semibold text-purple-900">NET TAKE-HOME SALARY</p>
                <p className="text-xl font-bold text-purple-950">{formatINR(selectedPayslip.structure.net_salary)}</p>
              </div>
              <p className="text-[10px] text-gray-500 italic">This is a system generated salary slip and does not require a physical signature.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
