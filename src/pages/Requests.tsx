import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  MessageSquare,
  X,
  Sparkles
} from "lucide-react";
import type { RequestItem } from "../data/demoData";
import { requestsDemoData } from "../data/demoData";

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>(requestsDemoData);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  // New Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<RequestItem["category"]>("General HR");
  const [newDescription, setNewDescription] = useState("");

  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchLiveRequests = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/leaves/all`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const liveReqs: RequestItem[] = data.map((l: any) => ({
              id: `req-${l.id}`,
              reqNumber: `#REQ-${1000 + l.id}`,
              title: `${l.type || 'Leave'} Application (${l.reason || 'Time off'})`,
              category: "Benefits & Leave" as const,
              openedText: l.created_at ? `Opened ${new Date(l.created_at).toLocaleDateString()}` : "Opened recently",
              status: (l.status === "Approved" ? "Resolved" : l.status === "Pending" ? "Awaiting HR" : "In progress") as RequestItem["status"],
              assignedTo: "HR Operations",
              description: l.reason || `Leave requested for ${l.days || 1} days (${l.dates || ''})`,
              commentsCount: 0,
              updatedAt: l.created_at || new Date().toISOString()
            }));
            setRequests([...liveReqs, ...requestsDemoData]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live leave requests", err);
      }
    };
    fetchLiveRequests();
  }, []);

  // Dynamic counts
  const counts = useMemo(() => {
    const total = requests.length;
    const awaiting = requests.filter((r) => r.status === "Awaiting HR").length;
    const inProgress = requests.filter((r) => r.status === "In progress").length;
    const resolved = requests.filter((r) => r.status === "Resolved").length;
    return { total, awaiting, inProgress, resolved };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesCategory =
        activeCategory === "All" || req.category === activeCategory;

      const query = (searchQuery || "").toLowerCase();
      const matchesSearch =
        !searchQuery || !searchQuery.trim() ||
        (req.title || "").toLowerCase().includes(query) ||
        (req.reqNumber || "").toLowerCase().includes(query) ||
        (req.category || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || req.status === statusFilter;

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [requests, activeCategory, searchQuery, statusFilter]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReq: RequestItem = {
      id: `r_${Date.now()}`,
      reqNumber: `#REQ-${Math.floor(1050 + Math.random() * 50)}`,
      title: newTitle.trim(),
      category: newCategory,
      openedText: "Opened just now",
      status: "Awaiting HR",
      assignedTo: "Olivia Bennett",
      description: newDescription.trim() || "No detailed description provided.",
      commentsCount: 0,
      updatedAt: "Just now",
    };

    setRequests([newReq, ...requests]);
    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const renderStatusBadge = (status: RequestItem["status"]) => {
    switch (status) {
      case "Awaiting HR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Awaiting HR
          </span>
        );
      case "In progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="p-3 md:p-8 space-y-6  font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
            Track HR inquiries, document requests, status updates, and submit new requests.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total requests */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Total requests
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 block">
            {counts.total}
          </span>
        </div>

        {/* Awaiting HR */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Awaiting HR
          </span>
          <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 mt-1.5 block">
            {counts.awaiting}
          </span>
        </div>

        {/* In progress */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            In progress
          </span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1.5 block">
            {counts.inProgress}
          </span>
        </div>

        {/* Resolved */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Resolved
          </span>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            {counts.resolved}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-800/80 pb-4">
          {["All", "General HR", "Payroll & Tax", "Benefits & Leave", "Equipment & IT"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat === "All" ? "All Requests" : cat}
              </button>
            )
          )}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by request number, title or category..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All statuses">All statuses</option>
              <option value="Awaiting HR">Awaiting HR</option>
              <option value="In progress">In progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-3xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <MessageSquare size={18} />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {req.title}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {req.reqNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>{req.openedText}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {req.category}
                      </span>
                      {req.assignedTo && (
                        <>
                          <span>·</span>
                          <span>Assigned to: {req.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {renderStatusBadge(req.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No requests found matching your filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> Create New HR Request
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Request Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Update direct deposit banking info"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as RequestItem["category"])}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="General HR">General HR</option>
                  <option value="Payroll & Tax">Payroll & Tax</option>
                  <option value="Benefits & Leave">Benefits & Leave</option>
                  <option value="Equipment & IT">Equipment & IT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Details
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your request in detail..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                  {selectedRequest.reqNumber}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-0.5">
                  {selectedRequest.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Category: <strong className="text-slate-800 dark:text-slate-200">{selectedRequest.category}</strong>
              </span>
              <div>{renderStatusBadge(selectedRequest.status)}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Description
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedRequest.description}
              </p>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>Assigned Representative: <strong className="text-slate-700 dark:text-slate-300">{selectedRequest.assignedTo}</strong></p>
              <p>Last Activity: <span>{selectedRequest.updatedAt}</span></p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
