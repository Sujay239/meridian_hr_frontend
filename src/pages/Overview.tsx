import React from "react";
import {
  Plus,
  ArrowRight,
  Mail,
  BookOpen,
  Users as UsersIcon,
  MessageSquare,
  FileSpreadsheet
} from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { useNotification } from "@/components/NotificationProvider";

// Demo Data Types
interface OpenRequest {
  id: string;
  reqNumber: string;
  title: string;
  openedText: string;
  status: "Awaiting HR" | "In progress" | "Resolved";
  isSelected?: boolean;
}

interface DocumentItem {
  id: string;
  title: string;
  type: "pdf" | "doc";
  updatedText: string;
  status: "Acknowledged" | "Needs ack";
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOrDivider?: boolean;
}

interface PinnedResource {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
}

const openRequestsData: OpenRequest[] = [
  {
    id: "1",
    reqNumber: "#REQ-1042",
    title: "Update my home address",
    openedText: "Opened 2 days ago",
    status: "Awaiting HR",
  },
  {
    id: "2",
    reqNumber: "#REQ-1038",
    title: "Request a copy of my employment contract",
    openedText: "Opened 4 days ago",
    status: "In progress",
    isSelected: true,
  },
  {
    id: "3",
    reqNumber: "#REQ-1031",
    title: "Parental leave — eligibility question",
    openedText: "Opened 6 days ago",
    status: "In progress",
  },
  {
    id: "4",
    reqNumber: "#REQ-1027",
    title: "Correct my tax withholding details",
    openedText: "Resolved yesterday",
    status: "Resolved",
  },
  {
    id: "5",
    reqNumber: "#REQ-1048",
    title: "Enroll in the 2026 dental plan",
    openedText: "Opened 1 day ago",
    status: "In progress",
  },
];

const documentsData: DocumentItem[] = [
  {
    id: "d1",
    title: "Employee Handbook 2026.pdf",
    type: "pdf",
    updatedText: "Updated 3 days ago",
    status: "Acknowledged",
  },
  {
    id: "d2",
    title: "Remote Work Policy.docx",
    type: "doc",
    updatedText: "Shared 1 week ago",
    status: "Needs ack",
  },
  {
    id: "d3",
    title: "Q2 Benefits Summary.pdf",
    type: "pdf",
    updatedText: "Shared 2 weeks ago",
    status: "Acknowledged",
  },
  {
    id: "d4",
    title: "Offer Letter — signed.pdf",
    type: "doc",
    updatedText: "Shared 3 weeks ago",
    status: "Needs ack",
  },
  {
    id: "d5",
    title: "Health Plan Enrollment.pdf",
    type: "doc",
    updatedText: "Updated 1 month ago",
    status: "Needs ack",
  },
];

const teamData: TeamMember[] = [
  {
    id: "t1",
    name: "Sarah Chen",
    role: "Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "t2",
    name: "Marcus Webb",
    role: "Teammate",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "t3",
    name: "Elena Rossi",
    role: "Teammate",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "or",
    name: "OR",
    role: "",
    avatar: "",
    isOrDivider: true,
  },
  {
    id: "t4",
    name: "David Okafor",
    role: "Teammate",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "t5",
    name: "Priya Nair",
    role: "People Lead",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
  },
];

const pinnedResources: PinnedResource[] = [
  {
    id: "p1",
    title: "How to request time off",
    category: "Knowledge · Policy",
    icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: "p2",
    title: "2026 Payroll calendar",
    category: "Documents · Payroll",
    icon: <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: "p3",
    title: "Your benefits at a glance",
    category: "Knowledge · Benefits",
    icon: <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: "p4",
    title: "Getting IT support",
    category: "Knowledge · IT",
    icon: <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
];

const Overview: React.FC = () => {
  const { user } = useUser();
  const { showSuccess } = useNotification();
  const userName = user?.name ? user.name.split(" ")[0] : "Andrew";

  // Helper for Status Badge styling
  const renderRequestStatus = (status: OpenRequest["status"]) => {
    switch (status) {
      case "Awaiting HR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Awaiting HR
          </span>
        );
      case "In progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Resolved
          </span>
        );
    }
  };

  const renderDocumentStatus = (status: DocumentItem["status"]) => {
    if (status === "Acknowledged") {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
          Acknowledged
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
        Needs ack
      </span>
    );
  };

  return (
    <div className="p-3 md:p-8 space-y-6  font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Good morning, {userName} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Top 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* My open requests Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4 gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                My open requests
              </h2>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="#all-requests"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline transition-all"
                >
                  View all requests <ArrowRight size={14} />
                </a>
                <button
                  onClick={() => showSuccess("Request form ready")}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> New Request
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-2">
              {openRequestsData.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                    req.isSelected
                      ? "bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                      : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {req.openedText} · <span className="font-mono text-slate-500 dark:text-slate-400">{req.reqNumber}</span>
                    </p>
                  </div>
                  <div>{renderRequestStatus(req.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Your people Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Your people
              </h2>
              <a
                href="#team"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline transition-all"
              >
                View team <ArrowRight size={14} />
              </a>
            </div>

            {/* Team Members List */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {teamData.map((member) =>
                member.isOrDivider ? (
                  <div
                    key={member.id}
                    className="flex flex-col items-center justify-center shrink-0 mx-2"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                      OR
                    </div>
                  </div>
                ) : (
                  <div
                    key={member.id}
                    className="flex flex-col items-center text-center shrink-0 min-w-[85px] group cursor-pointer"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 group-hover:border-blue-500 transition-all shadow-xs"
                    />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2 truncate max-w-[90px]">
                      {member.name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
                      {member.role}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent documents Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent documents
              </h2>
              <a
                href="#all-documents"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline transition-all"
              >
                View all <ArrowRight size={14} />
              </a>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              {documentsData.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Document Icon Box */}
                    {doc.type === "pdf" ? (
                      <div className="w-10 h-10 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center gap-0.5 shrink-0">
                        <img src="/pdf.svg" alt="PDF Icon" className="w-3.5 h-4.5" />
                        <img src="/pdf-word.svg" alt="PDF" className="h-2.5 w-auto" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center gap-0.5 shrink-0">
                        <img src="/word.svg" alt="Word Icon" className="w-3.5 h-4.5" />
                        <img src="/Background-word.svg" alt="DOC" className="h-2.5 w-auto" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {doc.updatedText}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">{renderDocumentStatus(doc.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HR CONTACT Card */}
          <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-wider text-blue-200 uppercase block mb-4">
                HR CONTACT
              </span>
              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  alt="Olivia Bennett"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-xs"
                />
                <div>
                  <h3 className="text-base font-bold text-white">Olivia Bennett</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Your HR contact · Demo Co
                  </p>
                </div>
              </div>
              <button
                onClick={() => showSuccess("Opening message dialog with Olivia Bennett...")}
                className="w-full bg-white hover:bg-blue-50 active:bg-blue-100 text-slate-900 font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-5 shadow-xs cursor-pointer"
              >
                <Mail size={16} className="text-slate-700" /> Message HR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Pinned resources */}
      <div className="pt-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Pinned resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pinnedResources.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {res.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                  {res.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
