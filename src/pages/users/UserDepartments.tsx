import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    Building2,
    Users,
    Eye,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface Department {
    id: number;
    name: string;
    code: string;
    description: string;
    head_id: number | null;
    head_name?: string;
    head_email?: string;
    head_avatar?: string;
    member_count: number;
}

const UserDepartments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);
    const [selectedDeptMembers, setSelectedDeptMembers] = useState<any[]>([]);
    const [selectedDeptName, setSelectedDeptName] = useState<string>("");
    const [membersLoading, setMembersLoading] = useState<boolean>(false);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments/all`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments(data.departments || []);
            }
        } catch (err) {
            console.error("Failed to fetch departments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

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
        } finally {
            setMembersLoading(false);
        }
    };

    const filteredDepartments = departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 animate-in fade-in duration-500">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Company Departments
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Explore company organizational teams, department leads, and team members.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="py-20 text-center text-slate-500">Loading departments...</div>
                ) : filteredDepartments.length === 0 ? (
                    <Card className="p-12 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                        <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No departments found.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDepartments.map((dept) => (
                            <Card
                                key={dept.id}
                                className="group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md transition-all p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-100 dark:border-blue-800/40">
                                            {dept.code}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                                                {dept.name}
                                            </h3>
                                            <span className="text-[11px] text-slate-400 font-mono">CODE: {dept.code}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                                        {dept.description || "Company operational department."}
                                    </p>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mb-4">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                            Department Lead
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={dept.head_avatar} />
                                                <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    {dept.head_name ? dept.head_name.charAt(0) : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {dept.head_name || "Unassigned"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Users size={14} className="text-blue-500" /> {dept.member_count} Members
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openMembersModal(dept)}
                                        className="text-xs border-slate-200 dark:border-slate-800 cursor-pointer h-7"
                                    >
                                        <Eye size={12} className="mr-1" /> View Team
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* View Members Modal */}
            {isMembersModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {selectedDeptName} - Team Members
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Colleagues working in this department.
                                </p>
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
                            <div className="py-10 text-center text-slate-500">Loading members...</div>
                        ) : selectedDeptMembers.length === 0 ? (
                            <div className="py-10 text-center text-slate-500">No members assigned yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDeptMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.avatar_url} />
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
                                        <Badge variant="outline" className="text-xs">
                                            {member.status || "Active"}
                                        </Badge>
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
        </div>
    );
};

export default UserDepartments;
