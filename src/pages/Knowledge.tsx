import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Globe,
  Building2,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Pin,
  Upload,
  Calendar,
  User,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "@/components/NotificationProvider";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  scope: "Universal" | "Department";
  department: string | null;
  summary: string;
  content: string;
  author_id: number | null;
  author_name: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number;
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "Policy",
  "SOP / Workflow",
  "Guide / Manual",
  "Benefits & Perks",
  "IT & Security",
  "Training & Onboarding"
];

const Knowledge: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [activeTab, setActiveTab] = useState<"All" | "Universal" | "Department">("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readingArticle, setReadingArticle] = useState<KnowledgeArticle | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<KnowledgeArticle | null>(null);

  // Form State
  const initialFormState = {
    title: "",
    category: "Policy",
    scope: "Universal" as "Universal" | "Department",
    department: "Technical",
    summary: "",
    content: "",
    is_pinned: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch departments dynamically from DB
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/departments/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDepartmentsList(data.departments || []);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  // Fetch articles from backend
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (activeTab !== "All") queryParams.append("scope", activeTab);
      if (selectedDept !== "All") queryParams.append("department", selectedDept);
      if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
      if (searchQuery) queryParams.append("search", searchQuery);

      const res = await fetch(`${API_BASE_URL}/knowledge/all?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      } else {
        showError("Failed to load knowledge articles.");
      }
    } catch (err) {
      console.error("Error fetching knowledge articles:", err);
      showError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [activeTab, selectedDept, selectedCategory, searchQuery]);

  // Handle Article Open Reader Modal
  const openReader = async (article: KnowledgeArticle) => {
    setReadingArticle(article);
    // Increment view count in backend
    try {
      await fetch(`${API_BASE_URL}/knowledge/view/${article.id}`, {
        method: "POST",
        credentials: "include",
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a))
      );
    } catch (e) {
      // Non-critical
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setAttachmentFile(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (article: KnowledgeArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      category: article.category,
      scope: article.scope,
      department: article.department || "Technical",
      summary: article.summary || "",
      content: article.content || "",
      is_pinned: article.is_pinned,
    });
    setAttachmentFile(null);
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter an article title.");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title.trim());
      submitData.append("category", formData.category);
      submitData.append("scope", formData.scope);
      if (formData.scope === "Department") {
        submitData.append("department", formData.department);
      }
      submitData.append("summary", formData.summary.trim());
      submitData.append("content", formData.content.trim());
      submitData.append("is_pinned", String(formData.is_pinned));

      if (attachmentFile) {
        submitData.append("attachment", attachmentFile);
      }

      const url = editingId
        ? `${API_BASE_URL}/knowledge/update/${editingId}`
        : `${API_BASE_URL}/knowledge/add`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: submitData,
        credentials: "include",
      });

      if (res.ok) {
        showSuccess(
          editingId
            ? "Knowledge article updated successfully!"
            : "Knowledge article published successfully!"
        );
        setIsAddModalOpen(false);
        fetchArticles();
      } else {
        const errorData = await res.json();
        showError(errorData.message || "Failed to save knowledge article.");
      }
    } catch (err) {
      console.error("Error saving article:", err);
      showError("Server error while saving knowledge article.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Article
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        showSuccess("Knowledge article deleted successfully.");
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (readingArticle?.id === id) setReadingArticle(null);
      } else {
        showError("Failed to delete knowledge article.");
      }
    } catch (err) {
      showError("Server error while deleting knowledge article.");
    }
  };

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 animate-in fade-in duration-300">
      <div className="space-y-8">
        
        {/* --- Header & Title --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <BookOpen size={26} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Knowledge Base & SOP Directory
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Central hub for company policies, department workflows, guidelines, and document attachments.
              </p>
            </div>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md cursor-pointer font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Knowledge Article
          </Button>
        </div>

        {/* --- Filters Bar & Search --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Scope Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setActiveTab("All");
                setSelectedDept("All");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "All"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => {
                setActiveTab("Universal");
                setSelectedDept("All");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "Universal"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Universal Knowledge
            </button>
            <button
              onClick={() => {
                setActiveTab("Department");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "Department"
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Department Knowledge
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search articles & docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
              <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Department Pills Sub-bar (if Department or All active) */}
        {(activeTab === "Department" || activeTab === "All") && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Departments:
            </span>
            <button
              onClick={() => setSelectedDept("All")}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedDept === "All"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              All Departments
            </button>
            {departmentsList.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedDept === dept.name
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        )}

        {/* --- Articles Grid View --- */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">Loading knowledge base...</div>
        ) : articles.length === 0 ? (
          <Card className="p-16 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Articles Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No knowledge articles match your current search or department filter.
            </p>
            <Button onClick={openAddModal} className="mt-4 bg-blue-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Knowledge Article
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className={`group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                  article.is_pinned ? "ring-2 ring-blue-500/30 dark:ring-blue-500/20" : ""
                }`}
              >
                <div className="p-6">
                  {/* Scope & Tag Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {article.scope === "Universal" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[10px] font-bold">
                          <Globe className="w-3 h-3 mr-1" /> Universal
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 text-[10px] font-bold">
                          <Building2 className="w-3 h-3 mr-1" /> {article.department}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {article.category}
                      </Badge>
                    </div>

                    {article.is_pinned && (
                      <span className="p-1 text-amber-500 bg-amber-50 dark:bg-amber-950/50 rounded-full" title="Pinned Article">
                        <Pin size={13} className="fill-amber-500" />
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => openReader(article)}
                    className="font-bold text-lg text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-2 mb-2"
                  >
                    {article.title}
                  </h3>

                  {/* Summary Preview */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {article.summary || article.content}
                  </p>

                  {/* Attached Document Card (If attached) */}
                  {article.file_url && (
                    <a
                      href={`${API_BASE_URL}/uploads/${article.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors mb-4 group/file"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover/file:text-blue-600">
                            {article.file_name || "Attached Document"}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {article.file_type || "FILE"} • {formatFileSize(article.file_size)}
                          </span>
                        </div>
                      </div>
                      <Download size={14} className="text-slate-400 group-hover/file:text-blue-600 shrink-0 ml-2" />
                    </a>
                  )}
                </div>

                {/* Footer Info & Actions */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {article.author_name || "HR Team"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {article.views} views
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReader(article)}
                      className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold cursor-pointer"
                    >
                      Read Article
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(article)}
                      className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setArticleToDelete(article)}
                      className="h-7 w-7 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* --- Add / Edit Article Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Knowledge Article" : "Add Knowledge Article"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Publish universal policies or department-specific operating guidelines & SOP documents.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Article Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Corporate Travel & Reimbursement SOP"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              {/* Scope & Department Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Scope */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Knowledge Scope *
                  </label>
                  <Select
                    value={formData.scope}
                    onValueChange={(val: "Universal" | "Department") =>
                      setFormData({ ...formData, scope: val })
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                      <SelectValue placeholder="Select Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Universal">🌐 Universal (All Company)</SelectItem>
                      <SelectItem value="Department">🏢 Department Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Select (if Scope === 'Department') */}
                {formData.scope === "Department" ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Department *
                    </label>
                    <Select
                      value={formData.department}
                      onValueChange={(val) => setFormData({ ...formData, department: val })}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsList.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Category Tag *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Category Tag (if Department scope selected above) */}
              {formData.scope === "Department" && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category Tag *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Summary */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Short Summary / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence description of this knowledge item..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Content / Body */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Article Content & Guidelines
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter full article guidelines, SOP steps, rules, or instructions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              {/* File Attachment Upload Box */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Attach Document / File (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 transition-colors">
                  <input
                    type="file"
                    id="knowledge-file-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachmentFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="knowledge-file-input" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-6 w-6 text-blue-500 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {attachmentFile ? attachmentFile.name : "Click to attach document or file"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {attachmentFile
                        ? `${formatFileSize(attachmentFile.size)} • Click to change`
                        : "Supports PDF, DOCX, PNG, ZIP, etc."}
                    </span>
                  </label>
                </div>
              </div>

              {/* Pin Article Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pin-checkbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin this article to top of Knowledge Base
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {submitting ? "Saving..." : editingId ? "Update Article" : "Publish Article"}
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* --- Article Reader View Modal --- */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-3xl p-6 md:p-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2 pr-6">
                <div className="flex items-center gap-2">
                  {readingArticle.scope === "Universal" ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold">
                      <Globe className="w-3.5 h-3.5 mr-1" /> Universal Knowledge
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold">
                      <Building2 className="w-3.5 h-3.5 mr-1" /> {readingArticle.department} Department
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {readingArticle.category}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {readingArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={13} /> {readingArticle.author_name || "HR Team"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {new Date(readingArticle.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} /> {readingArticle.views} views
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                onClick={() => setReadingArticle(null)}
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            {/* Attached Document Card */}
            {readingArticle.file_url && (
              <div className="mb-6 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {readingArticle.file_name || "Attached Document"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {readingArticle.file_type?.toUpperCase()} • {formatFileSize(readingArticle.file_size)}
                    </p>
                  </div>
                </div>
                <a
                  href={`${API_BASE_URL}/uploads/${readingArticle.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Download size={14} /> Download File
                </a>
              </div>
            )}

            {/* Summary Box */}
            {readingArticle.summary && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl mb-6 text-xs text-slate-600 dark:text-slate-300 italic">
                "{readingArticle.summary}"
              </div>
            )}

            {/* Content Body */}
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {readingArticle.content || "No detailed content provided."}
            </div>

          </Card>
        </div>
      )}

      {/* --- Delete Article Confirmation Modal --- */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Knowledge Article?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{articleToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setArticleToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={() => {
                  handleDelete(articleToDelete.id);
                  setArticleToDelete(null);
                }}
              >
                Delete Article
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Knowledge;
