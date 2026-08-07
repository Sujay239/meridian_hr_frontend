import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  HelpCircle,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Menu,
  Timer,
  Bell,
  MessageSquare,
  CalendarCheck,
  Wallet,
  Home,
  CheckSquare,
  FileText,
  Presentation,
  Building2
} from "lucide-react";
import {
  DashboardIcon,
  PeopleIcon,
  DocumentsIcon,
  RequestsIcon,
  KnowledgeIcon
} from "./SidebarIcons";
import { useUser } from "./UserProvider";
import { useNotification } from "./NotificationProvider";

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number | string;
};

const primaryNavItems: NavItem[] = [
  // Items matching the reference design layout
  { label: "Overview", to: "/user/overview", icon: <DashboardIcon className="w-4 h-4" /> },
  { label: "People", to: "/user/people", icon: <PeopleIcon className="w-4 h-4" /> },
  { label: "Documents", to: "/user/documents", icon: <DocumentsIcon className="w-4 h-4" /> },
  { label: "Requests", to: "/user/requests", icon: <RequestsIcon className="w-4 h-4" /> },
  { label: "Knowledge", to: "/user/knowledge", icon: <KnowledgeIcon className="w-4 h-4" /> },

  // Existing original user features
  { label: "Home", to: "/user", icon: <Home size={18} /> },
  { label: "Departments", to: "/user/departments", icon: <Building2 size={18} /> },
  { label: "Tasks", to: "/user/tasks", icon: <CheckSquare size={18} /> },
  { label: "Notifications", to: "/user/notifications", icon: <Bell size={18} /> },
  { label: "Attendance", to: "/user/attendance", icon: <CalendarCheck size={18} /> },
  { label: "Chats", to: "/user/chats", icon: <MessageSquare size={18} /> },
  { label: "Payroll", to: "/user/payroll", icon: <Wallet size={18} /> },
  { label: "Apply Leave", to: "/user/leave", icon: <FileText size={18} /> },
  { label: "Meetings", to: "/user/meetings", icon: <Presentation size={18} /> },
];

const secondaryNavItems: NavItem[] = [
  { label: "Support", to: "/user/support", icon: <HelpCircle size={18} /> },
  { label: "Settings", to: "/user/settings", icon: <Settings size={18} /> },
];

