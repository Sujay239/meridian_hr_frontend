// Dedicated non-component file for sharing data and constants across components
// This ensures Vite Fast Refresh works cleanly without warnings on component files

export interface Person {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  status: "Active" | "On leave" | "Terminated";
  avatar: string;
  isYou?: boolean;
}

export const peopleDemoData: Person[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@democo.com",
    title: "Engineering Manager",
    department: "Engineering",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Marcus Webb",
    email: "marcus.webb@democo.com",
    title: "Senior Backend Engineer",
    department: "Engineering",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Elena Rossi",
    email: "elena.rossi@democo.com",
    title: "Product Designer",
    department: "Design",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "David Okafor",
    email: "david.okafor@democo.com",
    title: "Account Executive",
    department: "Sales",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Priya Nair",
    email: "priya.nair@democo.com",
    title: "People Lead",
    department: "HR",
    status: "On leave",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "James Holt",
    email: "james.holt@democo.com",
    title: "Sales Director",
    department: "Sales",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    name: "Aisha Khan",
    email: "aisha.khan@democo.com",
    title: "Product Manager",
    department: "Product",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    name: "Tom Becker",
    email: "tom.becker@democo.com",
    title: "Frontend Engineer",
    department: "Engineering",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    name: "Olivia Rhye",
    email: "olivia@democo.com",
    title: "People Operations",
    department: "HR",
    status: "Active",
    isYou: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    name: "Lucy Adams",
    email: "lucy.adams@democo.com",
    title: "HR Generalist",
    department: "HR",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "11",
    name: "Michael Vance",
    email: "michael.vance@democo.com",
    title: "QA Specialist",
    department: "Engineering",
    status: "On leave",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "12",
    name: "Robert Fox",
    email: "robert.fox@democo.com",
    title: "DevOps Engineer",
    department: "Engineering",
    status: "Terminated",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "13",
    name: "Emily Watson",
    email: "emily.watson@democo.com",
    title: "Content Strategist",
    department: "Marketing",
    status: "Terminated",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "14",
    name: "Daniel Craig",
    email: "daniel.craig@democo.com",
    title: "Support Specialist",
    department: "Operations",
    status: "Terminated",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
];

export interface DocumentItem {
  id: string;
  title: string;
  category: "Company Policy" | "Personal & Contracts" | "Benefits & Payroll";
  type: "pdf" | "doc";
  size: string;
  updatedText: string;
  status: "Acknowledged" | "Needs ack";
  author?: string;
}

export const documentsDemoData: DocumentItem[] = [
  {
    id: "d1",
    title: "Employee Handbook 2026.pdf",
    category: "Company Policy",
    type: "pdf",
    size: "3.2 MB",
    updatedText: "Updated 3 days ago",
    status: "Acknowledged",
    author: "HR Operations",
  },
  {
    id: "d2",
    title: "Remote Work Policy.docx",
    category: "Company Policy",
    type: "doc",
    size: "1.8 MB",
    updatedText: "Shared 1 week ago",
    status: "Needs ack",
    author: "People Team",
  },
  {
    id: "d3",
    title: "Q2 Benefits Summary.pdf",
    category: "Benefits & Payroll",
    type: "pdf",
    size: "4.5 MB",
    updatedText: "Shared 2 weeks ago",
    status: "Acknowledged",
    author: "Benefits Team",
  },
  {
    id: "d4",
    title: "Offer Letter — signed.pdf",
    category: "Personal & Contracts",
    type: "pdf",
    size: "850 KB",
    updatedText: "Shared 3 weeks ago",
    status: "Acknowledged",
    author: "Talent Acquisition",
  },
  {
    id: "d5",
    title: "Health Plan Enrollment.docx",
    category: "Benefits & Payroll",
    type: "doc",
    size: "2.1 MB",
    updatedText: "Updated 1 month ago",
    status: "Needs ack",
    author: "HR Operations",
  },
  {
    id: "d6",
    title: "IT Security & Data Protection Policy.pdf",
    category: "Company Policy",
    type: "pdf",
    size: "5.0 MB",
    updatedText: "Updated 1 month ago",
    status: "Needs ack",
    author: "IT Security",
  },
  {
    id: "d7",
    title: "2026 Performance Review Framework.docx",
    category: "Personal & Contracts",
    type: "doc",
    size: "1.2 MB",
    updatedText: "Shared 2 months ago",
    status: "Acknowledged",
    author: "People Team",
  },
  {
    id: "d8",
    title: "Travel & Expense Reimbursement Guide.pdf",
    category: "Company Policy",
    type: "pdf",
    size: "2.7 MB",
    updatedText: "Shared 2 months ago",
    status: "Acknowledged",
    author: "Finance Dept",
  },
  {
    id: "d9",
    title: "Code of Conduct & Ethics 2026.pdf",
    category: "Company Policy",
    type: "pdf",
    size: "3.8 MB",
    updatedText: "Updated 3 months ago",
    status: "Needs ack",
    author: "Legal & Compliance",
  },
  {
    id: "d10",
    title: "NDA & Confidentiality Agreement.docx",
    category: "Personal & Contracts",
    type: "doc",
    size: "920 KB",
    updatedText: "Shared 4 months ago",
    status: "Acknowledged",
    author: "Legal & Compliance",
  },
  {
    id: "d11",
    title: "2026 Payroll Schedule & Calendar.pdf",
    category: "Benefits & Payroll",
    type: "pdf",
    size: "1.5 MB",
    updatedText: "Shared 5 months ago",
    status: "Acknowledged",
    author: "Finance Dept",
  },
  {
    id: "d12",
    title: "Emergency Contact & Safety Guidelines.docx",
    category: "Company Policy",
    type: "doc",
    size: "1.1 MB",
    updatedText: "Updated 6 months ago",
    status: "Acknowledged",
    author: "Facilities Team",
  },
];

