"use client";

import React, { useState } from "react";
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
import { generatePayslipPDF } from "@/lib/pdf-generator";

export default function PayrollPage() {
  const { user } = useAuth();
  const { payslips } = useHRMS();
  const { toast } = useToast();

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips[0]);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const salary = user?.salary_structure || payslips[0].structure;

  // Direct PDF Download Handler
  const handleDownloadDirectPDF = (slip: Payslip) => {
    setIsDownloading(true);
    try {
      generatePayslipPDF(slip, user);
      toast({
        title: "Salary Slip Downloaded! 📄",
        description: `Official PDF for ${slip.month} has been saved to your downloads.`,
        variant: "purple",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Please try again or use the print option.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPreview = (slip: Payslip) => {
    setSelectedPayslip(slip);
    setShowSlipModal(true);
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
            <span className="text-xs text-muted-foreground font-medium">Currency: Indian Rupee (₹ INR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Payroll & Salary Structure
            <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Inspect your monthly earnings, statutory tax deductions, and download official payslips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenPreview(payslips[0])}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm font-semibold gap-2 border-purple-500/30 text-purple-600 dark:text-purple-400"
          >
            <Eye className="h-4 w-4" />
            View Payslip
          </Button>

          <Button
            onClick={() => handleDownloadDirectPDF(payslips[0])}
            variant="purple"
            className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating..." : "Download Salary Slip (PDF)"}
          </Button>
        </div>
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
                Detailed earnings and statutory tax deductions for {user?.display_name || "Employee"} ({user?.employee_code || "EMP"})
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
                  Disbursed into HDFC Bank (•••• 8842) on 31st of each month
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="purple"
                  size="sm"
                  onClick={() => handleDownloadDirectPDF(payslips[0])}
                  className="h-9 px-4 rounded-xl text-xs gap-1.5 font-semibold shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPreview(payslips[0])}
                  className="h-9 px-3 rounded-xl text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>
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
                <TableHead className="text-right">Actions</TableHead>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenPreview(slip)}
                        className="h-7 text-xs rounded-lg gap-1 text-purple-600 dark:text-purple-400"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="purple"
                        onClick={() => handleDownloadDirectPDF(slip)}
                        className="h-7 text-xs rounded-lg gap-1 font-semibold shadow-sm"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* On-Screen Interactive Salary Slip Preview Modal */}
      {showSlipModal && selectedPayslip && (
        <Dialog open={showSlipModal} onOpenChange={setShowSlipModal}>
          <DialogContent className="max-w-2xl glass-panel p-6">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-purple-900 dark:text-purple-300">
                    ACME CORPORATION - SALARY SLIP
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Pay Period: {selectedPayslip.month} • Disbursed: {selectedPayslip.payment_date}
                  </DialogDescription>
                </div>
                <Badge variant="purple" className="text-xs">
                  {selectedPayslip.month}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/50 border border-border/60">
                <div className="space-y-1">
                  <p><strong>Employee:</strong> {user?.display_name || selectedPayslip.employee_name}</p>
                  <p><strong>ID:</strong> {user?.employee_code || selectedPayslip.employee_code}</p>
                  <p><strong>Designation:</strong> {user?.job_title || selectedPayslip.designation}</p>
                  <p><strong>Department:</strong> {user?.department_name || selectedPayslip.department_name}</p>
                </div>
                <div className="space-y-1">
                  <p><strong>Bank Account:</strong> {selectedPayslip.account_number_masked}</p>
                  <p><strong>PAN:</strong> {selectedPayslip.pan_masked}</p>
                  <p><strong>UAN:</strong> {selectedPayslip.uan_number}</p>
                  <p><strong>Working Days:</strong> {selectedPayslip.working_days} Days</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px] block border-b border-emerald-500/20 pb-1">
                    EARNINGS (+)
                  </span>
                  <div className="flex justify-between"><span>Basic Pay:</span><span className="font-semibold">{formatINR(salary.basic)}</span></div>
                  <div className="flex justify-between"><span>HRA:</span><span className="font-semibold">{formatINR(salary.hra)}</span></div>
                  <div className="flex justify-between"><span>Special Allowance:</span><span className="font-semibold">{formatINR(salary.special_allowance)}</span></div>
                  <div className="flex justify-between"><span>Conveyance:</span><span className="font-semibold">{formatINR(salary.conveyance_allowance)}</span></div>
                  <div className="flex justify-between"><span>Medical:</span><span className="font-semibold">{formatINR(salary.medical_allowance)}</span></div>
                  <div className="flex justify-between pt-1 border-t font-bold"><span>Total Gross:</span><span>{formatINR(salary.gross_earnings)}</span></div>
                </div>

                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 space-y-1.5">
                  <span className="font-bold text-red-700 dark:text-red-300 text-[11px] block border-b border-red-500/20 pb-1">
                    DEDUCTIONS (-)
                  </span>
                  <div className="flex justify-between"><span>Provident Fund (PF):</span><span className="font-semibold">{formatINR(salary.provident_fund)}</span></div>
                  <div className="flex justify-between"><span>Professional Tax:</span><span className="font-semibold">{formatINR(salary.professional_tax)}</span></div>
                  <div className="flex justify-between"><span>Income Tax (TDS):</span><span className="font-semibold">{formatINR(salary.income_tax_tds)}</span></div>
                  <div className="flex justify-between"><span>Other Deductions:</span><span className="font-semibold">₹0</span></div>
                  <div className="flex justify-between pt-1 border-t font-bold"><span>Total Deductions:</span><span>{formatINR(salary.total_deductions)}</span></div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    NET TAKE-HOME SALARY
                  </span>
                  <div className="text-2xl font-black text-foreground">{formatINR(salary.net_salary)}</div>
                </div>
                <span className="text-[10px] text-muted-foreground italic">System-generated official payslip</span>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSlipModal(false)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
              <Button
                variant="purple"
                size="sm"
                onClick={() => {
                  handleDownloadDirectPDF(selectedPayslip);
                  setShowSlipModal(false);
                }}
                className="rounded-xl text-xs gap-1.5 font-semibold shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF File (.pdf)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
