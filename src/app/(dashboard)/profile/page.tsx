"use client";

import React, { useState, useRef, useEffect } from "react";
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
  RefreshCw,
  Users,
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
  const { user, switchRole, updateUser } = useAuth();
  const { selectedEmployee, setSelectedEmployee, updateEmployeeProfile, uploadDocument } = useHRMS();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active employee being viewed
  const activeEmployee = selectedEmployee || user;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: activeEmployee?.first_name || "Dhruv",
    last_name: activeEmployee?.last_name || "Singh",
    job_title: activeEmployee?.job_title || "Lead Software Architect & Tech Lead",
    department_name: activeEmployee?.department_name || "Core Platform Engineering",
    phone: activeEmployee?.phone || "+91 98765 43210",
    personal_email: activeEmployee?.personal_email || "dhruvsingh.dev@gmail.com",
    address: activeEmployee?.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103",
    bio: activeEmployee?.bio || "Lead software architect & full-stack engineer driving Dayflow HRMS enterprise platform, distributed cloud microservices, and next-generation developer tooling.",
    avatar_url: activeEmployee?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  });

  // Keep formData in sync when activeEmployee changes
  useEffect(() => {
    if (activeEmployee) {
      setFormData({
        first_name: activeEmployee.first_name || "Dhruv",
        last_name: activeEmployee.last_name || "Singh",
        job_title: activeEmployee.job_title || "Lead Software Architect & Tech Lead",
        department_name: activeEmployee.department_name || "Core Platform Engineering",
        phone: activeEmployee.phone || "+91 98765 43210",
        personal_email: activeEmployee.personal_email || "dhruvsingh.dev@gmail.com",
        address: activeEmployee.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103",
        bio: activeEmployee.bio || "Lead software architect & full-stack engineer driving Dayflow HRMS enterprise platform, distributed cloud microservices, and next-generation developer tooling.",
        avatar_url: activeEmployee.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      });
    }
  }, [activeEmployee]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "ID Proof" as const,
  });

  if (!activeEmployee) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const handleSaveProfile = () => {
    const displayName = `${formData.first_name} ${formData.last_name}`.trim();
    const updatedFields = {
      ...formData,
      display_name: displayName || activeEmployee.display_name,
    };

    updateEmployeeProfile(updatedFields);
    setIsEditing(false);
  };

  // Real Image File Picker Handler for Avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar_url: base64Url }));
        updateEmployeeProfile({ avatar_url: base64Url });
        toast({
          title: "Profile Picture Updated! 📸",
          description: "Your new avatar has been applied across Dayflow.",
          variant: "purple",
        });
      };
      reader.readAsDataURL(file);
    }
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
    basic: 120000,
    hra: 48000,
    special_allowance: 32000,
    conveyance_allowance: 10000,
    medical_allowance: 6000,
    gross_earnings: 216000,
    provident_fund: 14400,
    professional_tax: 200,
    income_tax_tds: 21400,
    total_deductions: 36000,
    net_salary: 180000,
    currency: "INR",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hidden native file input for profile picture uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner & Quick Role Mode Switcher for Dhruv Singh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-background to-orange-500/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">Active Profile: Dhruv Singh</h3>
            <p className="text-[11px] text-muted-foreground">Lead Architect & System Administrator (EMP-001)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Switch View Role:</span>
          {(["SUPER_ADMIN", "HR_ADMIN", "LINE_MANAGER", "EMPLOYEE"] as const).map((r) => {
            const isCurrent = user?.role === r;
            return (
              <Button
                key={r}
                size="sm"
                variant={isCurrent ? "purple" : "outline"}
                onClick={() => {
                  switchRole(r);
                  toast({
                    title: `Role switched to ${r.replace("_", " ")}`,
                    description: `Dhruv Singh workspace view updated.`,
                    variant: "purple",
                  });
                }}
                className={`h-7 text-[11px] rounded-xl px-2.5 font-medium transition-all ${
                  isCurrent ? "shadow-md" : "border-border/60 hover:bg-muted"
                }`}
              >
                {r === "SUPER_ADMIN" ? "CEO / Admin" : r === "HR_ADMIN" ? "HR Admin" : r === "LINE_MANAGER" ? "Manager" : "Employee"}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="border border-border/80 shadow-md rounded-3xl overflow-hidden backdrop-blur-xl bg-card/90">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-purple-700 via-indigo-600 to-orange-500 relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <Badge variant="purple" className="bg-white/20 text-white border-transparent backdrop-blur-sm text-[10px]">
              Full Time • Permanent
            </Badge>
            <Badge variant="success" className="backdrop-blur-sm text-[10px]">
              Active Employee
            </Badge>
          </div>
        </div>

        <CardContent className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            {/* Circular Avatar with Click-to-Upload Trigger */}
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-xl rounded-full cursor-pointer overflow-hidden aspect-square">
                <AvatarImage src={formData.avatar_url || activeEmployee.avatar_url} alt="Dhruv Singh" className="object-cover h-full w-full rounded-full" />
                <AvatarFallback className="text-xl font-bold bg-purple-600 text-white">
                  DS
                </AvatarFallback>
              </Avatar>

              {/* Camera Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-purple-700 active:scale-95 ring-2 ring-background"
                title="Click to upload profile photo from your device"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Edit / Save Profile Buttons */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    variant="purple"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 shadow-md font-semibold"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="purple"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 font-semibold shadow-md"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile & Bio
                </Button>
              )}
            </div>
          </div>

          {/* Name & Title (Editable when isEditing) */}
          <div className="space-y-2 max-w-2xl">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Job Title / Designation</label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Avatar Image URL</label>
                  <Input
                    placeholder="https://... or click camera icon"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  {formData.first_name} {formData.last_name}
                  <Badge variant="purple" className="text-xs font-mono">
                    {activeEmployee.employee_code || "EMP-001"}
                  </Badge>
                </h2>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                  {formData.job_title}
                </p>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-border/60 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Department</span>
              <p className="font-semibold text-foreground truncate">{formData.department_name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Reporting To</span>
              <p className="font-semibold text-foreground truncate">Board of Directors</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Office Location</span>
              <p className="font-semibold text-foreground truncate">Bengaluru Hub</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Organization</span>
              <p className="font-semibold text-foreground">NMIT (Nitte Meenakshi Institute of Technology)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Joining Date</span>
              <p className="font-semibold text-foreground">{formatDate("2023-01-01")}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px]">Work Email</span>
              <p className="font-semibold text-purple-600 dark:text-purple-400 truncate">dhruv.singh@dayflow.io</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview & Bio</TabsTrigger>
          <TabsTrigger value="documents">Documents (3)</TabsTrigger>
          <TabsTrigger value="salary">Salary Structure (₹)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Bio */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editable Contact Information */}
            <Card className="border border-border/70 rounded-2xl shadow-sm">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600" />
                    Personal Contact Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Direct phone, personal email, and residential address
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </Button>
                )}
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
                  <span className="font-mono font-bold text-foreground">EMP-001</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Primary Department:</span>
                  <span className="font-semibold text-foreground">Core Platform Engineering</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Designation & Band:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{formData.job_title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Assigned Timezone:</span>
                  <span className="font-mono text-foreground">Asia/Kolkata (IST)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Access Role:</span>
                  <Badge variant="purple" className="text-[10px]">
                    SUPER_ADMIN / HR_ADMIN
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About / Bio Section */}
          <Card className="border border-border/70 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                About & Professional Bio
              </CardTitle>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit Bio
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-5 pt-2">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Share a short bio about your role, achievements, and interests..."
                    className="text-xs rounded-xl"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} variant="purple" size="sm" className="rounded-xl text-xs gap-1">
                      <Save className="h-3 w-3" />
                      Save Bio
                    </Button>
                  </div>
                </div>
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
                  Verified HR credentials, tax declarations, and contracts for Dhruv Singh
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowUploadModal(true)}
                variant="purple"
                size="sm"
                className="h-8 rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Document
              </Button>
            </CardHeader>

            <CardContent className="p-5 pt-0">
              <div className="divide-y divide-border/50">
                {[
                  { id: "doc-1", name: "Offer_Letter_Dhruv_Singh.pdf", category: "Offer Letter", size_kb: 420, date: "2023-01-01" },
                  { id: "doc-2", name: "Aadhaar_Passport_Verification.pdf", category: "ID Proof", size_kb: 890, date: "2023-01-05" },
                  { id: "doc-3", name: "Form_16_FY2025_26.pdf", category: "Tax Form", size_kb: 340, date: "2026-06-10" },
                ].map((doc) => (
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
                          {doc.category} • {doc.size_kb} KB • Uploaded {doc.date}
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

        {/* Tab 3: Salary Structure */}
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
                    Official monthly CTC breakdown for Dhruv Singh
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
                    Disbursed directly into registered HDFC Bank account
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
