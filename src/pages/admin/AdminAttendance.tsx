import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarCheck, Download, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, RefreshCw, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, addDays, isToday, isFuture } from "date-fns";
import { useNotification } from "@/components/NotificationProvider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AttendanceRecord {
    id: number;
    attendance_id: number | null;
    name: string;
    email: string;
    designation: string;
    department: string;
    avatar_url: string | null;
    date: string;
    checkIn: string;
    checkOut: string;
    status: "Present" | "Late" | "Absent" | "On Leave" | "Half Day" | string;
    hours: string;
}

interface AttendanceStats {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    leaveCount: number;
    totalEmployees: number;
}

const AdminAttendance: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AttendanceStats>({
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        leaveCount: 0,
        totalEmployees: 0
    });
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { showError, showSuccess } = useNotification();

    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    // Filter records dynamically by status & search
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesStatus = statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesSearch = searchQuery.trim() === "" ||
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.designation.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [records, statusFilter, searchQuery]);

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const displayDate = format(selectedDate, "EEEE, d MMMM yyyy");

    const fetchAttendanceData = async (dateStr: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/attendance/daily?date=${dateStr}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setRecords(data.records || []);
                setStats(data.stats || { presentCount: 0, lateCount: 0, absentCount: 0, leaveCount: 0, totalEmployees: 0 });
            } else {
                showError("Failed to fetch real-time attendance data");
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            showError("Server error fetching attendance");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData(formattedDate);
    }, [formattedDate]);

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const handleExportCSV = () => {
        if (records.length === 0) {
            showError("No data available to export");
            return;
        }

        const headers = ["Employee", "Department", "Designation", "Date", "Check In", "Check Out", "Working Hours", "Status"];
        const rows = records.map(r => [
            `"${r.name}"`,
            `"${r.department}"`,
            `"${r.designation}"`,
            `"${r.date}"`,
            `"${r.checkIn}"`,
            `"${r.checkOut}"`,
            `"${r.hours}"`,
            `"${r.status}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Attendance_Report_${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess("Attendance report exported successfully");
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 animate-in fade-in duration-500">
            <div className="space-y-8">

                <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur support-[backdrop-filter]:bg-slate-50/50 py-4 -mx-6 px-6 lg:-mx-10 lg:px-10 -mt-6 lg:-mt-6 border-b border-slate-200/50 dark:border-slate-800/50 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Attendance Monitoring
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                            Track daily employee check-ins and working hours in real-time.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => fetchAttendanceData(formattedDate)}
                            className="dark:bg-slate-800 dark:text-white dark:border-slate-800 cursor-pointer"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                        <Button 
                            onClick={handleExportCSV}
                            variant="outline" 
                            className="dark:bg-slate-800 dark:text-white dark:border-slate-800 cursor-pointer"
                        >
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                    </div>
                </div>

                {/* --- Date Navigation --- */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevDay}
                        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-slate-500" />
                        <span className="font-semibold text-slate-900 dark:text-white text-lg max-sm:text-[12px]">
                            {isToday(selectedDate) ? "Today" : displayDate}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextDay}
                        disabled={isToday(selectedDate) || isFuture(addDays(selectedDate, 1))}
                        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:border-slate-800"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* --- Stats Row --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600"> <CheckCircle2 size={24} /> </div>
                        <div> <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{stats.presentCount}</p> <p className="text-xs text-slate-500 dark:text-slate-400">Present Today</p> </div>
                    </Card>
                    <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600"> <XCircle size={24} /> </div>
                        <div> <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{stats.absentCount}</p> <p className="text-xs text-slate-500 dark:text-slate-400">Absent</p> </div>
                    </Card>
                    <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600"> <Clock size={24} /> </div>
                        <div> <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{stats.lateCount}</p> <p className="text-xs text-slate-500 dark:text-slate-400">Late Arrivals</p> </div>
                    </Card>
                    <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600"> <CalendarCheck size={24} /> </div>
                        <div> <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{stats.leaveCount}</p> <p className="text-xs text-slate-500 dark:text-slate-400">On Leave</p> </div>
                    </Card>
                </div>

                {/* --- Filters & Search Bar --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search employee name, department, or designation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="w-full md:w-60 shrink-0">
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-10">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    <SelectValue placeholder="Filter by Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses ({records.length})</SelectItem>
                                <SelectItem value="Present">Present ({stats.presentCount})</SelectItem>
                                <SelectItem value="Late">Late ({stats.lateCount})</SelectItem>
                                <SelectItem value="Absent">Absent ({stats.absentCount})</SelectItem>
                                <SelectItem value="On Leave">On Leave ({stats.leaveCount})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Desktop View: Table --- */}
                <Card className="hidden md:block border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
                    <div className="p-0 overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                                <p className="text-sm font-medium">Loading real-time attendance data...</p>
                            </div>
                        ) : filteredRecords.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="px-6 py-4 font-medium">Employee</th>
                                        <th className="px-6 py-4 font-medium">Department</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Check In</th>
                                        <th className="px-6 py-4 font-medium">Check Out</th>
                                        <th className="px-6 py-4 font-medium">Working Hours</th>
                                        <th className="px-6 py-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div>
                                                    <div className="font-bold">{record.name}</div>
                                                    <div className="text-xs text-slate-400 font-normal">{record.designation}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">{record.department}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{record.date}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">{record.checkIn}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">{record.checkOut}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">{record.hours}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant="outline" className={`
                                                    ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800' : ''}
                                                    ${record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : ''}
                                                    ${record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : ''}
                                                    ${record.status === 'On Leave' || record.status === 'Half Day' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' : ''}
                                                `}>
                                                    {record.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                                <p>No attendance records found matching status filter "{statusFilter}".</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* --- Mobile View: Cards --- */}
                <div className="md:hidden space-y-4">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                            <p className="text-sm font-medium">Loading real-time attendance data...</p>
                        </div>
                    ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <Card key={record.id} className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{record.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.department} • {record.designation}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CalendarCheck className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{record.date}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`
                                        ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800' : ''}
                                        ${record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : ''}
                                        ${record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : ''}
                                        ${record.status === 'On Leave' || record.status === 'Half Day' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' : ''}
                                    `}>
                                        {record.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check In</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{record.checkIn}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check Out</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{record.checkOut}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Total Hours
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{record.hours}</span>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-10 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p>No attendance records found for this date.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminAttendance;
