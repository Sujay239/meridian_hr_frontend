import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Plus,
    Search,
    Building2,
    Users,
    DollarSign,
    Edit,
    Trash2,
    Eye,
    X,
    CheckCircle2,
    AlertTriangle,
    Grid,
    List,
    TrendingUp,
    UserCheck
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNotification } from "@/components/NotificationProvider";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface Department {
    id: number;
    name: string;
    code: string;
    description: string;
    budget: number;
    status: string;
    head_id: number | null;
    head_name?: string;
    head_email?: string;
    head_avatar?: string;
    member_count: number;
    total_payroll: number;
}

interface EmployeeOption {
    id: number;
    name: string;
    designation: string;
    email: string;
    avatar_url?: string;
}

const PRESET_DEPARTMENTS = [
    { name: "Technical", code: "TECH" },
    { name: "Finance and Accounting", code: "FIN" },
    { name: "Marketing", code: "MKT" },
    { name: "Sales", code: "SLS" },
    { name: "Human Resources", code: "HR" },
    { name: "Operations", code: "OPS" },
    { name: "Product", code: "PRD" },
    { name: "Legal", code: "LGL" }
];

const formatAvatarUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    if (url.startsWith("uploads/")) return `${API_BASE_URL}/${url}`;
    return `${API_BASE_URL}/uploads/${url}`;
};

