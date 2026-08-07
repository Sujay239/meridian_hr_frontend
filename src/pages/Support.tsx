import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  MessageSquare,
  LifeBuoy,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  PhoneCall,
  Mail,
  Building2,
  ChevronDown,
  ChevronUp,
  Plus,
  Laptop,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNotification } from "@/components/NotificationProvider";

interface SupportTicket {
  id: string;
  subject: string;
  category: "IT Support" | "HR & Payroll" | "Facilities" | "Finance";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
  description: string;
  responsesCount: number;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TICK-1092",
    subject: "VPN Connection drops frequently on MacOS",
    category: "IT Support",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-08-06 09:30 AM",
    description: "Whenever I switch WiFi networks or wake laptop from sleep, the company VPN takes 10+ minutes to re-authenticate.",
    responsesCount: 2,
  },
  {
    id: "TICK-1085",
    subject: "Update tax withholding declaration for Q3",
    category: "Finance",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-08-01 02:15 PM",
    description: "Please confirm receipt of my updated W-4 tax exemption form submitted last Friday.",
    responsesCount: 4,
  },
  {
    id: "TICK-1071",
    subject: "Request access badge for 4th floor conference room",
    category: "Facilities",
    priority: "Low",
    status: "Open",
    createdAt: "2026-08-04 11:00 AM",
    description: "Need keycard access permissions granted for the executive boardroom on the 4th floor.",
    responsesCount: 0,
  },
];

const FAQS = [
  {
    question: "How do I reset my account password or Two-Factor Authentication (2FA)?",
    answer: "You can reset your password directly from the login page by clicking 'Forgot Password'. To reset 2FA authenticator app tokens, please submit an IT Support ticket or contact your IT Administrator directly.",
    category: "IT Support",
  },
  {
    question: "When are monthly payslips released and where can I view them?",
    answer: "Monthly payslips are generated on the 28th of every month. You can view and download your full PDF payslips anytime from the Payroll tab on your employee portal dashboard.",
    category: "HR & Payroll",
  },
  {
    question: "How do I request internet or hardware equipment reimbursement?",
    answer: "Go to the Expense & Requests section, click 'New Request', choose 'Reimbursement' as the category, attach your tax invoice/receipt, and submit for Manager approval.",
    category: "Finance",
  },
  {
    question: "What should I do if my RFID Access Keycard is lost or broken?",
    answer: "Report lost keycards immediately to Facilities via a Support Ticket so the card can be deactivated for security. Replacement keycards can be collected from the front reception desk during office hours.",
    category: "Facilities",
  },
  {
    question: "What is the standard SLA response time for IT support tickets?",
    answer: "Urgent tickets are acknowledged within 15 minutes. High priority tickets receive responses within 2 hours. Medium and Low priority tickets are processed within 1 business day.",
    category: "IT Support",
  },
];

