"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  ShieldCheck,
  FileText,
  Upload,
  CreditCard,
  Edit3,
  Save,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatINR, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user } = useAuth();
  const { selectedEmployee, setSelectedEmployee, updateEmployeeProfile, uploadDocument } = useHRMS();
  const { toast } = useToast();

  // Active employee being viewed (either current logged in user or inspected employee)
  const activeEmployee = selectedEmployee || user;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: activeEmployee?.phone || "+91 98765 43210",
    personal_email: activeEmployee?.personal_email || "david.chen.dev@gmail.com",
    address: activeEmployee?.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103",
    bio: activeEmployee?.bio || "Distributed systems architect & backend engineer specializing in high-throughput microservices, PostgreSQL optimizations, and real-time event-driven infrastructure.",
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "ID Proof" as const,
  });

  if (!activeEmployee) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const isSelf = user?.id === activeEmployee.id;

  const handleSaveProfile = () => {
    updateEmployeeProfile(formData);
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    toast({
      title: "Avatar Uploaded! 📸",
      description: "Your new profile picture has been updated across Dayflow.",
      variant: "success",
    });
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.name) return;
    uploadDocument({
      name: uploadData.name.endsWith(".pdf") ? uploadData.name : `${uploadData.name}.pdf`,
      category: uploadData.category,
      size_kb: Math.floor(Math.random() * 400) + 150,
    });
    setShowUploadModal(false);
    setUploadData({ name: "", category: "ID Proof" });
  };

  const salary = activeEmployee.salary_structure || {
    basic: 95000,
    hra: 38000,
    special_allowance: 25000,
    conveyance_allowance: 8000,
    medical_allowance: 5000,
    gross_earnings: 171000,
    provident_fund: 11400,
    professional_tax: 200,
    income_tax_tds: 14400,
    total_deductions: 26000,
    net_salary: 145000,
    currency: "INR",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Return to own profile banner if viewing someone else */}
      {!isSelf && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <Eye className="h-4 w-4" />
            <span>Viewing Employee Record: {activeEmployee.display_name} ({activeEmployee.employee_code})</span>
          </div>
          <Button
            size="sm"
            variant="purple"
            onClick={() => setSelectedEmployee(null)}
            className="h-7 text-xs rounded-lg gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to My Profile
          </Button>
        </div>
      )}

      {/* Main Profile Header Card (Matches Excalidraw Wireframe) */}
      <Card className="border border-border/80 shadow-md rounded-3xl overflow-hidden backdrop-blur-xl bg-card/90">
        <div className="h-32 bg-gradient-to-r from-purple-700 via-indigo-600 to-orange-500 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="purple" className="bg-white/20 text-white border-transparent backdrop-blur-sm">
              {activeEmployee.employment_type.replace("_", " ")}
            </Badge>
            <Badge variant="success" className="backdrop-blur-sm">
              {activeEmployee.employment_status}
            </Badge>
          </div>
        </div>

        <CardContent className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
            {/* Large Circular Avatar with Upload Trigger */}
            <div className="relative group">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-2xl rounded-full">
                <AvatarImage src={activeEmployee.avatar_url} alt={activeEmployee.display_name} />
                <AvatarFallback className="text-2xl font-bold">
                  {activeEmployee.first_name[0]}
                </AvatarFallback>
              </Avatar>
              {isSelf && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                  title="Upload profile picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Edit / Save Profile Button */}
            {isSelf && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Button
                    onClick={handleSaveProfile}
                    variant="purple"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 shadow-md"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 border-purple-500/30"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-purple-600" />
                    Edit Personal Info
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              {activeEmployee.display_name}
              <Badge variant="purple" className="text-xs font-mono">
                {activeEmployee.employee_code}
              </Badge>
            </h2>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {activeEmployee.job_title}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-border/60 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Department</span>
              <p className="font-semibold text-foreground truncate">{activeEmployee.department_name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Reporting Manager</span>
              <p className="font-semibold text-foreground truncate">{activeEmployee.manager_name || "Alex Vance (CEO)"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Office Location</span>
              <p className="font-semibold text-foreground truncate">{activeEmployee.location_name.split(" ")[0]}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Company</span>
              <p className="font-semibold text-foreground">Acme Corporation</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Joining Date</span>
              <p className="font-semibold text-foreground">{formatDate(activeEmployee.joining_date)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Work Email</span>
              <p className="font-semibold text-purple-600 dark:text-purple-400 truncate">{activeEmployee.work_email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout matching Excalidraw Wireframe */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview & Bio</TabsTrigger>
          <TabsTrigger value="documents">Documents ({activeEmployee.documents?.length || 3})</TabsTrigger>
          <TabsTrigger value="salary">Salary Structure (₹)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Bio */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editable Contact Information */}
            <Card className="border border-border/70 rounded-2xl shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Personal Contact Details
                </CardTitle>
                <CardDescription className="text-xs">
                  {isSelf ? "You have edit access for personal contact fields" : "Contact records"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mobile Phone</label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-xs h-9 rounded-xl"
                    />
                  ) : (
                    <p className="text-xs font-medium text-foreground">{formData.phone}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Personal Email</label>
                  {isEditing ? (
                    <Input
                      value={formData.personal_email}
                      onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                      className="text-xs h-9 rounded-xl"
                    />
                  ) : (
                    <p className="text-xs font-medium text-foreground">{formData.personal_email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Residential Address</label>
                  {isEditing ? (
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="text-xs rounded-xl"
                      rows={2}
                    />
                  ) : (
                    <p className="text-xs font-medium text-foreground leading-relaxed">{formData.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Read-Only Corporate Information */}
            <Card className="border border-border/70 rounded-2xl shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  Corporate Organization Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Read-only corporate entity attributes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-mono font-bold text-foreground">{activeEmployee.employee_code}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Primary Department:</span>
                  <span className="font-semibold text-foreground">{activeEmployee.department_name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Designation & Band:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{activeEmployee.job_title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Assigned Timezone:</span>
                  <span className="font-mono text-foreground">{activeEmployee.timezone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Access Role:</span>
                  <Badge variant="purple" className="text-[10px]">
                    {activeEmployee.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About / Bio Section */}
          <Card className="border border-border/70 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                About & Professional Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short bio about your role and interests..."
                  className="text-xs rounded-xl"
                  rows={4}
                />
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Documents Section */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="border border-border/70 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Employee Document Vault
                </CardTitle>
                <CardDescription className="text-xs">
                  Verified HR credentials, tax declarations, and contracts
                </CardDescription>
              </div>
              {isSelf && (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  variant="purple"
                  size="sm"
                  className="h-8 rounded-xl text-xs gap-1.5 shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 pt-0">
              <div className="divide-y divide-border/50">
                {(activeEmployee.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {doc.category} • {doc.size_kb} KB • Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast({
                            title: `Downloading ${doc.name}`,
                            description: "Your document is securely downloading...",
                            variant: "purple",
                          })
                        }
                        className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Salary Structure (Read-Only for Employee) */}
        <TabsContent value="salary" className="space-y-4 mt-4">
          <Card className="border border-border/70 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="font-bold text-purple-600">₹</span>
                    Compensation & Salary Structure (INR)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official monthly CTC breakdown (Read-only for employee)
                  </CardDescription>
                </div>
                <Badge variant="purple" className="text-xs">
                  Active Structure
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-6">
              {/* Highlight Net Pay Card */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/15 via-purple-600/5 to-transparent p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Net Take-Home Pay (Monthly)
                  </span>
                  <div className="text-3xl font-extrabold text-foreground mt-1">
                    {formatINR(salary.net_salary)}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Disbursed directly into registered bank account
                  </span>
                </div>
                <Button asChild variant="purple" size="sm" className="rounded-xl text-xs shadow-md">
                  <a href="/payroll">View Payslips Archive</a>
                </Button>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                    Gross Earnings (+): {formatINR(salary.gross_earnings)}
                  </span>
                  <div className="space-y-2 pt-1 border-t border-emerald-500/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Salary:</span>
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

                {/* Deductions */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2.5">
                  <span className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wider text-[11px]">
                    Total Deductions (-): {formatINR(salary.total_deductions)}
                  </span>
                  <div className="space-y-2 pt-1 border-t border-red-500/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provident Fund (PF):</span>
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
        </TabsContent>
      </Tabs>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-600" />
                Upload New Employee Document
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload identity proofs, tax records, or certification documents
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUploadDoc} className="space-y-3.5 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Document Title</label>
                <Input
                  placeholder="e.g. Passport_Scan.pdf"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Document Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                  className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="ID Proof">ID Proof (Aadhaar / Passport / Voter ID)</option>
                  <option value="Offer Letter">Offer Letter / Appointment Letter</option>
                  <option value="Tax Form">Tax Form (Form 16 / Investment Declaration)</option>
                  <option value="Certificate">Degree / Skill Certificate</option>
                </select>
              </div>

              <div className="rounded-xl border border-dashed border-purple-500/40 p-4 text-center bg-purple-500/5">
                <Upload className="h-6 w-6 text-purple-600 mx-auto mb-1 opacity-70" />
                <span className="text-xs font-semibold text-foreground block">
                  Click to select file or drag and drop
                </span>
                <span className="text-[10px] text-muted-foreground">
                  PDF, PNG, JPG up to 10MB
                </span>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="purple" size="sm" className="rounded-xl text-xs font-semibold">
                  Upload to Vault
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