const AdminDepartments: React.FC = () => {
    const { showSuccess, showError } = useNotification();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [editingDeptId, setEditingDeptId] = useState<number | null>(null);

    const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);
    const [selectedDeptMembers, setSelectedDeptMembers] = useState<any[]>([]);
    const [selectedDeptName, setSelectedDeptName] = useState<string>("");
    const [membersLoading, setMembersLoading] = useState<boolean>(false);

    // Form state
    const initialFormState = {
        name: "",
        code: "",
        description: "",
        head_id: "unassigned",
        budget: 100000,
        status: "Active"
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments/all`, {
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to fetch departments");
            const data = await res.json();
            setDepartments(data.departments || []);
        } catch (err: any) {
            console.error(err);
            showError("Could not load departments");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeesList = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/emp/all`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.users || []);
            }
        } catch (err) {
            console.error("Failed to fetch employee list for manager selection", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchEmployeesList();
    }, []);

    // Preset button click
    const applyPreset = (preset: { name: string; code: string }) => {
        setFormData(prev => ({
            ...prev,
            name: preset.name,
            code: preset.code,
            description: `${preset.name} team responsible for organizational strategies and operational goals.`
        }));
    };

    // Open add modal
    const openAddModal = () => {
        setFormData(initialFormState);
        setEditingDeptId(null);
        setIsAddModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (dept: Department) => {
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || "",
            head_id: dept.head_id ? String(dept.head_id) : "unassigned",
            budget: Number(dept.budget) || 0,
            status: dept.status || "Active"
        });
        setEditingDeptId(dept.id);
        setIsAddModalOpen(true);
    };

    // Save department (Add or Edit)
    const handleSaveDepartment = async () => {
        if (!formData.name.trim() || !formData.code.trim()) {
            showError("Department Name and Code are required.");
            return;
        }

        try {
            const isEdit = Boolean(editingDeptId);
            const url = isEdit
                ? `${API_BASE_URL}/admin/departments/update/${editingDeptId}`
                : `${API_BASE_URL}/admin/departments/add`;
            const method = isEdit ? "PUT" : "POST";

            const payload = {
                name: formData.name,
                code: formData.code,
                description: formData.description,
                head_id: (formData.head_id && formData.head_id !== "unassigned") ? Number(formData.head_id) : null,
                budget: formData.budget,
                status: formData.status
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save department");

            showSuccess(isEdit ? "Department updated successfully!" : "Department created successfully!");
            setIsAddModalOpen(false);
            setFormData(initialFormState);
            setEditingDeptId(null);
            fetchDepartments();
        } catch (err: any) {
            console.error(err);
            showError(err.message || "Failed to save department");
        }
    };

    // Delete department state & handlers
    const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

    const handleDeleteDepartment = (dept: Department) => {
        setDeptToDelete(dept);
    };

    const confirmDeleteDepartment = async () => {
        if (!deptToDelete) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments/remove/${deptToDelete.id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete department");

            showSuccess(`Department ${deptToDelete.name} removed successfully.`);
            fetchDepartments();
        } catch (err: any) {
            console.error(err);
            showError(err.message || "Failed to delete department");
        } finally {
            setDeptToDelete(null);
        }
    };

    // View Members
    const openMembersModal = async (dept: Department) => {
        setSelectedDeptName(dept.name);
        setIsMembersModalOpen(true);
        setMembersLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments/${dept.id}/members`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedDeptMembers(data.members || []);
            }
        } catch (err) {
            console.error(err);
            showError("Failed to load department members");
        } finally {
            setMembersLoading(false);
        }
    };

    // Filter departments
    const filteredDepartments = departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Summary calculations
    const totalDepartmentsCount = departments.length;
    const totalMembersCount = departments.reduce((sum, d) => sum + Number(d.member_count || 0), 0);
    const totalBudgetSum = departments.reduce((sum, d) => sum + Number(d.budget || 0), 0);
    const activeDepartmentsCount = departments.filter(d => d.status === "Active").length;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 animate-in fade-in duration-500">
            <div className="space-y-8">
                {/* --- Header --- */}
                <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur support-[backdrop-filter]:bg-slate-50/50 py-4 -mx-6 px-6 lg:-mx-10 lg:px-10 -mt-6 lg:-mt-6 border-b border-slate-200/50 dark:border-slate-800/50 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Departments
                                </h1>
                                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                                    Manage company departments, budgets, and organizational teams.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={openAddModal}
                        className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-lg cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Department
                    </Button>
                </div>

                {/* --- Metric Overview Cards --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Total Departments
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {totalDepartmentsCount}
                                </h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Building2 className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <TrendingUp className="h-3.5 w-3.5 mr-1" /> All operational units active
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Total Headcount
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {totalMembersCount} Employees
                                </h3>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Assigned across teams
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Total Annual Budget
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    ₹{totalBudgetSum.toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Allocated department funds
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Active Status
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {activeDepartmentsCount} / {totalDepartmentsCount}
                                </h3>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                            100% operational efficiency
                        </div>
                    </Card>
                </div>

                {/* --- Toolbar / Search & View Mode --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search departments by name, code or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 p-1 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                                viewMode === "grid"
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                            }`}
                            title="Grid View"
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                                viewMode === "table"
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                            }`}
                            title="Table View"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* --- Department Cards Grid / Table View --- */}
                {loading ? (
                    <div className="py-20 text-center text-slate-500">Loading departments...</div>
                ) : filteredDepartments.length === 0 ? (
                    <Card className="p-12 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                        <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Departments Found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            No department matched your search criteria. You can create a new department anytime.
                        </p>
                        <Button onClick={openAddModal} className="mt-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDepartments.map((dept) => (
                            <Card
                                key={dept.id}
                                className="group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-800/40">
                                                {dept.code}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                                    {dept.name}
                                                </h3>
                                                <span className="text-xs text-slate-400 font-mono">CODE: {dept.code}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                dept.status === "Active"
                                                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                                                    : "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200"
                                            }`}
                                        >
                                            {dept.status}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                                        {dept.description || "No description provided."}
                                    </p>

                                    {/* Department Head Info */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                                            Department Lead
                                        </span>
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                                                <AvatarImage src={formatAvatarUrl(dept.head_avatar)} />
                                                <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {dept.head_name ? dept.head_name.charAt(0) : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                                                {dept.head_name || "Unassigned"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Badge Row */}
                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Members</span>
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                                <Users size={12} className="text-blue-500" /> {dept.member_count} Employees
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Annual Budget</span>
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                                ₹{Number(dept.budget).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openMembersModal(dept)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer h-8"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" /> View Team ({dept.member_count})
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(dept)}
                                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                            title="Edit Department"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteDepartment(dept)}
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                            title="Delete Department"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3.5 px-4">Code</th>
                                        <th className="py-3.5 px-4">Department Name</th>
                                        <th className="py-3.5 px-4">Description</th>
                                        <th className="py-3.5 px-4">Lead</th>
                                        <th className="py-3.5 px-4">Members</th>
                                        <th className="py-3.5 px-4">Budget</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredDepartments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{dept.code}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{dept.name}</td>
                                            <td className="py-3 px-4 max-w-xs truncate">{dept.description || "N/A"}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={formatAvatarUrl(dept.head_avatar)} />
                                                        <AvatarFallback className="text-[10px]">{dept.head_name?.charAt(0) || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{dept.head_name || "Unassigned"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dept.member_count}</td>
                                            <td className="py-3 px-4 font-medium">₹{Number(dept.budget).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={dept.status === "Active" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" : "text-slate-500"}>
                                                    {dept.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openMembersModal(dept)}>
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(dept)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDepartment(dept)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* --- Add / Edit Department Modal --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingDeptId ? "Edit Department" : "Add New Department"}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {editingDeptId ? "Update existing department details." : "Create a new department for team organization."}
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

                        {/* Quick Presets (Only when adding) */}
                        {!editingDeptId && (
                            <div className="mb-5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                    Quick Preset Suggestions
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_DEPARTMENTS.map((preset) => (
                                        <button
                                            key={preset.code}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-colors cursor-pointer"
                                        >
                                            + {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Department Name *
                                    </label>
                                    <Input
                                        placeholder="e.g. Technical"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Code *
                                    </label>
                                    <Input
                                        placeholder="TECH"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the department responsibilities and domain..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Department Lead / Head
                                    </label>
                                    <Select
                                        value={formData.head_id}
                                        onValueChange={(val) => setFormData({ ...formData, head_id: val })}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                            <SelectValue placeholder="Select Lead" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[220px]">
                                            <SelectItem value="unassigned" className="text-slate-500">Unassigned</SelectItem>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={String(emp.id)} className="cursor-pointer">
                                                    {emp.name} ({emp.designation})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Annual Budget (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="150000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Status
                                </label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                className="cursor-pointer border-slate-200 dark:border-slate-800 dark:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveDepartment}
                                className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 cursor-pointer"
                            >
                                {editingDeptId ? "Save Changes" : "Create Department"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- View Department Members Modal --- */}
            {isMembersModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {selectedDeptName} - Team Members
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedDeptMembers.length} employees currently assigned to this department.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setIsMembersModalOpen(false)}
                            >
                                <X className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>

                        {membersLoading ? (
                            <div className="py-12 text-center text-slate-500">Loading department members...</div>
                        ) : selectedDeptMembers.length === 0 ? (
                            <div className="py-12 text-center">
                                <Users size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    No employees assigned to this department yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDeptMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                                                <AvatarImage src={formatAvatarUrl(member.avatar_url || member.avatar)} />
                                                <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {member.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {member.designation || "Employee"} • {member.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant="outline"
                                                className={member.status === "Active" ? "text-emerald-600 border-emerald-200" : "text-amber-600"}
                                            >
                                                {member.status || "Active"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setIsMembersModalOpen(false)}
                                className="cursor-pointer border-slate-200 dark:border-slate-800 dark:text-white"
                            >
                                Close
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- Delete Department Confirmation Modal --- */}
            {deptToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Department?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{deptToDelete.name}</span>?
                        </p>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1 cursor-pointer dark:text-white"
                                onClick={() => setDeptToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                                onClick={confirmDeleteDepartment}
                            >
                                Delete
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDepartments;
