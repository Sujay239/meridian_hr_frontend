import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  X,
  FolderOpen
} from "lucide-react";
import type { DocumentItem } from "../data/demoData";
import { documentsDemoData } from "../data/demoData";

import { useNotification } from "@/components/NotificationProvider";

const Documents: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const { showSuccess } = useNotification();

  const [documents, setDocuments] = useState<DocumentItem[]>(documentsDemoData);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All types");
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [uploadDocTitle, setUploadDocTitle] = useState("");
  const [uploadDocFile, setUploadDocFile] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchLiveDocuments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/emp/all-documents`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.documents && data.documents.length > 0) {
            const liveDocs = data.documents.map((d: any) => ({
              id: `live-${d.id}`,
              title: d.document_name,
              category: "Personal & Contracts",
              type: (d.file_type?.toLowerCase() === "pdf" ? "pdf" : "doc") as "pdf" | "doc",
              size: `${(Number(d.file_size || 0) / 1024).toFixed(1)} KB`,
              updatedText: new Date(d.uploaded_at).toLocaleDateString(),
              status: "Acknowledged" as const,
              author: d.user_name || "Employee",
              fileUrl: `${API_BASE_URL}/uploads/${d.file_url}`
            }));
            setDocuments([...liveDocs, ...documentsDemoData]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live employee documents", err);
      }
    };
    fetchLiveDocuments();
  }, []);

  // Dynamic counts
  const counts = useMemo(() => {
    const total = documents.length;
    const needsAck = documents.filter((d) => d.status === "Needs ack").length;
    const acknowledged = documents.filter((d) => d.status === "Acknowledged").length;
    const sharedWithMe = documents.filter((d) => d.category === "Personal & Contracts").length;
    return { total, needsAck, acknowledged, sharedWithMe };
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        activeCategory === "All" || doc.category === activeCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.author && doc.author.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        typeFilter === "All types" ||
        (typeFilter === "PDF" && doc.type === "pdf") ||
        (typeFilter === "Word" && doc.type === "doc");

      const matchesStatus =
        statusFilter === "All statuses" || doc.status === statusFilter;

      return matchesCategory && matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, activeCategory, searchQuery, typeFilter, statusFilter]);

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: "Acknowledged" as const } : doc
      )
    );
  };

  const renderIconBox = (type: "pdf" | "doc", isGrid = false) => {
    if (type === "pdf") {
      return (
        <div
          className={`${
            isGrid ? "w-12 h-12" : "w-10 h-10"
          } rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center gap-0.5 shrink-0`}
        >
          <img src="/pdf.svg" alt="PDF Icon" className={`${isGrid ? "w-4 h-5" : "w-3.5 h-4.5"}`} />
          <img src="/pdf-word.svg" alt="PDF" className={`${isGrid ? "h-3" : "h-2.5"} w-auto`} />
        </div>
      );
    }
    return (
      <div
        className={`${
          isGrid ? "w-12 h-12" : "w-10 h-10"
        } rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center gap-0.5 shrink-0`}
      >
        <img src="/word.svg" alt="Word Icon" className={`${isGrid ? "w-4 h-5" : "w-3.5 h-4.5"}`} />
        <img src="/Background-word.svg" alt="DOC" className={`${isGrid ? "h-3" : "h-2.5"} w-auto`} />
      </div>
    );
  };

  const renderStatusBadge = (doc: DocumentItem) => {
    if (doc.status === "Acknowledged") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
          <CheckCircle2 size={13} className="text-emerald-500" />
          Acknowledged
        </span>
      );
    }
    return (
      <button
        onClick={(e) => handleAcknowledge(doc.id, e)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 transition-all cursor-pointer shadow-3xs"
      >
        <AlertCircle size={13} className="text-amber-500" />
        Needs ack
      </button>
    );
  };

  return (
    <div className="p-3 md:p-8 space-y-6  font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Documents
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
            Access company policies, handbooks, personal contracts, and shared files.
          </p>
        </div>

        <button
          onClick={() => { setUploadDocTitle(""); setUploadDocFile(null); setIsUploadModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total documents */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Total documents
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 block">
            {counts.total}
          </span>
        </div>

        {/* Needs acknowledgment */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Needs ack
          </span>
          <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 mt-1.5 block">
            {counts.needsAck}
          </span>
        </div>

        {/* Acknowledged */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Acknowledged
          </span>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            {counts.acknowledged}
          </span>
        </div>

        {/* Shared with me */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 bg-white dark:bg-slate-900/60 shadow-3xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Personal & Contracts
          </span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1.5 block">
            {counts.sharedWithMe}
          </span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        {/* Category Tabs & View Mode Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {["All", "Company Policy", "Personal & Contracts", "Benefits & Payroll"].map(
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
                  {cat === "All" ? "All Documents" : cat}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title="List View"
            >
              <ListIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
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
              placeholder="Search by document name or author..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Type Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All types">All types</option>
              <option value="PDF">PDF</option>
              <option value="Word">Word</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All statuses">All statuses</option>
              <option value="Needs ack">Needs ack</option>
              <option value="Acknowledged">Acknowledged</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* View Mode: List vs Grid */}
        {viewMode === "list" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">DOCUMENT NAME</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">UPDATED</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Title + Icon */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          {renderIconBox(doc.type)}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {doc.title}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                              {doc.size} {doc.author && `· ${doc.author}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-normal">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {doc.category}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 font-normal">
                        {doc.updatedText}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{renderStatusBadge(doc)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Preview Document"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showSuccess(`Downloading ${doc.title}...`);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
                            title="Download File"
                          >
                            <Download size={16} />
                          </button>
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
                      No documents found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {renderIconBox(doc.type, true)}
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        {doc.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    <p>{doc.size}</p>
                    <p className="mt-0.5">{doc.updatedText}</p>
                  </div>
                  <div>{renderStatusBadge(doc)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {renderIconBox(selectedDoc.type)}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedDoc.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 text-center space-y-3 border border-slate-100 dark:border-slate-800">
              <FolderOpen size={48} className="mx-auto text-blue-500/70" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Document Preview Mode
              </p>
              <p className="text-xs text-slate-400">
                {selectedDoc.title} ({selectedDoc.size}) is ready to download or view.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>{renderStatusBadge(selectedDoc)}</div>
              <div className="flex items-center gap-2">
                {(selectedDoc as any).fileUrl ? (
                  <a
                    href={(selectedDoc as any).fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={16} /> Download File
                  </a>
                ) : (
                  <button
                    onClick={() => showSuccess(`Downloading ${selectedDoc.title}...`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={16} /> Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadDocFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-blue-400"
                />
                {uploadDocFile && <p className="text-xs text-slate-500 mt-1">Selected: {uploadDocFile.name}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">Cancel</button>
                <button
                  onClick={() => { showSuccess("Document uploaded successfully!"); setIsUploadModalOpen(false); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