const Support: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Create Ticket Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("IT Support");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("Medium");
  const [description, setDescription] = useState("");

  // View Ticket Details State
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  // Accordion FAQ state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showError("Please enter a subject and detailed description.");
      return;
    }

    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      priority,
      status: "Open",
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: description.trim(),
      responsesCount: 0,
    };

    setTickets([newTicket, ...tickets]);
    showSuccess(`Support Ticket ${newTicket.id} created successfully.`);
    setIsCreateOpen(false);
    setSubject("");
    setDescription("");
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !viewTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === viewTicket.id
          ? { ...t, responsesCount: t.responsesCount + 1, status: "In Progress" }
          : t
      )
    );
    showSuccess("Response added to ticket timeline.");
    setReplyText("");
    setViewTicket(null);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadge = (p: SupportTicket["priority"]) => {
    switch (p) {
      case "Urgent":
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900">Urgent</Badge>;
      case "High":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900">High</Badge>;
      case "Medium":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">Medium</Badge>;
      case "Low":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800">Low</Badge>;
    }
  };

  const getStatusBadge = (s: SupportTicket["status"]) => {
    switch (s) {
      case "Open":
        return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Open</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</Badge>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Hero / Header Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 md:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <LifeBuoy className="w-3.5 h-3.5" /> 24/7 Help Desk & Knowledge Assistance
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Search our self-service knowledge base, submit a support request to IT, HR, or Facilities, or view the status of your existing tickets.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl pt-2">
            <Search className="absolute left-4 top-5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search help articles, FAQs, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white rounded-2xl shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-blue-400 text-sm md:text-base placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Decorative background glow elements */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => { setActiveTab("faq"); setSearchQuery("IT"); }}
          className="group hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">IT & Hardware</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">VPN, Laptop, Passwords & Access</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => { setActiveTab("faq"); setSearchQuery("HR"); }}
          className="group hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">HR & Payroll</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Payslips, Benefits & Leaves</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => { setActiveTab("faq"); setSearchQuery("Finance"); }}
          className="group hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Finance & Claims</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expenses, Taxes & Bills</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => { setActiveTab("faq"); setSearchQuery("Facilities"); }}
          className="group hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Facilities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Keycard Access & Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-sm font-semibold cursor-pointer">
              Overview & FAQs
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2">
              My Support Tickets
              {tickets.length > 0 && (
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-1.5 py-0.2 text-[10px]">
                  {tickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg text-sm font-semibold cursor-pointer">
              Contact & Hotline
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Raise Support Ticket
          </Button>
        </div>

        {/* Tab 1: Overview & FAQs */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" /> Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find fast answers to common questions about company systems, policies, and workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No matching FAQs found for "{searchQuery}". Try submitting a new ticket below.
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-4 text-left font-semibold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 pr-4">
                          <Badge variant="outline" className="text-xs shrink-0 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                            {faq.category}
                          </Badge>
                          <span>{faq.question}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: My Support Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Active & Resolved Tickets
                </CardTitle>
                <CardDescription>
                  Track the real-time status and responses for your reported issues.
                </CardDescription>
              </div>

              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
                className="border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" /> New Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No tickets found. Need help? Click "Raise Support Ticket" to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setViewTicket(t)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                            {t.id}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {t.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {t.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                          <MessageSquare className="w-3.5 h-3.5" /> {t.responsesCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Contact & Hotline */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Support Hotline</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mon - Fri, 8 AM - 6 PM EST</p>
                </div>
                <div className="pt-2 font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                  +1 (800) 555-MERIDIAN
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Email Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average response time: &lt; 2 hours</p>
                </div>
                <div className="pt-2 font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                  support@meridianhr.com
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">On-Site IT Desk</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Floor 3, Tech Support Suite</p>
                </div>
                <div className="pt-2 font-medium text-xs text-slate-700 dark:text-slate-300">
                  Walk-ins welcome for laptop repairs & badge issuance.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- Raise Ticket Modal Dialog --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-500" /> Raise a Support Request
            </DialogTitle>
            <DialogDescription>
              Submit your issue or request to the appropriate department.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
              <Input
                id="subject"
                placeholder="Brief summary of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 dark:text-white cursor-pointer">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950">
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="HR & Payroll">HR & Payroll</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 dark:text-white cursor-pointer">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Detailed Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="desc"
                rows={4}
                placeholder="Please describe the problem, step-by-step reproduction, or specific assistance needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- View Ticket Modal Dialog --- */}
      <Dialog open={Boolean(viewTicket)} onOpenChange={(open) => !open && setViewTicket(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          {viewTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {viewTicket.id}
                  </span>
                  {getStatusBadge(viewTicket.status)}
                </div>
                <DialogTitle className="text-lg font-bold dark:text-white mt-1">
                  {viewTicket.subject}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Created on {viewTicket.createdAt} • Category: {viewTicket.category}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Issue Description</Label>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {viewTicket.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Add Response / Message</Label>
                  <Textarea
                    rows={3}
                    placeholder="Type your response to the support team..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewTicket(null)}
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Response
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
