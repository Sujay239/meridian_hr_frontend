import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Mail,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  MapPin,
  Phone,
  KeyRound,
  AlertTriangle,
  Upload,
  FileText,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  File,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2
} from "lucide-react";
import { Tree, TreeNode } from "react-organizational-chart";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "@/components/NotificationProvider";
import { useUser } from "@/components/UserProvider";
import { DatePicker } from "@/components/ui/date-picker";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface DocumentUploadItem {
  id: string;
  title: string;
  file: File | null;
}

const OrgNodeCard: React.FC<{
  name: string;
  title: string;
  avatar: string;
  role?: string;
  onClick?: () => void;
}> = ({ name, title, avatar, role, onClick }) => {
  const mouseDownPos = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    const deltaX = Math.abs(e.clientX - mouseDownPos.current.x);
    const deltaY = Math.abs(e.clientY - mouseDownPos.current.y);

    // Ignore click if mouse moved more than 5px (user was dragging/panning the tree)
    if (deltaX > 5 || deltaY > 5) {
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  const getBadgeStyle = (r?: string) => {
    switch (r) {
      case "CEO":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700";
      case "Manager":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700";
      case "Team Lead":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="inline-flex items-center gap-3.5 bg-white dark:bg-slate-800 rounded-2xl p-3.5 px-4 border border-slate-200/80 dark:border-slate-700 shadow-2xs w-60 text-left hover:shadow-md hover:border-blue-500/80 transition-all my-1 cursor-pointer select-none"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 pointer-events-none"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700 shrink-0 pointer-events-none">
          {name ? name.charAt(0) : "U"}
        </div>
      )}
      <div className="min-w-0 flex-1 pointer-events-none">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
          {name}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-normal mt-0.5 truncate">
          {title}
        </p>
        {role && (
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeStyle(role)}`}>
            {role}
          </span>
        )}
      </div>
    </div>
  );
};

const People: React.FC = () => {
  const { user: currentUser } = useUser();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<"directory" | "orgChart">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All departments");

  // Live Employee & Department data
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingModalDocs, setExistingModalDocs] = useState<any[]>([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [employeeDocs, setEmployeeDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);

  // Additional single document upload inside View Profile modal
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [uploadingSingleDoc, setUploadingSingleDoc] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);

  // Remove Employee Modal State
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removingEmployee, setRemovingEmployee] = useState<any>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Multiple Documents Upload State
  const [documentsToUpload, setDocumentsToUpload] = useState<DocumentUploadItem[]>([
    { id: "1", title: "", file: null }
  ]);

  // Document Preview Modal State
  const [previewModalData, setPreviewModalData] = useState<{ url: string; title: string; type?: string } | null>(null);

  const countryCodes = ["+1", "+44", "+91", "+61", "+81", "+49", "+33", "+86"];

  const initialFormState = {
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    role: "Employee",
    designation: "",
    department: "",
    location: "",
    skills: [] as string[],
    employmentType: "Full Time",
    joiningDate: "",
    salary: 0
  };

  const [newEmployee, setNewEmployee] = useState(initialFormState);
  const departmentSkillsMap: Record<string, string[]> = {
    CEO: ["Executive Leadership", "Strategic Planning", "Business Development", "Investor Relations", "Corporate Governance", "Public Relations", "Financial Growth", "Team Building"],
    Technical: ["React.js", "Node.js", "Next.js", "Postgres", "Docker", "TypeScript", "Python", "REST API", "Git", "System Design"],
    Product: ["Product Roadmap", "User Research", "Agile / Scrum", "JIRA", "Wireframing", "A/B Testing", "Analytics"],
    "Finance and Accounting": ["Financial Analysis", "Taxation", "Bookkeeping", "Excel Modeling", "QuickBooks", "Auditing", "Budgeting", "Payroll Accounting"],
    Marketing: ["SEO", "Content Writing", "Social Media Marketing", "Google Ads", "Copywriting", "Email Campaigns", "Brand Strategy", "Analytics"],
    Sales: ["Lead Generation", "CRM / Salesforce", "B2B Sales", "Negotiation", "Cold Calling", "Account Management", "Deal Closing"],
    "Human Resources": ["Recruitment", "Employee Engagement", "HR Policies", "Performance Management", "Conflict Resolution", "Onboarding"],
    Operations: ["Process Optimization", "Supply Chain", "Vendor Management", "Project Management", "Agile", "Resource Planning"],
    Legal: ["Contract Law", "Corporate Governance", "Compliance", "IP Law", "Risk Assessment", "Legal Drafting"],
  };

  // Custom Skills Input State
  const [customSkillsInput, setCustomSkillsInput] = useState("");
  const [customSkillsList, setCustomSkillsList] = useState<string[]>([]);

  const handleAddCustomSkills = () => {
    if (!customSkillsInput.trim()) return;

    const parsedSkills = customSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parsedSkills.length > 0) {
      setCustomSkillsList((prev) => Array.from(new Set([...prev, ...parsedSkills])));
      setNewEmployee((prev) => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...parsedSkills])),
      }));
      setCustomSkillsInput("");
      showSuccess(`Added ${parsedSkills.length} skill(s)!`);
    }
  };

  // Fetch employees & departments from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/emp/all`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const mappedEmployees = data.users.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role || "Employee",
          designation: emp.designation || emp.role || "Employee",
          department: emp.department || "Unassigned",
          status: emp.status || "Active",
          email: emp.email,
          phone: emp.phone,
          location: emp.location,
          avatar: emp.avatar_url ? `${API_BASE_URL}/uploads/${emp.avatar_url}` : "",
          skills: emp.skills || [],
          employmentType: emp.employment_type || "Full Time",
          joiningDate: emp.joining_date?.split("T")[0] || "",
          salary: emp.salary || 0,
        }));
        setEmployeesList(mappedEmployees);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/departments/all`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setDepartmentsList(data.departments || []);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Fetch documents for a specific employee
  const fetchEmployeeDocuments = async (empId: number) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/emp/${empId}/documents`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setEmployeeDocs(data.documents || []);
        return data.documents || [];
      }
    } catch (err) {
      console.error("Failed to fetch employee documents", err);
    } finally {
      setLoadingDocs(false);
    }
    return [];
  };

  // Calculate counts dynamically from live employee data
  const counts = useMemo(() => {
    const total = employeesList.length;
    const active = employeesList.filter((p) => p.status === "Active").length;
    const onLeave = employeesList.filter((p) => p.status === "On Leave" || p.status === "Probation").length;
    const terminated = employeesList.filter((p) => p.status === "Past" || p.status === "Terminated" || p.status === "Inactive").length;
    return { total, active, onLeave, terminated };
  }, [employeesList]);

  // Filter people list based on search, status filter, and department filter
  const filteredPeople = useMemo(() => {
    return employeesList.filter((person) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All statuses" || person.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All departments" ||
        person.department.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employeesList, searchQuery, statusFilter, departmentFilter]);

  // Dynamically compute Org Chart Hierarchy from live employee & department list
  const orgData = useMemo(() => {
    // 1. CEO / Top Executive Leadership
    const ceos = employeesList.filter(
      (p) => p.role?.toLowerCase() === "ceo" || p.designation?.toLowerCase() === "chief executive officer"
    );

    // 2. Extract departments present in DB or staff list
    const deptsInUse = Array.from(
      new Set([
        ...departmentsList.map((d) => d.name),
        ...employeesList.map((p) => p.department).filter((d) => d && d !== "Executive" && d !== "Unassigned"),
      ])
    );

    // 3. For each department, find Manager, Team Lead, and Employees
    const departmentTrees = deptsInUse.map((deptName) => {
      const deptStaff = employeesList.filter((p) => p.department === deptName && p.role?.toLowerCase() !== "ceo");

      const managers = deptStaff.filter((p) => p.role === "Manager");
      const teamLeads = deptStaff.filter((p) => p.role === "Team Lead");
      const employees = deptStaff.filter((p) => p.role !== "Manager" && p.role !== "Team Lead");

      return {
        department: deptName,
        managers,
        teamLeads,
        employees,
      };
    });

    return { ceos, departmentTrees };
  }, [employeesList, departmentsList]);

  // Handlers for Avatar & Documents
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addDocumentField = () => {
    setDocumentsToUpload(prev => [
      ...prev,
      { id: Date.now().toString(), title: "", file: null }
    ]);
  };

  const removeDocumentField = (id: string) => {
    if (documentsToUpload.length === 1) {
      setDocumentsToUpload([{ id: "1", title: "", file: null }]);
    } else {
      setDocumentsToUpload(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const clearUploadedFile = (id: string) => {
    setDocumentsToUpload(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, file: null } : doc))
    );
  };

  const updateDocumentTitle = (id: string, title: string) => {
    setDocumentsToUpload(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, title } : doc))
    );
  };

  const updateDocumentFile = (id: string, file: File | null) => {
    setDocumentsToUpload(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, file } : doc))
    );
  };

  const handlePreviewDocument = (fileOrUrl: File | string, title: string) => {
    if (typeof fileOrUrl === "string") {
      setPreviewModalData({ url: fileOrUrl, title });
    } else {
      const objectUrl = URL.createObjectURL(fileOrUrl);
      setPreviewModalData({ url: objectUrl, title, type: fileOrUrl.type });
    }
  };

  const toggleSkill = (skill: string) => {
    setNewEmployee(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const openAddModal = () => {
    setNewEmployee(initialFormState);
    setAvatarFile(null);
    setAvatarPreview("");
    setDocumentsToUpload([{ id: "1", title: "", file: null }]);
    setExistingModalDocs([]);
    setCustomSkillsList([]);
    setCustomSkillsInput("");
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = async (employee: any) => {
    let code = "+91";
    let number = employee.phone || "";

    for (const c of countryCodes) {
      if (employee.phone && employee.phone.startsWith(c)) {
        code = c;
        number = employee.phone.replace(c, "").trim();
        break;
      }
    }

    setNewEmployee({
      name: employee.name,
      email: employee.email,
      countryCode: code,
      phone: number,
      role: employee.role || "Employee",
      designation: employee.designation || "",
      department: employee.department || "",
      location: employee.location,
      skills: employee.skills || [],
      employmentType: employee.employmentType || "Full Time",
      joiningDate: employee.joiningDate || "",
      salary: employee.salary || 0
    });
    setAvatarFile(null);
    setAvatarPreview(employee.avatar || "");
    setDocumentsToUpload([{ id: "1", title: "", file: null }]);
    setCustomSkillsList(employee.skills || []);
    setCustomSkillsInput("");
    setEditingId(employee.id);

    // Load existing documents for edit modal preview
    const docs = await fetchEmployeeDocuments(employee.id);
    setExistingModalDocs(docs);

    setIsAddModalOpen(true);
  };

  const openViewModal = (employee: any) => {
    setViewingEmployee(employee);
    setNewDocTitle("");
    setNewDocFile(null);
    setIsViewModalOpen(true);
    fetchEmployeeDocuments(employee.id);
  };

  const openRemoveModal = (employee: any) => {
    setRemovingEmployee(employee);
    setRemovalReason("");
    setAdminPassword("");
    setIsRemoveModalOpen(true);
  };

  // Submit Add or Edit Employee
  const handleSaveEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
      showError("Name and email are required.");
      return;
    }

    const fullPhone = `${newEmployee.countryCode} ${newEmployee.phone}`.trim();
    const formData = new FormData();

    const isCEO = newEmployee.role === "CEO";
    const finalDesignation = isCEO ? "Chief Executive Officer" : newEmployee.designation;
    const finalDepartment = isCEO ? "Executive" : (newEmployee.department || "Unassigned");

    formData.append("name", newEmployee.name);
    formData.append("email", newEmployee.email);
    formData.append("role", newEmployee.role);
    formData.append("designation", finalDesignation);
    formData.append("department", finalDepartment);
    formData.append("phone", fullPhone);
    formData.append("location", newEmployee.location);
    formData.append("salary", String(newEmployee.salary));
    formData.append("joining_date", newEmployee.joiningDate);
    formData.append("employment_type", newEmployee.employmentType);
    formData.append("skills", JSON.stringify(newEmployee.skills));

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const docTitles: string[] = [];
    documentsToUpload.forEach(doc => {
      if (doc.file) {
        formData.append("documents", doc.file);
        docTitles.push(doc.title.trim() || doc.file.name);
      }
    });

    if (docTitles.length > 0) {
      formData.append("documentTitles", JSON.stringify(docTitles));
    }

    const isEdit = Boolean(editingId);
    const url = isEdit
      ? `${API_BASE_URL}/admin/emp/updateEmp/${editingId}`
      : `${API_BASE_URL}/admin/emp/addEmp`;
    const method = isEdit ? "PUT" : "POST";

    setIsSavingEmployee(true);
    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Operation failed");

      showSuccess(isEdit ? "Employee updated successfully!" : "Employee created with avatar & documents!");
      setIsAddModalOpen(false);
      setNewEmployee(initialFormState);
      setAvatarFile(null);
      setAvatarPreview("");
      setDocumentsToUpload([{ id: "1", title: "", file: null }]);
      setEditingId(null);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      showError(error?.message || "Failed to save employee");
    } finally {
      setIsSavingEmployee(false);
    }
  };

  // Upload single document inside View Modal
  const handleUploadSingleDocument = async () => {
    if (!newDocFile || !viewingEmployee) {
      showError("Please select a file to upload.");
      return;
    }

    setUploadingSingleDoc(true);
    try {
      const formData = new FormData();
      formData.append("document", newDocFile);
      formData.append("documentName", newDocTitle.trim() || newDocFile.name);

      const res = await fetch(`${API_BASE_URL}/admin/emp/${viewingEmployee.id}/upload-document`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload document");

      showSuccess("Document uploaded successfully!");
      setNewDocTitle("");
      setNewDocFile(null);
      fetchEmployeeDocuments(viewingEmployee.id);
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Upload failed");
    } finally {
      setUploadingSingleDoc(false);
    }
  };

  // Delete employee document state & handlers
  const [docToDelete, setDocToDelete] = useState<{ id: number; name?: string } | null>(null);

  const requestDeleteDocument = (docId: number, docName?: string) => {
    setDocToDelete({ id: docId, name: docName });
  };

  const executeDeleteDocument = async () => {
    if (!docToDelete) return;
    const docId = docToDelete.id;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/emp/documents/${docId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete document");

      showSuccess("Document deleted successfully");
      setExistingModalDocs(prev => prev.filter(d => d.id !== docId));
      if (viewingEmployee) {
        fetchEmployeeDocuments(viewingEmployee.id);
      }
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Could not delete document");
    } finally {
      setDocToDelete(null);
    }
  };

  // Confirm remove employee
  const handleConfirmRemove = async () => {
    if (!adminPassword || !removalReason) {
      showError("Please provide both a reason and your admin password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/emp/removeEmp/${removingEmployee.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: removalReason,
          password: adminPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to remove employee");

      showSuccess(`Employee ${removingEmployee.name} has been removed.`);
      setIsRemoveModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error removing employee:", error);
      showError(error.message || "An error occurred while removing the employee.");
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case "On Leave":
      case "Probation":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {status || "Inactive"}
          </span>
        );
    }
  };

  return (
    <div className="p-3 md:p-8 space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              People & Employees
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Manage team members, upload employee documents, and explore company directory.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Add People
          </Button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pt-2">
          <button
            onClick={() => setActiveTab("directory")}
            className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
              activeTab === "directory"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
            }`}
          >
            Directory ({counts.total})
          </button>
          <button
            onClick={() => setActiveTab("orgChart")}
            className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
              activeTab === "orgChart"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
            }`}
          >
            Org chart
          </button>
        </div>
      </div>

      {activeTab === "directory" ? (
        /* Directory View Container */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-6 shadow-2xs space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Total Employees
              </span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 block">
                {counts.total}
              </span>
            </div>

            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Active
              </span>
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
                {counts.active}
              </span>
            </div>

            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                On Leave / Probation
              </span>
              <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 mt-1.5 block">
                {counts.onLeave}
              </span>
            </div>

            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Terminated / Inactive
              </span>
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1.5 block">
                {counts.terminated}
              </span>
            </div>
          </div>

          {/* Search, Department & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, department or email..."
                className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Department Filter (Dynamic from DB) */}
            <div className="relative min-w-[180px]">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="All departments">All departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="All statuses">All statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Terminated">Terminated</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Directory Data Table - Desktop View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-4">ROLE / TITLE</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      Loading People directory...
                    </td>
                  </tr>
                ) : filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <tr
                      key={person.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-slate-200/60 dark:border-slate-700">
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {person.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {person.name}
                              </span>
                              {currentUser?.email?.toLowerCase() === person.email?.toLowerCase() && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shadow-3xs">
                                  YOU!
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                              {person.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {person.role}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {person.department}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {renderStatusBadge(person.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer"
                            onClick={() => openViewModal(person)}
                            title="View Profile & Documents"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer"
                            onClick={() => openEditModal(person)}
                            title="Edit Employee"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 cursor-pointer"
                            onClick={() => openRemoveModal(person)}
                            title="Remove Employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm"
                    >
                      No colleagues found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Directory Mobile View: Cards (No horizontal scroll) */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading People directory...
              </div>
            ) : filteredPeople.length > 0 ? (
              filteredPeople.map((person) => (
                <Card key={person.id} className="p-3 sm:p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-11 h-11 border border-slate-200 dark:border-slate-700 shrink-0">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {person.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {person.name}
                          </span>
                          {currentUser?.email?.toLowerCase() === person.email?.toLowerCase() && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shrink-0">
                              YOU!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {person.designation || person.role}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">{renderStatusBadge(person.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Department</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{person.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate block">{person.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
                    <Button
                      onClick={() => openViewModal(person)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-1 text-[11px] font-semibold cursor-pointer w-full flex items-center justify-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 shrink-0" /> View
                    </Button>
                    <Button
                      onClick={() => openEditModal(person)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-1 text-[11px] font-semibold text-blue-600 cursor-pointer w-full flex items-center justify-center"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 shrink-0" /> Edit
                    </Button>
                    <Button
                      onClick={() => openRemoveModal(person)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer w-full flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Remove
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No colleagues found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Org Chart View Container with Zoom, Pan, Pinch & Single Screen Fit */
        <div className="relative bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-4 shadow-3xs overflow-hidden w-full h-[calc(100vh-200px)] min-h-[600px]">
          <TransformWrapper
            initialScale={0.35}
            minScale={0.12}
            maxScale={2.5}
            centerOnInit={true}
            limitToBounds={false}
            wheel={{ step: 0.0005 }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
              <>
                {/* Floating Zoom & Pan Controls Bar */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-1.5 rounded-2xl shadow-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    onClick={() => zoomIn(0.08)}
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    onClick={() => zoomOut(0.08)}
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    onClick={() => resetTransform()}
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    onClick={() => centerView()}
                    title="Center View"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Transform Component Canvas */}
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }}
                  contentStyle={{ width: "100%", minHeight: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start" }}
                >
                  <div className="p-12 pb-24">
                    <Tree
                      lineWidth="1.5px"
                      lineColor="#cbd5e1"
                      lineBorderRadius="8px"
                      lineHeight="24px"
                      nodePadding="12px"
                      label={
                        orgData.ceos.length > 0 ? (
                          <OrgNodeCard
                            name={orgData.ceos[0].name}
                            title={orgData.ceos[0].designation || "Chief Executive Officer"}
                            avatar={orgData.ceos[0].avatar}
                            role="CEO"
                            onClick={() => openViewModal(orgData.ceos[0])}
                          />
                        ) : (
                          <OrgNodeCard
                            name="Executive Leadership"
                            title="CEO (Unassigned)"
                            avatar=""
                            role="CEO"
                          />
                        )
                      }
                    >
                      {orgData.departmentTrees.map((deptTree) => {
                        const manager = deptTree.managers[0];
                        const teamLead = deptTree.teamLeads[0];
                        const employees = deptTree.employees;

                        return (
                          <TreeNode
                            key={deptTree.department}
                            label={
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs">
                                  {deptTree.department}
                                </span>
                                {manager ? (
                                  <OrgNodeCard
                                    name={manager.name}
                                    title={manager.designation || manager.role}
                                    avatar={manager.avatar}
                                    role={manager.role}
                                    onClick={() => openViewModal(manager)}
                                  />
                                ) : (
                                  <div className="w-60 py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-400 dark:text-slate-500 text-center bg-white dark:bg-slate-800 my-1">
                                    No Manager
                                  </div>
                                )}
                              </div>
                            }
                          >
                            <TreeNode
                              label={
                                teamLead ? (
                                  <OrgNodeCard
                                    name={teamLead.name}
                                    title={teamLead.designation || teamLead.role}
                                    avatar={teamLead.avatar}
                                    role={teamLead.role}
                                    onClick={() => openViewModal(teamLead)}
                                  />
                                ) : (
                                  <div className="w-60 py-2 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-400 dark:text-slate-500 text-center bg-white dark:bg-slate-800 my-1">
                                    No Team Lead
                                  </div>
                                )
                              }
                            >
                              {employees.map((emp) => (
                                <TreeNode
                                  key={emp.id}
                                  label={
                                    <OrgNodeCard
                                      name={emp.name}
                                      title={emp.designation || emp.role}
                                      avatar={emp.avatar}
                                      role={emp.role}
                                      onClick={() => openViewModal(emp)}
                                    />
                                  }
                                />
                              ))}
                            </TreeNode>
                          </TreeNode>
                        );
                      })}
                    </Tree>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}

      {/* --- Add / Edit Employee Modal with Avatar & Document Uploads --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit People Profile" : "Add New People"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingId ? "Update details, avatar image, and documents." : "Enter details, upload avatar picture, and attach employee documents."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* --- 1. Avatar Upload Section --- */}
              <div className="flex items-center gap-5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {newEmployee.name ? newEmployee.name.charAt(0) : <ImageIcon size={24} />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    Employee Avatar Photo (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload size={14} /> Upload Picture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    {avatarFile && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[180px]">
                        {avatarFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* --- 2. Personal & Employment Details --- */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                    <div className="flex gap-2">
                      <Select
                        value={newEmployee.countryCode}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, countryCode: value })}
                      >
                        <SelectTrigger className="w-[80px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[200px]">
                          {countryCodes.map((code) => (
                            <SelectItem key={code} value={code} className="text-slate-900 dark:text-white cursor-pointer">
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="1234567890"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role Dropdown */}
                  <div className={`space-y-2 ${newEmployee.role === "CEO" ? "md:col-span-2" : ""}`}>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectItem value="Employee" className="text-slate-900 dark:text-white cursor-pointer">Employee</SelectItem>
                        <SelectItem value="Team Lead" className="text-slate-900 dark:text-white cursor-pointer">Team Lead</SelectItem>
                        <SelectItem value="Manager" className="text-slate-900 dark:text-white cursor-pointer">Manager</SelectItem>
                        <SelectItem value="CEO" className="text-slate-900 dark:text-white cursor-pointer">CEO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Designation Input (Hidden if Role is CEO) */}
                  {newEmployee.role !== "CEO" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation (Job Title)</label>
                      <Input
                        placeholder="e.g. Senior Frontend Engineer"
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Dropdown (Hidden if Role is CEO) */}
                  {newEmployee.role !== "CEO" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                      <Select
                        value={newEmployee.department}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[220px]">
                          {departmentsList.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name} className="text-slate-900 dark:text-white cursor-pointer">
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Employee Address */}
                  <div className={`space-y-2 ${newEmployee.role === "CEO" ? "md:col-span-2" : ""}`}>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee Address</label>
                    <Input
                      placeholder="e.g. New York, USA or Remote"
                      value={newEmployee.location}
                      onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Type</label>
                    <Select
                      value={newEmployee.employmentType}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, employmentType: value })}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salary (Monthly ₹)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 12000"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value === "" ? 0 : Number(e.target.value) })}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Joining Date</label>
                  <DatePicker
                    value={newEmployee.joiningDate}
                    onChange={(dateStr) => setNewEmployee({ ...newEmployee, joiningDate: dateStr })}
                    placeholder="Select joining date"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-sm font-bold text-slate-900 dark:text-white">
                      Skills ({newEmployee.skills.length} Selected)
                    </label>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {newEmployee.role === "CEO"
                        ? "Recommended Executive Skills for CEO"
                        : newEmployee.department
                        ? `Recommended for ${newEmployee.department}`
                        : "Select a department above to see skills"}
                    </span>
                  </div>

                  {/* Dynamic Department Presets + Custom Skills Badges Container */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 max-h-[160px] overflow-y-auto min-h-[52px] items-center">
                    {(() => {
                      const targetKey = newEmployee.role === "CEO" ? "CEO" : newEmployee.department;
                      const deptPresets = targetKey ? (departmentSkillsMap[targetKey] || []) : [];
                      const allDisplaySkills = Array.from(new Set([...deptPresets, ...customSkillsList, ...newEmployee.skills]));

                      if (allDisplaySkills.length === 0) {
                        return (
                          <p className="text-xs text-slate-400 dark:text-slate-500 py-1 text-center w-full">
                            Please select a department above to view recommended skills.
                          </p>
                        );
                      }

                      return allDisplaySkills.map((skill) => {
                        const isSelected = newEmployee.skills.includes(skill);
                        return (
                          <Badge
                            key={skill}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                              isSelected
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800"
                                : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                            }`}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            {isSelected ? <X size={12} className="opacity-70" /> : <Plus size={12} className="opacity-50" />}
                          </Badge>
                        );
                      });
                    })()}
                  </div>

                  {/* Add Custom Skills Input Box (Comma-Separated) */}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Add other skills (comma-separated, e.g. GraphQL, Tailwind, AWS)"
                      value={customSkillsInput}
                      onChange={(e) => setCustomSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkills();
                        }
                      }}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSkills}
                      disabled={!customSkillsInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer shrink-0"
                    >
                      <Plus size={14} className="mr-1" /> Add Skills
                    </Button>
                  </div>
                </div>
              </div>

              {/* --- 3. Multiple Employee Documents Upload Section --- */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" /> Employee Documents (Optional)
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload Resume, ID Proof, Certificates or Contracts for this employee.
                    </p>
                  </div>
                </div>

                {/* Existing Documents if Editing */}
                {editingId && existingModalDocs.length > 0 && (
                  <div className="space-y-2 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Existing Uploaded Documents ({existingModalDocs.length})
                    </label>
                    {existingModalDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {doc.document_name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            ({(Number(doc.file_size || 0) / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => handlePreviewDocument(`${API_BASE_URL}/uploads/${doc.file_url}`, doc.document_name)}
                            className="h-7 w-7 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => requestDeleteDocument(doc.id, doc.document_name)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-md cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Fields List */}
                {documentsToUpload.map((docItem, index) => (
                  <div
                    key={docItem.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      docItem.file
                        ? "border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-2xs"
                        : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
                      <Input
                        placeholder={`Title (e.g. Resume #${index + 1})`}
                        value={docItem.title}
                        onChange={(e) => updateDocumentTitle(docItem.id, e.target.value)}
                        className="w-full sm:w-48 shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                      />

                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {docItem.file ? (
                          <div className="flex-1 flex items-center justify-between gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-2xs min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={docItem.file.name}>
                                {docItem.file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => handlePreviewDocument(docItem.file!, docItem.title || docItem.file!.name)}
                                className="h-7 w-7 text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-md cursor-pointer"
                                title="Preview Document"
                              >
                                <Eye size={15} />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => clearUploadedFile(docItem.id)}
                                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-md cursor-pointer"
                                title="Clear Selected File"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-2xs min-w-0">
                            <Upload size={15} className="text-blue-500" />
                            <span>Choose Document File</span>
                            <input
                              type="file"
                              onChange={(e) => updateDocumentFile(docItem.id, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        )}

                        {documentsToUpload.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => removeDocumentField(docItem.id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg shrink-0 cursor-pointer"
                            title="Remove document field"
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocumentField}
                  className="w-full py-2.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={15} /> Add More Document
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer border-slate-200 dark:border-slate-800 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEmployee}
                disabled={isSavingEmployee}
                className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 cursor-pointer disabled:opacity-50"
              >
                {isSavingEmployee ? "Saving..." : editingId ? "Save Changes" : "Create People"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- View Employee Profile & Documents Modal --- */}
      {isViewModalOpen && viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-100 dark:bg-slate-900 h-28 w-full relative shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full cursor-pointer bg-white/60 hover:bg-white dark:bg-black/20"
                onClick={() => setIsViewModalOpen(false)}
              >
                <X className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              </Button>
            </div>

            <div className="px-6 pb-6 -mt-10 relative overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-950 shadow-md mb-3">
                  <AvatarImage src={viewingEmployee.avatar} />
                  <AvatarFallback className="text-2xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {viewingEmployee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{viewingEmployee.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{viewingEmployee.role}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingEmployee.department}
                  </Badge>
                  <Badge variant="outline">{viewingEmployee.status}</Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <div className="flex items-center mt-1 text-slate-700 dark:text-slate-300 font-medium truncate">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{viewingEmployee.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                  <div className="flex items-center mt-1 text-slate-700 dark:text-slate-300 font-medium">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" /> {viewingEmployee.phone || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Location</label>
                  <div className="flex items-center mt-1 text-slate-700 dark:text-slate-300 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{viewingEmployee.location || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employment Type</label>
                  <div className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                    {viewingEmployee.employmentType}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Joining Date</label>
                  <div className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                    {viewingEmployee.joiningDate || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Salary</label>
                  <div className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                    {viewingEmployee.salary ? `₹${Number(viewingEmployee.salary).toLocaleString()}` : "N/A"}
                  </div>
                </div>
              </div>

              {/* --- Uploaded Employee Documents List --- */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" /> Uploaded Employee Documents ({employeeDocs.length})
                  </h3>
                </div>

                {/* Upload New Document Form inside Profile */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
                  <Input
                    placeholder="New Document Title (e.g. Tax Certificate)"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="bg-white dark:bg-slate-900 text-xs flex-1"
                  />
                  <label className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shrink-0 flex items-center gap-1.5">
                    <Upload size={14} />
                    <span className="truncate max-w-[120px]">
                      {newDocFile ? newDocFile.name : "Select File"}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <Button
                    size="sm"
                    onClick={handleUploadSingleDocument}
                    disabled={!newDocFile || uploadingSingleDoc}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer shrink-0"
                  >
                    {uploadingSingleDoc ? "Uploading..." : "Upload Doc"}
                  </Button>
                </div>

                {/* Documents List */}
                {loadingDocs ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Loading employee documents...</p>
                ) : employeeDocs.length === 0 ? (
                  <div className="p-6 text-center border border-slate-100 dark:border-slate-800 rounded-xl">
                    <File size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-1" />
                    <p className="text-xs text-slate-400 font-medium">No documents uploaded for this employee yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {employeeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {doc.document_name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} • {(Number(doc.file_size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => handlePreviewDocument(`${API_BASE_URL}/uploads/${doc.file_url}`, doc.document_name)}
                            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye size={15} />
                          </Button>
                          <a
                            href={`${API_BASE_URL}/uploads/${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={14} /> Download
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => requestDeleteDocument(doc.id, doc.document_name)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <Button
                  className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 cursor-pointer"
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingEmployee); }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Employee
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer border-slate-200 dark:border-slate-800"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- Document Preview Modal --- */}
      {previewModalData && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-base truncate max-w-[140px] sm:max-w-[400px]">
                  {previewModalData.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={previewModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Download size={14} /> <span className="hidden sm:inline">Open / </span>Download
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setPreviewModalData(null)}
                >
                  <X className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center border border-slate-200 dark:border-slate-800 relative">
              {previewModalData.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || previewModalData.type?.startsWith("image/") ? (
                <img
                  src={previewModalData.url}
                  alt={previewModalData.title}
                  className="max-h-[500px] w-auto object-contain rounded"
                />
              ) : (
                <iframe
                  src={previewModalData.url}
                  title={previewModalData.title}
                  className="w-full h-[500px] border-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- Delete Document Confirmation Modal --- */}
      {docToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Document?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{docToDelete.name || "this document"}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer dark:text-white dark:border-slate-700"
                onClick={() => setDocToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                onClick={executeDeleteDocument}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- Remove Confirmation Modal --- */}
      {isRemoveModalOpen && removingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Remove Employee?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You are about to remove <span className="font-semibold text-slate-900 dark:text-white">{removingEmployee.name}</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Removal</label>
                <Input
                  placeholder="e.g. Resignation, Termination..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5" /> Admin Password (2FA)
                </label>
                <Input
                  type="password"
                  placeholder="Enter admin password (use 1234)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer dark:text-white dark:border-slate-700"
                onClick={() => setIsRemoveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmRemove}
                disabled={!removalReason || !adminPassword}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default People;