const UserSidebar: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const { user } = useUser();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Attendance state logic
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const checkStatus = () => {
      const status = localStorage.getItem("attendance_status");
      setIsCheckedIn(status === "clocked_in");
    };

    checkStatus();
    window.addEventListener("storage", checkStatus);
    const interval = setInterval(checkStatus, 1000);

    return () => {
      window.removeEventListener("storage", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleClockAction = async () => {
    if (isClockingIn) return;
    setIsClockingIn(true);

    try {
      if (!isCheckedIn) {
        const response = await fetch(`${API_BASE_URL}/employee/dashboard/clock-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          await response.json();
          const now = Date.now();
          localStorage.setItem("attendance_status", "clocked_in");
          localStorage.setItem("attendance_start_time", now.toString());
          setIsCheckedIn(true);
          showSuccess("Clocked In Successfully!");
        } else {
          const errorData = await response.json();
          showError(errorData.message || "Clock In Failed");
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/employee/dashboard/clock-out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          await response.json();
          localStorage.removeItem("attendance_status");
          localStorage.removeItem("attendance_start_time");
          setIsCheckedIn(false);
          showSuccess("Clocked Out Successfully!");
        } else {
          const errorData = await response.json();
          showError(errorData.message || "Clock Out Failed");
        }
      }
    } catch (error) {
      console.error("Clock Action Error:", error);
      showError("Failed to update attendance. Please try again.");
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });
      if (res.ok) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isExpandedVisual = mobileOpen ? true : expanded;

  const filteredPrimaryItems = primaryNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg border border-blue-500"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
          transition-all duration-300 ease-in-out
          flex flex-col justify-between h-screen select-none
          w-64 ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          ${expanded ? "lg:w-64" : "lg:w-20"}
          shrink-0
        `}
      >
        {/* Desktop Toggle Button on Divider Line */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-md absolute -right-3.5 top-7 z-50 cursor-pointer"
          title={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-hidden p-4">
          {/* Header / Brand Logo Section */}
          <div className="flex items-center justify-between pb-3 h-16 border-b border-slate-100 dark:border-slate-800/50 relative mb-2">
            <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isExpandedVisual ? 'w-full h-14' : 'w-full justify-center'}`}>
              {isExpandedVisual ? (
                <>
                  <img
                    src="/logo.png"
                    alt="Meridian HR Logo"
                    className="h-12 w-auto object-contain transition-all duration-300 dark:hidden"
                  />
                  <img
                    src="/dark-logo.png"
                    alt="Meridian HR Logo"
                    className="h-12 w-auto object-contain transition-all duration-300 hidden dark:block"
                  />
                </>
              ) : (
                <>
                  <img
                    src="/mobile-logo.png"
                    alt="Meridian HR Logo"
                    className="h-8 w-8 object-contain transition-all duration-300 dark:hidden"
                  />
                  <img
                    src="/dark-collapsed-logo.png"
                    alt="Meridian HR Logo"
                    className="h-8 w-8 object-contain transition-all duration-300 hidden dark:block"
                  />
                </>
              )}
            </div>
          </div>

          {/* Search Field */}
          <div className="my-2">
            {isExpandedVisual ? (
              <div className="relative flex items-center px-3 py-2 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full ml-2 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 font-mono flex items-center gap-0.5 shrink-0 shadow-2xs">
                  <span>⌘</span><span>K</span>
                </span>
              </div>
            ) : (
              <TooltipWrapper label="Search" expanded={isExpandedVisual}>
                <div className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <Search size={18} />
                </div>
              </TooltipWrapper>
            )}
          </div>

          {/* Primary Nav Items */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
            {filteredPrimaryItems.map((item) => (
              <TooltipWrapper key={item.to} label={item.label} expanded={isExpandedVisual}>
                <NavLink
                  to={item.to}
                  end={item.to === "/user"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative
                    ${isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }
                    ${!isExpandedVisual ? "justify-center" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                    <span className={`whitespace-nowrap transition-all duration-200 ${isExpandedVisual ? "opacity-100" : "opacity-0 hidden"}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge !== undefined && isExpandedVisual && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </TooltipWrapper>
            ))}
          </div>

          {/* Clock In / Clock Out Action Button */}
          <div className="mt-2 mb-1">
            <TooltipWrapper label={isCheckedIn ? "Clock Out" : "Check In"} expanded={isExpandedVisual}>
              <button
                disabled={isClockingIn}
                onClick={handleClockAction}
                className={`
                  w-full flex items-center rounded-xl font-semibold text-xs transition-all duration-200 shadow-2xs cursor-pointer justify-center
                  ${isCheckedIn
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                  ${isExpandedVisual ? "px-3 py-2 gap-2" : "p-2"}
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {isCheckedIn ? (
                  <Timer size={16} className="animate-pulse shrink-0" />
                ) : (
                  <LogIn size={16} className="shrink-0" />
                )}
                {isExpandedVisual && (
                  <span>{isCheckedIn ? "Clock Out" : "Check In"}</span>
                )}
              </button>
            </TooltipWrapper>
          </div>

          {/* Secondary Nav Items */}
          <div className="pt-1 space-y-1">
            {secondaryNavItems.map((item) => (
              <TooltipWrapper key={item.to} label={item.label} expanded={isExpandedVisual}>
                <NavLink
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                    ${isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }
                    ${!isExpandedVisual ? "justify-center" : "gap-3"}
                  `}
                >
                  <span className="flex items-center justify-center shrink-0">{item.icon}</span>
                  <span className={`whitespace-nowrap ${isExpandedVisual ? "opacity-100" : "opacity-0 hidden"}`}>{item.label}</span>
                </NavLink>
              </TooltipWrapper>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div
            onClick={() => navigate('/user/settings')}
            className={`flex items-center p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 transition-all cursor-pointer shadow-2xs ${
              isExpandedVisual ? "justify-between" : "justify-center border-none p-0"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || "https://ui-avatars.com/api/?name=Olivia+Rhye"}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  alt="User Avatar"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>

              {isExpandedVisual && (
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name || "Olivia Rhye"}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {user?.email || "olivia@untitledui.com"}
                  </span>
                </div>
              )}
            </div>

            {isExpandedVisual && (
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

interface TooltipWrapperProps {
  children: React.ReactNode;
  label: string;
  expanded: boolean;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  label,
  expanded,
}) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!expanded && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
      setHovered(true);
    }
  };

  const handleMouseLeave = () => setHovered(false);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>

      {!expanded &&
        hovered &&
        createPortal(
          <div
            style={{
              top: `${tooltipPos.top}px`,
              left: `${tooltipPos.left}px`,
            }}
            className="fixed z-[9999] px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl -translate-y-1/2 pointer-events-none whitespace-nowrap"
          >
            {label}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
          </div>,
          document.body
        )}
    </>
  );
};

export default UserSidebar;