export interface RequestItem {
  id: string;
  reqNumber: string;
  title: string;
  category: "General HR" | "Payroll & Tax" | "Benefits & Leave" | "Equipment & IT";
  openedText: string;
  status: "Awaiting HR" | "In progress" | "Resolved";
  assignedTo: string;
  description: string;
  commentsCount: number;
  updatedAt: string;
}

export const requestsDemoData: RequestItem[] = [
  {
    id: "r1",
    reqNumber: "#REQ-1048",
    title: "Enroll in the 2026 dental plan",
    category: "Benefits & Leave",
    openedText: "Opened 1 day ago",
    status: "In progress",
    assignedTo: "Olivia Bennett",
    description: "I would like to add my spouse to the 2026 dental insurance coverage starting next month.",
    commentsCount: 2,
    updatedAt: "Yesterday at 4:30 PM",
  },
  {
    id: "r2",
    reqNumber: "#REQ-1042",
    title: "Update my home address",
    category: "General HR",
    openedText: "Opened 2 days ago",
    status: "Awaiting HR",
    assignedTo: "Olivia Bennett",
    description: "Moved to a new apartment last week. Need to update my physical address for tax records.",
    commentsCount: 1,
    updatedAt: "2 days ago",
  },
  {
    id: "r3",
    reqNumber: "#REQ-1038",
    title: "Request a copy of my employment contract",
    category: "General HR",
    openedText: "Opened 4 days ago",
    status: "In progress",
    assignedTo: "Lucy Adams",
    description: "Please provide an updated signed PDF copy of my original employment agreement.",
    commentsCount: 3,
    updatedAt: "3 days ago",
  },
  {
    id: "r4",
    reqNumber: "#REQ-1031",
    title: "Parental leave — eligibility question",
    category: "Benefits & Leave",
    openedText: "Opened 6 days ago",
    status: "In progress",
    assignedTo: "Priya Nair",
    description: "Inquiring about parental leave policies for Q3 2026 and how to submit advance notice.",
    commentsCount: 4,
    updatedAt: "4 days ago",
  },
  {
    id: "r5",
    reqNumber: "#REQ-1027",
    title: "Correct my tax withholding details",
    category: "Payroll & Tax",
    openedText: "Resolved 2 days ago",
    status: "Resolved",
    assignedTo: "Finance Operations",
    description: "Updated W-4 tax withholding form submitted to correct exemption counts.",
    commentsCount: 2,
    updatedAt: "Resolved on Aug 3",
  },
  {
    id: "r6",
    reqNumber: "#REQ-1021",
    title: "Request new monitor for remote setup",
    category: "Equipment & IT",
    openedText: "Opened 1 week ago",
    status: "Resolved",
    assignedTo: "IT Support",
    description: "Approved request for 27-inch 4K monitor shipment to home office.",
    commentsCount: 5,
    updatedAt: "Resolved on Jul 29",
  },
  {
    id: "r7",
    reqNumber: "#REQ-1015",
    title: "Verify annual leave balance discrepancy",
    category: "Benefits & Leave",
    openedText: "Opened 1 week ago",
    status: "Awaiting HR",
    assignedTo: "Priya Nair",
    description: "My portal shows 12 leave days remaining but I carried over 3 days from 2025.",
    commentsCount: 1,
    updatedAt: "Jul 28",
  },
  {
    id: "r8",
    reqNumber: "#REQ-1009",
    title: "Update direct deposit bank details",
    category: "Payroll & Tax",
    openedText: "Opened 2 weeks ago",
    status: "Resolved",
    assignedTo: "Finance Operations",
    description: "Changed primary checking account for payroll deposits.",
    commentsCount: 3,
    updatedAt: "Resolved on Jul 24",
  },
  {
    id: "r9",
    reqNumber: "#REQ-1004",
    title: "Name change on company email & portal",
    category: "General HR",
    openedText: "Opened 2 weeks ago",
    status: "In progress",
    assignedTo: "IT Support",
    description: "Updated legal name change documentation attached for email alias update.",
    commentsCount: 2,
    updatedAt: "Jul 21",
  },
  {
    id: "r10",
    reqNumber: "#REQ-0998",
    title: "Inquire about tuition reimbursement policy",
    category: "General HR",
    openedText: "Opened 3 weeks ago",
    status: "Awaiting HR",
    assignedTo: "Olivia Bennett",
    description: "Asking for guidelines regarding continuing education and course reimbursement limits.",
    commentsCount: 0,
    updatedAt: "Jul 15",
  },
];
