"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import StudentLiveClasses from "./student-live-classes";
import CommerceMyCourses from "./commerce-my-courses";
import CommerceManager, { api as commerceApi, isCommerceSection } from "./commerce-manager";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileBarChart,
  Flame,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Radio,
  Search,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  Video,
  X,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Play,
  Eye,
  Filter,
  Mail,
  ShieldCheck,
  Archive,
  Calendar,
  ChevronLeft,
  Copy,
  FileText,
  Globe2,
  GripVertical,
  ImageIcon,
  Link2,
  List,
  LogOut,
  Monitor,
  Pencil,
  Save,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCog,
  WalletCards,
} from "lucide-react";
import { logout } from "@/lib/auth-client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Role = "admin" | "student";
type IconType = React.ComponentType<{ className?: string; size?: number }>;

const revenueData = [
  { day: "May 1", current: 18000, previous: 12000 },
  { day: "May 5", current: 24500, previous: 18800 },
  { day: "May 9", current: 22000, previous: 20500 },
  { day: "May 13", current: 36500, previous: 24500 },
  { day: "May 17", current: 31000, previous: 28000 },
  { day: "May 21", current: 47800, previous: 34000 },
  { day: "May 25", current: 42100, previous: 35500 },
  { day: "May 30", current: 58200, previous: 41500 },
];
const activityData = [
  { day: "Mon", hours: 1.6 },
  { day: "Tue", hours: 2.4 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 3.1 },
  { day: "Fri", hours: 2.7 },
  { day: "Sat", hours: 3.8 },
  { day: "Sun", hours: 2.2 },
];
const students = [
  {
    name: "Aman Verma",
    initials: "AV",
    courses: 3,
    streak: 12,
    progress: 75,
    active: "Today",
    spend: "₹14,997",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    courses: 4,
    streak: 28,
    progress: 88,
    active: "2h ago",
    spend: "₹21,496",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Rohan Mehta",
    initials: "RM",
    courses: 2,
    streak: 7,
    progress: 48,
    active: "Yesterday",
    spend: "₹8,998",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Sneha Iyer",
    initials: "SI",
    courses: 3,
    streak: 19,
    progress: 92,
    active: "18m ago",
    spend: "₹17,497",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Kabir Singh",
    initials: "KS",
    courses: 1,
    streak: 3,
    progress: 31,
    active: "3 days ago",
    spend: "₹4,999",
    color: "bg-sky-100 text-sky-700",
  },
];
const courses = [
  {
    title: "Product Design Masterclass",
    instructor: "Nisha Rao",
    progress: 72,
    lessons: "32 / 44",
    tag: "Design",
    image:
      "https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Data Analytics & Storytelling",
    instructor: "Arjun Nair",
    progress: 48,
    lessons: "18 / 38",
    tag: "Analytics",
    image:
      "https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Modern React Engineering",
    instructor: "Vikram Joshi",
    progress: 18,
    lessons: "7 / 42",
    tag: "Development",
    image:
      "https://images.unsplash.com/photo-1758874573111-76d77f6ec690?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const adminNav: [string, IconType][] = [
  ["Overview", LayoutDashboard],
  ["Analytics", BarChart3],
  ["Students", Users],
  ["Courses", BookOpen],
  ["Live Classes", Video],
  ["Enrolments", GraduationCap],
  ["Payments & Revenue", CircleDollarSign],
  ["Notifications", Bell],
  ["Reports", FileBarChart],
  ["Instructors", UserCog],
  ["Categories", List],
  ["Course Bundles", BookOpen],
  ["Coupons & Discounts", CircleDollarSign],
  ["Certificates", Award],
  ["Reviews & Feedback", MessageSquare],
  ["SEO Manager", Globe2],
  ["Blog & Content", FileText],
  ["Website Settings", Monitor],
  ["Roles & Permissions", ShieldCheck],
  ["General Settings", Settings],
];
const studentNav: [string, IconType][] = [
  ["My Dashboard", LayoutDashboard],
  ["My Courses", BookOpen],
  ["Live Classes", Video],
  ["Learning Analytics", BarChart3],
  ["My Streaks", Flame],
  ["Achievements", Trophy],
  ["Certificates", Award],
  ["My Profile", UserRound],
  ["Settings", Settings],
];

const kpis = [
  {
    label: "Total students",
    value: "12,840",
    change: "+12.5%",
    icon: Users,
    color: "indigo",
    data: [22, 31, 28, 42, 48, 52, 67],
  },
  {
    label: "Active students",
    value: "8,492",
    change: "+8.2%",
    icon: Activity,
    color: "emerald",
    data: [35, 42, 40, 48, 55, 51, 62],
  },
  {
    label: "Total revenue",
    value: "₹24.8L",
    change: "+18.4%",
    icon: CircleDollarSign,
    color: "violet",
    data: [18, 24, 21, 35, 31, 45, 58],
  },
  {
    label: "Completion rate",
    value: "72.4%",
    change: "+4.1%",
    icon: Target,
    color: "amber",
    data: [45, 44, 52, 55, 58, 64, 72],
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/dashboard/learnisphere-logo.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-9 rounded-xl border border-white/10 bg-[#071522] p-1 object-contain shadow-[0_0_24px_rgba(43,255,255,.12)]"
      />
      <span className="font-['Space_Grotesk:Bold'] text-[19px] font-bold tracking-[-.04em] text-white">
        Learn<span className="text-[#2bffff]">Isphere</span>
      </span>
    </div>
  );
}

function Sidebar({
  role,
  active,
  onChange,
  open,
  close,
}: {
  role: Role;
  active: string;
  onChange: (x: string) => void;
  open: boolean;
  close: () => void;
}) {
  const nav = role === "admin" ? adminNav : studentNav;
  const [showHelp, setShowHelp] = useState(true);
  const selectPage = (label: string) => {
    onChange(label);
    close();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-3 left-3 z-50 flex w-[244px] flex-col rounded-[24px] border border-white/10 bg-[rgba(4,15,16,.76)] px-4 py-5 shadow-2xl shadow-black/30 backdrop-blur-[32px] transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-[110%]"}`}
      >
        <div className="mb-7 flex items-center justify-between px-2">
          <Logo />
          <button onClick={close} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
          {role === "admin" ? "Institute workspace" : "Learning space"}
        </div>
        <nav className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => selectPage(label)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${active === label ? "bg-[rgba(43,255,255,.11)] text-[#2bffff] shadow-[inset_0_0_0_1px_rgba(43,255,255,.1)]" : "text-white/50 hover:bg-white/[.04] hover:text-white"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active === label && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2bffff] shadow-[0_0_10px_#2bffff]" />
              )}
            </button>
          ))}
        </nav>
        {showHelp && (
          <div className="mt-4 shrink-0 rounded-2xl border border-[#2bffff]/15 bg-[#2bffff]/[.05] p-4 text-white">
            <div className="mb-3 flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-white/10">
                <HelpCircle size={17} />
              </div>
              <button
                type="button"
                aria-label="Dismiss help panel"
                onClick={() => setShowHelp(false)}
                className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm font-bold">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Explore guides or chat with our support team.
            </p>
            <button className="mt-3 text-xs font-bold text-indigo-300">
              Visit help center →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function Header({
  role,
  title,
  menu,
}: {
  role: Role;
  title: string;
  menu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[rgba(2,7,7,.7)] px-4 backdrop-blur-2xl sm:px-7">
      <div className="flex items-center gap-3">
        <button onClick={menu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
          <Menu size={20} />
        </button>
        <div>
          <p className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:block">
            {role === "admin" ? "Admin console" : "Student portal"}
          </p>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative grid size-10 place-items-center rounded-xl border bg-white text-slate-500 hover:bg-slate-50">
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>
        <button className="flex items-center gap-2 rounded-xl border bg-white p-1.5 pr-2">
          <span className="grid size-7 place-items-center rounded-lg bg-indigo-100 text-[10px] font-bold text-indigo-700">
            {role === "admin" ? "NR" : "AV"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => void logout().catch((error: unknown) => window.alert(
            error instanceof Error ? error.message : "Sign out failed. Please try again.",
          ))}
          className="grid size-10 place-items-center rounded-xl border bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card rounded-[22px] border ${className}`}>{children}</div>;
}

function AdminOverview({ openStudent }: { openStudent: (name: string) => void }) {
  const [range, setRange] = useState("30 Days");
  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-slate-500">Here’s what’s happening at your institute.</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Performance overview</h2>
        </div>
        <div className="flex gap-2 overflow-auto scrollbar-none">
          {["Today", "7 Days", "30 Days", "90 Days"].map((x) => (
            <button
              key={x}
              onClick={() => setRange(x)}
              className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-bold transition ${range === x ? "border-slate-900 bg-slate-900 text-white" : "bg-white text-slate-500 hover:border-slate-300"}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, change, icon: Icon, color, data }) => (
          <Card
            key={label}
            className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/40"
          >
            <div className="flex justify-between">
              <div className={`grid size-10 place-items-center rounded-xl ${colorMap[color]}`}>
                <Icon size={19} />
              </div>
              <button
                title={`About ${label}`}
                className="self-start text-slate-300 hover:text-slate-600"
              >
                <HelpCircle size={15} />
              </button>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <TrendingUp size={12} />
                  {change} <span className="font-medium text-slate-400">vs last period</span>
                </p>
              </div>
              <div className="h-12 w-20">
                <ResponsiveContainer>
                  <LineChart data={data.map((v, i) => ({ i, v }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#2bffff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-base font-extrabold text-slate-900">Revenue analytics</p>
              <p className="mt-1 text-xs text-slate-400">
                Income performance over the last {range.toLowerCase()}
              </p>
            </div>
            <button className="rounded-lg border px-2.5 py-2 text-xs font-bold text-slate-500">
              <Download size={15} />
            </button>
          </div>
          <div className="mb-4 flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gross revenue
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">₹8,42,580</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
              +18.4%
            </span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer>
              <AreaChart data={revenueData} margin={{ left: -12, right: 4 }}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2bffff" stopOpacity=".22" />
                    <stop offset="100%" stopColor="#2bffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,.45)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,.45)" }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => `₹${Number(v).toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#2bffff"
                  strokeWidth={2.5}
                  fill="url(#revenue)"
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#ff1cf7"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-base font-extrabold text-slate-900">Engagement pulse</p>
              <p className="mt-1 text-xs text-slate-400">How learners showed up today</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Zap size={18} />
            </span>
          </div>
          <div className="my-5 flex items-center justify-center">
            <div className="relative h-40 w-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[{ v: 78 }, { v: 22 }]}
                    dataKey="v"
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill="#2bffff" />
                    <Cell fill="rgba(43,255,255,.08)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-3xl font-extrabold text-slate-950">78%</p>
                  <p className="text-[10px] font-bold text-slate-400">ENGAGED</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-t pt-5 text-center">
            <div>
              <p className="text-lg font-extrabold">8.4k</p>
              <p className="text-[10px] text-slate-400">Active</p>
            </div>
            <div>
              <p className="text-lg font-extrabold">42m</p>
              <p className="text-[10px] text-slate-400">Avg. time</p>
            </div>
            <div>
              <p className="text-lg font-extrabold">3.2k</p>
              <p className="text-[10px] text-slate-400">Lessons</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <StudentTable openStudent={openStudent} />
        <LiveTimeline admin />
      </div>
    </div>
  );
}

function StudentTable({ openStudent }: { openStudent: (name: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:px-6">
        <div>
          <h3 className="text-base font-extrabold">Student performance</h3>
          <p className="mt-1 text-xs text-slate-400">Learning momentum across top learners</p>
        </div>
        <button className="text-xs font-bold text-indigo-600">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-y bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3">Student</th>
              <th>Courses</th>
              <th>Streak</th>
              <th>Progress</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 4).map((s) => (
              <tr
                key={s.name}
                onClick={() => openStudent(s.name)}
                className="cursor-pointer border-b last:border-0 hover:bg-slate-50"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-8 place-items-center rounded-lg text-[10px] font-bold ${s.color}`}
                    >
                      {s.initials}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="text-xs text-slate-500">{s.courses}</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Flame size={13} />
                    {s.streak} days
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold">{s.progress}%</span>
                  </div>
                </td>
                <td className="text-xs text-slate-500">{s.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LiveTimeline({ admin = false }: { admin?: boolean }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold">Upcoming live classes</h3>
          <p className="mt-1 text-xs text-slate-400">
            {admin ? "Today’s teaching schedule" : "Your next live sessions"}
          </p>
        </div>
        <button className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          <CalendarDays size={16} />
        </button>
      </div>
      <div className="space-y-5">
        {[
          ["10:30 AM", "Advanced React Patterns", "Modern React Engineering", "Live in 24m"],
          ["1:00 PM", "Usability Testing Lab", "Product Design Masterclass", "Today"],
          ["4:30 PM", "Dashboard Storytelling", "Data Analytics", "Today"],
        ].map((x, i) => (
          <div key={x[1]} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 size-2.5 rounded-full ${i === 0 ? "bg-red-500 ring-4 ring-red-50" : "bg-indigo-300"}`}
              />
              {i < 2 && <span className="mt-2 h-12 w-px bg-slate-200" />}
            </div>
            <div className="-mt-1 flex-1">
              <div className="flex justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-800">{x[1]}</p>
                <span className="whitespace-nowrap text-[10px] font-bold text-slate-400">
                  {x[0]}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{x[2]}</p>
              {i === 0 && (
                <button className="mt-2 rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                  {x[3]}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StudentsPage({ openStudent }: { openStudent: (name: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="page-enter space-y-5">
      <PageLead
        title="Students"
        desc="Manage learners, monitor activity, and identify engagement risks."
        action="Add student"
        icon={Plus}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active today", "8,492", "+8.2%", Activity],
          ["At-risk streaks", "184", "-12.4%", Flame],
          ["Lessons today", "3,248", "+18.1%", CheckCircle2],
          ["Missed live class", "92", "+3.8%", Video],
        ].map(([l, v, c, I]) => (
          <Card key={l as string} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">{l as string}</p>
                <p className="mt-2 text-2xl font-extrabold">{v as string}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <I size={18} />
              </span>
            </div>
            <p className="mt-3 text-[10px] font-bold text-emerald-600">
              {c as string} <span className="font-normal text-slate-400">this week</span>
            </p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students…"
              className="w-full rounded-xl border bg-slate-50 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-indigo-400 sm:w-72"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold text-slate-500">
              <Filter size={14} />
              Filters
            </button>
            <button className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold text-slate-500">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th>Courses</th>
                <th>Spent</th>
                <th>Streak</th>
                <th>Progress</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.name} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openStudent(s.name)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className={`grid size-9 place-items-center rounded-xl text-[10px] font-bold ${s.color}`}
                      >
                        {s.initials}
                      </span>
                      <span>
                        <b className="block text-xs">{s.name}</b>
                        <span className="text-[10px] text-slate-400">
                          {s.name.toLowerCase().replace(" ", ".")}@email.com
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="text-xs">{s.courses}</td>
                  <td className="text-xs font-bold">{s.spend}</td>
                  <td className="text-xs text-amber-600">{s.streak} days</td>
                  <td className="text-xs">{s.progress}%</td>
                  <td>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                      Active
                    </span>
                  </td>
                  <td>
                    <MoreHorizontal size={16} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  type = "text",
  fieldKey,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
  fieldKey?: string;
}) {
  const wizardForm = useContext(CourseWizardFormContext);
  const key = fieldKey || label;
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold text-white/65">
        {label} <span className="text-[#2bffff]">*</span>
      </span>
      <input
        type={type}
        value={wizardForm ? String(wizardForm.values[key] ?? "") : undefined}
        defaultValue={wizardForm ? undefined : value}
        onChange={wizardForm ? (event) => wizardForm.update(key, event.target.value) : undefined}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none transition focus:border-[#2bffff]/50"
      />
    </label>
  );
}

type CourseWizardForm = {
  values: Record<string, string | boolean>;
  update: (key: string, value: string | boolean) => void;
};

const CourseWizardFormContext = createContext<CourseWizardForm | null>(null);

function WizardTextarea({
  label,
  fieldKey,
  rows = 3,
  className,
  value,
}: {
  label: string;
  fieldKey?: string;
  rows?: number;
  className?: string;
  value?: string;
}) {
  const wizardForm = useContext(CourseWizardFormContext);
  const key = fieldKey || label;
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold text-white/65">{label}</span>
      <textarea
        rows={rows}
        value={wizardForm ? String(wizardForm.values[key] ?? "") : undefined}
        defaultValue={wizardForm ? undefined : value}
        onChange={wizardForm ? (event) => wizardForm.update(key, event.target.value) : undefined}
        className={className || "w-full rounded-xl border border-white/10 bg-white/[.04] p-3.5 text-xs outline-none focus:border-[#2bffff]/50"}
      />
    </label>
  );
}

function WizardCheckbox({
  label,
  fieldKey,
  defaultChecked = false,
}: {
  label: string;
  fieldKey?: string;
  defaultChecked?: boolean;
}) {
  const wizardForm = useContext(CourseWizardFormContext);
  const key = fieldKey || label;
  return (
    <input
      type="checkbox"
      checked={wizardForm ? (wizardForm.values[key] === undefined ? defaultChecked : Boolean(wizardForm.values[key])) : defaultChecked}
      onChange={wizardForm ? (event) => wizardForm.update(key, event.target.checked) : undefined}
      className="accent-cyan-300"
    />
  );
}

function ModalShell({
  title,
  desc,
  close,
  children,
  wide = false,
}: {
  title: string;
  desc: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
      <div
        className={`max-h-[94vh] w-full overflow-hidden rounded-[26px] border border-[#2bffff]/15 bg-[#061011] shadow-2xl ${wide ? "max-w-6xl" : "max-w-3xl"}`}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-xs text-white/45">{desc}</p>
          </div>
          <button onClick={close} className="grid size-9 place-items-center rounded-xl border">
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "Published" || status === "Active" || status === "Completed"
      ? "bg-emerald-400/10 text-emerald-400"
      : status === "Draft" || status === "Pending"
        ? "bg-amber-400/10 text-amber-300"
        : status === "Live"
          ? "bg-red-400/10 text-red-400"
          : "bg-white/[.06] text-white/55";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style}`}>{status}</span>
  );
}

function CourseWizard({
  course: initialCourse,
  close,
  onSaved,
}: {
  course: AdminCourse | null;
  close: () => void;
  onSaved: (course: AdminCourse) => void;
}) {
  const [course, setCourse] = useState(initialCourse);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleObjectives, setModuleObjectives] = useState("");
  const [moduleThumbnailUrl, setModuleThumbnailUrl] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<Record<number, boolean>>({});
  const [draggedModuleId, setDraggedModuleId] = useState<number | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ moduleId: number; lessonId: number } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const thumbnailInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const instructorImageInput = useRef<HTMLInputElement>(null);
  const lessonResourceInput = useRef<HTMLInputElement>(null);
  const [uploadingLessonModuleId, setUploadingLessonModuleId] = useState<number | null>(null);
  const initialFields = initialCourse?.editor_data?.fields || {};
  const savedField = (key: string, fallback = "") =>
    typeof initialFields[key] === "string" ? String(initialFields[key]) : fallback;
  const [repeatableCounts, setRepeatableCounts] = useState<Record<string, number>>(() => {
    const counts = Object.keys(initialFields).reduce<Record<string, number>>((result, key) => {
      const match = key.match(/^(.*) #(\d+)$/);
      if (match) result[match[1]] = Math.max(result[match[1]] || 0, Number(match[2]) - 1);
      return result;
    }, {});
    counts["What students will learn"] = Math.max(counts["What students will learn"] || 0, (initialCourse?.learning_outcomes.length || 1) - 1);
    counts["Skills gained"] = Math.max(counts["Skills gained"] || 0, (initialCourse?.skills.length || 1) - 1);
    return counts;
  });
  const [values, setValues] = useState<Record<string, string | boolean>>(() => ({
    ...((initialCourse?.learning_outcomes || []).reduce<Record<string, string>>((result, item, index) => {
      result[index === 0 ? "What students will learn" : `What students will learn #${index + 1}`] = item;
      return result;
    }, {})),
    ...((initialCourse?.skills || []).reduce<Record<string, string>>((result, item, index) => {
      result[index === 0 ? "Skills gained" : `Skills gained #${index + 1}`] = item;
      return result;
    }, {})),
    ...initialFields,
    "Course title": initialCourse?.title || "",
    "URL slug": initialCourse?.slug || "",
    "Course language": initialCourse?.editor_data?.course_language || "",
    "Course type": initialCourse?.editor_data?.course_type || "",
    Subcategory: initialCourse?.editor_data?.subcategory || "",
    "Promotional video URL": initialCourse?.editor_data?.promotional_video_url || "",
    "Estimated hours": initialCourse?.editor_data?.estimated_hours || "",
    "Course duration": initialCourse?.duration || "",
    "Short description": initialCourse?.description || "",
    "Full description": initialCourse?.overview || "",
    "Course category": initialCourse?.category || "",
    "Skill level": initialCourse?.difficulty || "",
    Instructor: initialCourse?.instructor_name || "",
    "Course thumbnail URL": initialCourse?.cover_image_url || "",
    "Course price": initialCourse?.list_price || initialCourse?.selling_price || "",
    "Discount price": initialCourse?.promotional_price || initialCourse?.selling_price || "",
    "Promotion starts": initialCourse?.promotion_starts_at
      ? new Date(new Date(initialCourse.promotion_starts_at).getTime() - new Date(initialCourse.promotion_starts_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "",
    "Promotion ends": initialCourse?.promotion_ends_at
      ? new Date(new Date(initialCourse.promotion_ends_at).getTime() - new Date(initialCourse.promotion_ends_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "",
    Currency: initialCourse?.currency || "INR",
    "Free or Paid": initialCourse ? (initialCourse.purchase_eligible ? "Paid" : "Free") : "Paid",
    "Course requirements": savedField("Course requirements"),
    "Prerequisites": savedField("Prerequisites", initialCourse?.prerequisites || ""),
    "Select instructor": savedField("Select instructor", initialCourse?.instructor_name || ""),
    "Instructor image URL": initialCourse?.instructor_image_url || "",
    Biography: savedField("Biography", initialCourse?.instructor_bio || ""),
    "Professional designation": initialCourse?.editor_data?.instructor_designation || "",
    "What students will learn": savedField("What students will learn", initialCourse?.learning_outcomes?.[0] || ""),
    "Skills gained": savedField("Skills gained", initialCourse?.skills?.[0] || ""),
    "Target audience": initialCourse?.editor_data?.target_audience || "",
    "Recommended knowledge": initialCourse?.editor_data?.recommended_knowledge || "",
    "Publication action": initialCourse?.editor_data?.publication_action || (initialCourse?.published ? "Publish Now" : "Save as Draft"),
    "Featured course": initialCourse?.featured || false,
    "Course availability": initialCourse?.available ? "Available immediately" : "Unavailable",
    Visibility: savedField("Visibility", "Public"),
  }));
  const updateValue = (key: string, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "Course title") {
        const previousSlug = String(current["URL slug"] || "");
        const previousTitleSlug = String(current["Course title"] || "")
          .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (!previousSlug || previousSlug === previousTitleSlug) {
          next["URL slug"] = String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        }
      }
      return next;
    });
    setSaved(false);
  };
  const textValue = (key: string) => String(values[key] ?? "").trim();
  const repeatedValues = (key: string) => Object.entries(values)
    .filter(([field]) => field === key || field.startsWith(`${key} #`))
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .flatMap(([, value]) => String(value).split(/\r?\n/).map((item) => item.trim()).filter(Boolean));
  const uploadCourseAsset = async (file: File, kind: "image" | "video" | "document", fieldKey: string) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await commerceApi<{ url: string }>("admin/uploads/", {
        method: "POST",
        body: formData,
      });
      updateValue(fieldKey, result.url);
      setNotice(`${kind === "image" ? "Thumbnail" : kind === "video" ? "Video" : "PDF"} uploaded. Save the course to apply it.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The file could not be uploaded.");
    } finally {
      setSaving(false);
    }
  };
  const saveCourse = async (publish?: boolean) => {
    const title = textValue("Course title");
    const category = textValue("Course category");
    if (!title || !category) {
      setError("Enter a course title and category before saving.");
      return;
    }
    const requestedSlug = textValue("URL slug");
    const slug = requestedSlug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const currency = (textValue("Currency").match(/[A-Za-z]{3}/)?.[0] || "INR").toUpperCase();
    const coursePrice = textValue("Course price").replace(/[^\d.]/g, "");
    const discountPrice = textValue("Discount price").replace(/[^\d.]/g, "");
    const paid = values["Free or Paid"] !== "Free";
    if (paid && coursePrice && discountPrice && Number(discountPrice) > Number(coursePrice)) {
      setError("Discount price cannot exceed the course price.");
      return;
    }
    const sellingPrice = paid ? coursePrice || discountPrice : "";
    const listPrice = paid && coursePrice && discountPrice && Number(discountPrice) < Number(coursePrice)
      ? coursePrice
      : "";
    const promotionalPrice = paid && coursePrice && discountPrice && Number(discountPrice) < Number(coursePrice)
      ? discountPrice
      : "";
    const publicationAction = publish === true
      ? "Publish Now"
      : publish === false
        ? "Save as Draft"
        : textValue("Publication action") || (course?.published ? "Publish Now" : "Save as Draft");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        title,
        slug,
        category,
        qualification: course?.qualification || "Certification",
        description: textValue("Short description"),
        overview: textValue("Full description"),
        cover_image_url: textValue("Course thumbnail URL"),
        duration: textValue("Course duration") || textValue("Estimated hours"),
        difficulty: textValue("Skill level"),
        instructor_name: textValue("Select instructor") || textValue("Instructor"),
        instructor_bio: textValue("Biography"),
        instructor_image_url: textValue("Instructor image URL"),
        learning_outcomes: repeatedValues("What students will learn"),
        skills: repeatedValues("Skills gained"),
        prerequisites: [...repeatedValues("Course requirements"), ...repeatedValues("Prerequisites")].join("\n"),
        certificate_information: textValue("Certificate template"),
        selling_price: sellingPrice || null,
        list_price: listPrice || null,
        promotional_price: promotionalPrice || null,
        promotion_starts_at: textValue("Promotion starts") ? new Date(textValue("Promotion starts")).toISOString() : null,
        promotion_ends_at: textValue("Promotion ends") ? new Date(textValue("Promotion ends")).toISOString() : null,
        currency,
        published: publicationAction === "Publish Now" && textValue("Visibility") !== "Private",
        available: values["Course availability"] !== "Unavailable",
        purchase_eligible: paid,
        featured: Boolean(values["Featured course"]),
        editor_data: {
          ...(course?.editor_data || {}),
          fields: values,
          course_language: textValue("Course language"),
          course_type: textValue("Course type"),
          subcategory: textValue("Subcategory"),
          promotional_video_url: textValue("Promotional video URL"),
          estimated_hours: textValue("Estimated hours"),
          target_audience: repeatedValues("Target audience").join("\n"),
          recommended_knowledge: repeatedValues("Recommended knowledge").join("\n"),
          instructor_designation: textValue("Professional designation"),
          publication_action: publicationAction,
        },
      };
      const result = await commerceApi<{ course: AdminCourse }>(
        course ? `admin/courses/${course.id}/` : "admin/courses/create/",
        { method: "POST", body: JSON.stringify(payload) },
      );
      setCourse(result.course);
      onSaved(result.course);
      setValues((current) => ({ ...current, "URL slug": result.course.slug, "Publication action": publicationAction }));
      setSaved(true);
      setNotice(publicationAction === "Schedule Publication"
        ? "Schedule settings saved. Automatic publishing is not configured on this server yet."
        : publicationAction === "Publish Now" && textValue("Visibility") === "Private"
          ? "Private course settings saved as a draft; it is not publicly visible."
        : course
          ? "Course changes saved."
          : "Course created. Continue to build its curriculum.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Course changes could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  const addModule = async () => {
    if (!course) {
      setError("Save the course as a draft before adding curriculum.");
      return;
    }
    if (!moduleTitle.trim()) return;
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ module: AdminCourseModule }>(
        editingModuleId ? `admin/modules/${editingModuleId}/` : `admin/courses/${course.id}/modules/`,
        {
        method: "POST",
        body: JSON.stringify({
          title: moduleTitle.trim(),
          description: moduleDescription,
          learning_objectives: moduleObjectives.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          thumbnail_url: moduleThumbnailUrl,
        }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: editingModuleId
          ? current.modules.map((item) => item.id === result.module.id ? result.module : item)
          : [...current.modules, result.module],
      } : current);
      setModuleTitle("");
      setModuleDescription("");
      setModuleObjectives("");
      setModuleThumbnailUrl("");
      setNotice(editingModuleId ? "Module updated." : "Module added.");
      setEditingModuleId(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Module could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  const deleteModule = async (module: AdminCourseModule) => {
    if (!window.confirm(`Delete "${module.title}" and all of its lessons?`)) return;
    setSaving(true);
    setError("");
    try {
      await commerceApi<{ deleted: boolean }>(`admin/modules/${module.id}/`, {
        method: "POST",
        body: JSON.stringify({ delete: true }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.filter((item) => item.id !== module.id),
      } : current);
      setNotice("Module and its lessons deleted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Module could not be deleted.");
    } finally {
      setSaving(false);
    }
  };
  const reorderModules = async (sourceId: number, targetId: number) => {
    if (!course || sourceId === targetId) return;
    const previousModules = course.modules;
    const ordered = [...previousModules];
    const sourceIndex = ordered.findIndex((module) => module.id === sourceId);
    const targetIndex = ordered.findIndex((module) => module.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, moved);
    setCourse((current) => current ? { ...current, modules: ordered } : current);
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ modules: AdminCourseModule[] }>(`admin/courses/${course.id}/modules/reorder/`, {
        method: "POST",
        body: JSON.stringify({ module_ids: ordered.map((module) => module.id) }),
      });
      setCourse((current) => current ? { ...current, modules: result.modules } : current);
    } catch (reason) {
      setCourse((current) => current ? { ...current, modules: previousModules } : current);
      setError(reason instanceof Error ? reason.message : "Module order could not be saved.");
    } finally {
      setDraggedModuleId(null);
      setSaving(false);
    }
  };
  const reorderLessons = async (module: AdminCourseModule, sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    const previousLessons = module.lessons;
    const ordered = [...previousLessons];
    const sourceIndex = ordered.findIndex((lesson) => lesson.id === sourceId);
    const targetIndex = ordered.findIndex((lesson) => lesson.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, moved);
    setCourse((current) => current ? {
      ...current,
      modules: current.modules.map((item) => item.id === module.id ? { ...item, lessons: ordered } : item),
    } : current);
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ lessons: AdminCourseLesson[] }>(`admin/modules/${module.id}/lessons/reorder/`, {
        method: "POST",
        body: JSON.stringify({ lesson_ids: ordered.map((lesson) => lesson.id) }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id ? { ...item, lessons: result.lessons } : item),
      } : current);
    } catch (reason) {
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id ? { ...item, lessons: previousLessons } : item),
      } : current);
      setError(reason instanceof Error ? reason.message : "Lesson order could not be saved.");
    } finally {
      setDraggedLesson(null);
      setSaving(false);
    }
  };
  const addLesson = async (module: AdminCourseModule) => {
    if (!course) return;
    const key = String(module.id);
    const title = textValue(`Lesson title ${key}`);
    if (!title) {
      setError("Enter a lesson title before adding it.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ lesson: AdminCourseLesson }>(`admin/modules/${module.id}/lessons/`, {
        method: "POST",
        body: JSON.stringify({
          title,
          type: textValue(`Lesson type ${key}`) || "video",
          duration: textValue(`Lesson duration ${key}`),
          description: textValue(`Lesson description ${key}`),
          protected_resource_url: textValue(`Lesson resource URL ${key}`),
          is_preview: Boolean(values[`Preview lesson ${key}`]),
          is_required: Boolean(values[`Required lesson ${key}`] ?? true),
          download_allowed: Boolean(values[`Download permission ${key}`]),
          completion_rule: textValue(`Completion rule ${key}`) || "mark_complete",
          published: false,
        }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id
          ? { ...item, lessons: [...item.lessons, result.lesson] }
          : item),
      } : current);
      ["Lesson title", "Lesson type", "Lesson duration", "Lesson description", "Lesson resource URL"].forEach((field) => {
        updateValue(`${field} ${key}`, "");
      });
      updateValue(`Preview lesson ${key}`, false);
      updateValue(`Required lesson ${key}`, true);
      updateValue(`Download permission ${key}`, false);
      updateValue(`Completion rule ${key}`, "mark_complete");
      setNotice("Lesson added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson could not be added.");
    } finally {
      setSaving(false);
    }
  };
  const toggleLessonPublication = async (module: AdminCourseModule, lesson: AdminCourseLesson) => {
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ lesson: AdminCourseLesson }>(`admin/lessons/${lesson.id}/`, {
        method: "POST",
        body: JSON.stringify({ published: !lesson.published }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id
          ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? result.lesson : row) }
          : item),
      } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson publication could not be updated.");
    } finally {
      setSaving(false);
    }
  };
  const steps = [
    "Basic information",
    "Curriculum",
    "Learning outcomes",
    "Instructor",
    "Pricing & access",
    "Assessments",
    "SEO",
    "Publication",
  ];
  return (
    <ModalShell
      title={course ? `Manage ${course.title}` : "Create a new course"}
      desc="Build a complete, publish-ready learning experience."
      close={close}
      wide
    >
      <CourseWizardFormContext.Provider value={{ values, update: updateValue }}>
      <div className="grid h-[78vh] md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-white/10 p-4 md:block">
          <p className="mb-4 px-2 text-[9px] font-bold uppercase tracking-[.18em] text-white/30">
            Course setup
          </p>
          <div className="space-y-1">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold ${step === i ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/45 hover:bg-white/[.03]"}`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full border text-[9px] ${i < step ? "border-[#2bffff] bg-[#2bffff] text-black" : "border-white/15"}`}
                >
                  {i < step ? <CheckCircle2 size={13} /> : i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>
        </aside>
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-white/10 px-5 py-3 md:hidden">
            <p className="text-xs font-bold text-[#2bffff]">
              Step {step + 1} of 8 · {steps[step]}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
            <div className="mx-auto max-w-3xl">
              {error && <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200" role="alert">{error}</p>}
              {notice && <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-200" role="status">{notice}</p>}
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">
                  Step {step + 1} of {steps.length}
                </p>
                <h3 className="mt-2 text-2xl font-bold">{steps[step]}</h3>
              </div>
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Course title" value="" />
                      <p className="mt-1 text-right text-[9px] text-white/30">{String(values["Course title"] || "").length} / 80 characters</p>
                    </div>
                    <Field label="URL slug" value="" />
                    <Field label="Course language" value="" />
                  </div>
                  <WizardTextarea label="Short description" rows={3} />
                  <p className="-mt-4 text-right text-[9px] text-white/30">{String(values["Short description"] || "").length} characters</p>
                  <WizardTextarea label="Full description" rows={4} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Course category", "Subcategory", "Instructor", "Estimated hours", "Course duration"].map((x) => (
                      <Field key={x} label={x} placeholder={`Select ${x.toLowerCase()}`} />
                    ))}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold text-white/65">Skill level</span>
                      <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue("Skill level")} onChange={(event) => updateValue("Skill level", event.target.value)}>
                        <option value="">Select skill level</option>
                        {["Beginner", "Intermediate", "Advanced", "All levels"].map((level) => <option key={level}>{level}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold text-white/65">Course type</span>
                      <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue("Course type")} onChange={(event) => updateValue("Course type", event.target.value)}>
                        <option value="">Select course type</option>
                        {["Self-paced", "Instructor-led", "Live", "Hybrid"].map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input ref={thumbnailInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCourseAsset(file, "image", "Course thumbnail URL");
                      event.currentTarget.value = "";
                    }} />
                    <input ref={videoInput} type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCourseAsset(file, "video", "Promotional video URL");
                      event.currentTarget.value = "";
                    }} />
                    <button
                      type="button"
                      onClick={() => thumbnailInput.current?.click()}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files[0];
                        if (file) void uploadCourseAsset(file, "image", "Course thumbnail URL");
                      }}
                      disabled={saving}
                      className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[.025] text-center hover:border-[#2bffff]/40 disabled:opacity-50"
                    >
                      <span>
                        <Upload size={20} className="mx-auto text-[#2bffff]" />
                        <b className="mt-2 block text-xs">Course thumbnail</b>
                        <span className="mt-1 block text-[9px] text-white/35">
                          {textValue("Course thumbnail URL") ? "Uploaded · click to replace" : "Upload or drag and drop"}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInput.current?.click()}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files[0];
                        if (file) void uploadCourseAsset(file, "video", "Promotional video URL");
                      }}
                      disabled={saving}
                      className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[.025] text-center hover:border-[#2bffff]/40 disabled:opacity-50"
                    >
                      <span>
                        <Upload size={20} className="mx-auto text-[#2bffff]" />
                        <b className="mt-2 block text-xs">Promotional video</b>
                        <span className="mt-1 block text-[9px] text-white/35">
                          {textValue("Promotional video URL") ? "Uploaded · click to replace" : "Upload or drag and drop"}
                        </span>
                      </span>
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Course thumbnail URL" placeholder="https://…" />
                    <Field label="Promotional video URL" placeholder="https://…" />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  {!course && <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">Save the course as a draft before adding modules and lessons.</p>}
                  <input ref={lessonResourceInput} type="file" accept="video/mp4,video/webm,application/pdf" className="sr-only" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && uploadingLessonModuleId !== null) {
                      void uploadCourseAsset(
                        file,
                        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? "document" : "video",
                        `Lesson resource URL ${uploadingLessonModuleId}`,
                      );
                    }
                    event.currentTarget.value = "";
                  }} />
                  {(course?.modules || []).map((module, mi) => (
                      <Card key={module.id} className="overflow-hidden">
                        <div
                          className="flex items-center gap-3 border-b p-4"
                          draggable
                          onDragStart={() => setDraggedModuleId(module.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedModuleId !== null) void reorderModules(draggedModuleId, module.id);
                          }}
                          onDragEnd={() => setDraggedModuleId(null)}
                        >
                          <GripVertical size={16} className="text-white/25" />
                          <button type="button" aria-label={`${collapsedModules[module.id] ? "Expand" : "Collapse"} ${module.title}`} onClick={() => setCollapsedModules((current) => ({ ...current, [module.id]: !current[module.id] }))} className="text-white/50">
                            <ChevronDown size={16} className={collapsedModules[module.id] ? "-rotate-90" : ""} />
                          </button>
                          <div className="flex-1">
                            <p className="text-xs font-bold">Module {mi + 1}</p>
                            <p className="text-[10px] text-white/35">{module.title}</p>
                          </div>
                          <button type="button" aria-label={`Edit ${module.title}`} onClick={() => {
                            setEditingModuleId(module.id);
                            setModuleTitle(module.title);
                            setModuleDescription(module.description);
                            setModuleObjectives(module.learning_objectives.join("\n"));
                            setModuleThumbnailUrl(module.thumbnail_url);
                          }}>
                            <Pencil size={14} />
                          </button>
                          <button type="button" aria-label={`Delete ${module.title}`} disabled={saving} onClick={() => void deleteModule(module)} className="text-red-400 disabled:opacity-40">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {!collapsedModules[module.id] && <div className="space-y-2 p-3">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3"
                              draggable
                              onDragStart={() => setDraggedLesson({ moduleId: module.id, lessonId: lesson.id })}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                if (draggedLesson?.moduleId === module.id) void reorderLessons(module, draggedLesson.lessonId, lesson.id);
                              }}
                              onDragEnd={() => setDraggedLesson(null)}
                            >
                              <GripVertical size={14} className="text-white/20" />
                              <span className="grid size-7 place-items-center rounded-lg bg-[#2bffff]/10 text-[#2bffff]">
                                {lesson.type === "video" ? <Video size={13} /> : lesson.type === "reading" ? <FileText size={13} /> : <Target size={13} />}
                              </span>
                              <p className="flex-1 text-[11px] font-semibold">{lesson.type} · {lesson.title}</p>
                              <span className="text-[9px] text-white/30">{lesson.duration || (lesson.is_preview ? "Preview" : "Required")}</span>
                              <button type="button" disabled={saving} onClick={() => void toggleLessonPublication(module, lesson)} className="text-[9px] text-[#2bffff] disabled:opacity-40">
                                {lesson.published ? "Published" : "Draft"}
                              </button>
                            </div>
                          ))}
                          <div className="grid gap-3 border-t border-white/[.07] pt-3 sm:grid-cols-2">
                            <Field label="Lesson title" fieldKey={`Lesson title ${module.id}`} placeholder="Lesson title" />
                            <label className="block">
                              <span className="mb-2 block text-[11px] font-bold text-white/65">Lesson type</span>
                              <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue(`Lesson type ${module.id}`) || "video"} onChange={(event) => updateValue(`Lesson type ${module.id}`, event.target.value)}>
                                {["video", "reading", "resource", "quiz", "assignment"].map((type) => <option key={type}>{type}</option>)}
                              </select>
                            </label>
                            <Field label="Lesson duration" fieldKey={`Lesson duration ${module.id}`} placeholder="e.g. 12 minutes" />
                            <Field label="Lesson resource URL" fieldKey={`Lesson resource URL ${module.id}`} placeholder="https://…" />
                            <button type="button" disabled={saving} onClick={() => {
                              setUploadingLessonModuleId(module.id);
                              lessonResourceInput.current?.click();
                            }} className="rounded-xl border border-dashed px-3 py-2 text-[10px] font-bold text-[#2bffff] disabled:opacity-40">
                              <Upload size={13} className="mr-2 inline" />Upload video or PDF
                            </button>
                            <div className="sm:col-span-2"><WizardTextarea label="Lesson description" fieldKey={`Lesson description ${module.id}`} rows={2} /></div>
                            <label className="flex items-center gap-2 text-[10px] text-white/60"><WizardCheckbox label={`Preview lesson ${module.id}`} />Public preview</label>
                            <label className="flex items-center gap-2 text-[10px] text-white/60"><WizardCheckbox label={`Required lesson ${module.id}`} defaultChecked />Required lesson</label>
                            <label className="flex items-center gap-2 text-[10px] text-white/60"><WizardCheckbox label={`Download permission ${module.id}`} />Allow downloads</label>
                            <label className="block">
                              <span className="mb-2 block text-[11px] font-bold text-white/65">Completion rule</span>
                              <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue(`Completion rule ${module.id}`) || "mark_complete"} onChange={(event) => updateValue(`Completion rule ${module.id}`, event.target.value)}>
                                <option value="mark_complete">Mark complete</option>
                                <option value="view">View lesson</option>
                                <option value="watch">Watch video</option>
                              </select>
                            </label>
                            <button type="button" disabled={saving} onClick={() => void addLesson(module)} className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-[10px] font-bold text-[#2bffff] disabled:opacity-40 sm:col-span-2">
                              <Plus size={13} /> Add lesson, quiz or assignment
                            </button>
                          </div>
                        </div>}
                      </Card>
                  ))}
                  {course && course.modules.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-xs text-white/45">No modules yet. Add the first module to begin building the course curriculum.</p>}
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <input className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" placeholder="Module title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} />
                      <input className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" placeholder="Module description (optional)" value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} />
                      <input className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" placeholder="Module thumbnail URL (optional)" value={moduleThumbnailUrl} onChange={(event) => setModuleThumbnailUrl(event.target.value)} />
                      <textarea className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" rows={2} placeholder="Learning objectives (one per line)" value={moduleObjectives} onChange={(event) => setModuleObjectives(event.target.value)} />
                    </div>
                    <button type="button" disabled={!course || saving || !moduleTitle.trim()} onClick={() => void addModule()} className="flex shrink-0 items-center gap-2 rounded-xl bg-[#2bffff]/10 px-4 py-3 text-xs font-bold text-[#2bffff] disabled:opacity-40">
                    {editingModuleId ? <Save size={15} /> : <Plus size={15} />} {editingModuleId ? "Save module" : "Add module"}
                    </button>
                    {editingModuleId && <button type="button" onClick={() => {
                      setEditingModuleId(null);
                      setModuleTitle("");
                      setModuleDescription("");
                      setModuleObjectives("");
                      setModuleThumbnailUrl("");
                    }} className="rounded-xl border px-3 py-2.5 text-xs">Cancel</button>}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  {[
                    "What students will learn",
                    "Skills gained",
                    "Course requirements",
                    "Target audience",
                    "Prerequisites",
                    "Recommended knowledge",
                  ].map((x) => (
                    <div key={x}>
                      <Field label={x} placeholder={`Add ${x.toLowerCase()}`} />
                      {Array.from({ length: repeatableCounts[x] || 0 }, (_, index) => (
                        <div key={`${x}-${index + 2}`} className="mt-3">
                          <Field label={x} fieldKey={`${x} #${index + 2}`} placeholder={`Add another ${x.toLowerCase()}`} />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRepeatableCounts((current) => ({ ...current, [x]: (current[x] || 0) + 1 }))}
                        className="mt-2 text-[10px] font-bold text-[#2bffff]"
                      >
                        + Add another
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-4">
                    <input ref={instructorImageInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCourseAsset(file, "image", "Instructor image URL");
                      event.currentTarget.value = "";
                    }} />
                    <Field label="Select instructor" value="Nisha Rao" />
                    <Field label="Professional designation" value="Principal Product Designer" />
                    <Field label="Instructor image URL" placeholder="https://…" />
                    <button type="button" disabled={saving} onClick={() => instructorImageInput.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs font-bold text-[#2bffff] disabled:opacity-40">
                      <Upload size={15} /> Upload instructor photo
                    </button>
                    <WizardTextarea label="Biography" rows={6} className="w-full rounded-xl border bg-white/[.04] p-3 text-xs" />
                  </div>
                  <Card className="p-5 text-center">
                    {textValue("Instructor image URL")
                      ? <img src={textValue("Instructor image URL")} alt="" className="mx-auto size-16 rounded-full object-cover" />
                      : <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#2bffff]/10 text-xl font-bold text-[#2bffff]">NR</span>}
                    <h4 className="mt-3 font-bold">{textValue("Select instructor") || "Instructor preview"}</h4>
                    <p className="text-[10px] text-white/40">{textValue("Professional designation") || "Professional designation"}</p>
                    <p className="mt-4 text-[10px] leading-relaxed text-white/55">
                      {textValue("Biography") || "Instructor biography preview"}
                    </p>
                  </Card>
                </div>
              )}
              {step === 4 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {["Free", "Paid"].map((x) => (
                        <button
                          key={x}
                          type="button"
                          onClick={() => updateValue("Free or Paid", x)}
                          className={`rounded-xl border p-4 text-left text-xs font-bold ${values["Free or Paid"] === x || (!values["Free or Paid"] && x === "Paid") ? "border-[#2bffff]/50 bg-[#2bffff]/10 text-[#2bffff]" : ""}`}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Course price" value="" type="number" />
                      <Field label="Discount price" value="" type="number" />
                      <Field label="Currency" value="INR" />
                      <Field label="Tax configuration" value="GST · 18%" />
                      <Field label="Access type" value="Lifetime access" />
                      <Field label="Maximum enrolments" value="Unlimited" />
                      <Field label="Promotion starts" type="datetime-local" />
                      <Field label="Promotion ends" type="datetime-local" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Access duration" placeholder="e.g. 12 months" />
                      <Field label="Promotional pricing" placeholder="Coupon or campaign details" />
                      <Field label="Coupon eligibility" placeholder="Eligible / not eligible" />
                    </div>
                  </div>
                  <Card className="h-fit p-5">
                    <p className="text-[10px] font-bold uppercase text-white/35">Student price</p>
                    <p className="mt-3 text-3xl font-bold">{values["Free or Paid"] === "Free" ? "Free" : `${textValue("Currency") || "INR"} ${textValue("Discount price") || textValue("Course price") || "0"}`}</p>
                    {values["Free or Paid"] !== "Free" && textValue("Course price") && textValue("Discount price") && Number(textValue("Course price")) > Number(textValue("Discount price")) && (
                      <p className="mt-1 text-xs text-white/35 line-through">{textValue("Currency") || "INR"} {textValue("Course price")}</p>
                    )}
                    <div className="my-4 border-t" />
                    <p className="text-[10px] text-emerald-400">{textValue("Tax configuration") || "Tax configuration"} · total calculated at checkout</p>
                    <p className="mt-3 text-[9px] leading-relaxed text-white/40">Tax, access duration, coupon eligibility, and enrolment limits are saved with the course. Checkout currently applies the server-wide tax setting and does not enforce per-course expiry or capacity.</p>
                  </Card>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  {["Enable quizzes", "Enable assignments", "Issue course certificate"].map((x) => (
                    <label
                      key={x}
                      className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
                    >
                      {x}
                      <WizardCheckbox label={x} defaultChecked />
                    </label>
                  ))}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Passing percentage" value="70%" />
                    <Field label="Quiz attempt limit" value="3 attempts" />
                    <Field label="Completion requirement" value="Complete all required lessons" />
                    <Field label="Certificate template" value="LearnIsphere Premium" />
                    <Field label="Assignment submission rules" placeholder="Describe permitted submissions" />
                    <Field label="Certificate issue rules" placeholder="When should the certificate be issued?" />
                  </div>
                  <label className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold">
                    Certificate eligibility
                    <WizardCheckbox label="Certificate eligibility" defaultChecked />
                  </label>
                  <Card className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Certificate preview</p>
                    <div className="mt-3 rounded-xl border border-[#2bffff]/20 bg-white/[.025] p-5 text-center">
                      <Award size={24} className="mx-auto text-[#2bffff]" />
                      <p className="mt-2 text-sm font-bold">{textValue("Certificate template") || "Course completion certificate"}</p>
                      <p className="mt-1 text-[10px] text-white/40">Awarded after all completion requirements are met</p>
                    </div>
                  </Card>
                  <p className="text-[10px] leading-relaxed text-white/40">Assessment and certificate settings are saved with the course. Quiz scoring, assignment submissions, and certificate issuance are not connected to a learner workflow yet.</p>
                </div>
              )}
              {step === 6 && <SeoEditor compact />}
              {step === 7 && (
                <div className="space-y-5">
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={textValue("Course thumbnail URL") || course?.image || courses[0].image}
                        alt=""
                        className="h-24 w-36 rounded-xl object-cover"
                      />
                      <div>
                        <StatusBadge status={textValue("Publication action") === "Publish Now" && textValue("Visibility") !== "Private" ? "Published" : "Draft"} />
                        <h4 className="mt-3 text-lg font-bold">{textValue("Course title") || "Course title preview"}</h4>
                        <p className="mt-1 text-xs text-white/40">
                          {(course?.modules || []).length} modules · {textValue("Instructor") || textValue("Select instructor") || "Instructor"}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setPreviewOpen((current) => !current)} className="mt-4 flex items-center gap-2 text-xs font-bold text-[#2bffff]">
                      <Eye size={14} /> {previewOpen ? "Hide course preview" : "Preview course"}
                    </button>
                  </Card>
                  {previewOpen && (
                    <Card className="space-y-3 p-5">
                      <h4 className="text-lg font-bold">{textValue("Course title") || "Course title"}</h4>
                      <p className="text-xs leading-relaxed text-white/55">{textValue("Short description") || textValue("Full description") || "Course description preview"}</p>
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">What students will learn</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-white/60">
                          {repeatedValues("What students will learn").map((outcome) => <li key={outcome}>{outcome}</li>)}
                        </ul>
                      </div>
                      <p className="text-sm font-bold text-[#2bffff]">{values["Free or Paid"] === "Free" ? "Free" : `${textValue("Currency") || "INR"} ${textValue("Discount price") || textValue("Course price") || "Price not set"}`}</p>
                    </Card>
                  )}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["Save as Draft", "Publish Now", "Schedule Publication"].map((x, i) => (
                      <button
                        key={x}
                        type="button"
                        onClick={() => updateValue("Publication action", x)}
                        className={`rounded-xl border p-4 text-left text-xs font-bold ${textValue("Publication action") === x || (!values["Publication action"] && i === 1) ? "border-[#2bffff]/50 bg-[#2bffff]/10 text-[#2bffff]" : ""}`}
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold text-white/65">Visibility</span>
                      <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue("Visibility") || "Public"} onChange={(event) => updateValue("Visibility", event.target.value)}>
                        <option>Public</option>
                        <option>Private</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold text-white/65">Course availability</span>
                      <select className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50" value={textValue("Course availability") || "Available immediately"} onChange={(event) => updateValue("Course availability", event.target.value)}>
                        <option>Available immediately</option>
                        <option>Unavailable</option>
                      </select>
                    </label>
                    <Field label="Publication date" type="date" />
                    <Field label="Publication time" type="time" />
                    <label className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold">
                      Featured course
                      <WizardCheckbox label="Featured course" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 p-4 sm:px-7">
            <button
              onClick={() => void saveCourse()}
              disabled={saving}
              className="flex items-center gap-2 text-xs font-bold text-white/50"
            >
              <Save size={14} /> {saving ? "Saving…" : saved ? "Saved" : course ? "Save changes" : "Save draft"}
            </button>
            <div className="flex gap-2">
              <button
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-xl border px-4 py-2.5 text-xs font-bold disabled:opacity-30"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (step < 7 && step === 0 && (!textValue("Course title") || !textValue("Course category"))) {
                    setError("Enter a course title and category before continuing.");
                  } else if (step < 7) {
                    setError("");
                    setStep((current) => current + 1);
                  }
                  else if (textValue("Publication action") === "Publish Now") void saveCourse(true);
                  else if (textValue("Publication action") === "Save as Draft") void saveCourse(false);
                  else void saveCourse();
                }}
                disabled={saving}
                className="rounded-xl bg-[#2bffff] px-5 py-2.5 text-xs font-bold text-black disabled:opacity-40"
              >
                {step === 7 ? (textValue("Publication action") === "Publish Now" ? "Publish course" : textValue("Publication action") === "Schedule Publication" ? "Save schedule" : "Save changes") : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
      </CourseWizardFormContext.Provider>
    </ModalShell>
  );
}

type AdminCourseLesson = {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: string;
  is_preview: boolean;
  is_required: boolean;
  download_allowed: boolean;
  completion_rule: string;
  published: boolean;
  preview_content: string;
  preview_resource_url: string;
  protected_resource_url: string;
};

type AdminCourseModule = {
  id: number;
  title: string;
  description: string;
  learning_objectives: string[];
  thumbnail_url: string;
  lessons: AdminCourseLesson[];
};

type AdminCourse = {
  id: number;
  slug: string;
  title: string;
  category: string;
  qualification: string;
  description: string;
  overview: string;
  image: string;
  cover_image_url: string;
  duration: string;
  difficulty: string;
  currency: string;
  price: string | null;
  selling_price: string | null;
  list_price: string | null;
  promotional_price: string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  instructor_name: string;
  instructor_bio: string;
  instructor_image_url: string;
  published: boolean;
  available: boolean;
  purchase_eligible: boolean;
  featured: boolean;
  learning_outcomes: string[];
  skills: string[];
  prerequisites: string;
  enrollment_count: number;
  updated_at: string;
  editor_data: {
    fields?: Record<string, string | boolean>;
    course_language?: string;
    course_type?: string;
    subcategory?: string;
    promotional_video_url?: string;
    estimated_hours?: string;
    target_audience?: string;
    recommended_knowledge?: string;
    instructor_designation?: string;
    publication_action?: string;
  };
  modules: AdminCourseModule[];
};

type CourseEditorDraft = {
  title: string;
  slug: string;
  category: string;
  qualification: string;
  description: string;
  overview: string;
  cover_image_url: string;
  duration: string;
  difficulty: string;
  instructor_name: string;
  instructor_bio: string;
  instructor_image_url: string;
  learning_outcomes: string[];
  prerequisites: string;
  currency: string;
  selling_price: string;
  list_price: string;
  promotional_price: string;
  promotion_starts_at: string;
  promotion_ends_at: string;
  published: boolean;
  available: boolean;
  purchase_eligible: boolean;
  featured: boolean;
};

function courseEditorDraft(course: AdminCourse | null): CourseEditorDraft {
  return {
    title: course?.title || "",
    slug: course?.slug || "",
    category: course?.category || "",
    qualification: course?.qualification || "Certification",
    description: course?.description || "",
    overview: course?.overview || "",
    cover_image_url: course?.cover_image_url || "",
    duration: course?.duration || "",
    difficulty: course?.difficulty || "",
    instructor_name: course?.instructor_name || "",
    instructor_bio: course?.instructor_bio || "",
    instructor_image_url: course?.instructor_image_url || "",
    learning_outcomes: course?.learning_outcomes || [],
    prerequisites: course?.prerequisites || "",
    currency: course?.currency || "INR",
    selling_price: course?.selling_price || "",
    list_price: course?.list_price || "",
    promotional_price: course?.promotional_price || "",
    promotion_starts_at: course?.promotion_starts_at
      ? new Date(new Date(course.promotion_starts_at).getTime() - new Date(course.promotion_starts_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "",
    promotion_ends_at: course?.promotion_ends_at
      ? new Date(new Date(course.promotion_ends_at).getTime() - new Date(course.promotion_ends_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "",
    published: course?.published || false,
    available: course?.available ?? true,
    purchase_eligible: course?.purchase_eligible ?? true,
    featured: course?.featured || false,
  };
}

function CourseEditor({
  course: initialCourse,
  close,
  onSaved,
}: {
  course: AdminCourse | null;
  close: () => void;
  onSaved: (course: AdminCourse) => void;
}) {
  const [course, setCourse] = useState(initialCourse);
  const [draft, setDraft] = useState(() => courseEditorDraft(initialCourse));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonDrafts, setLessonDrafts] = useState<Record<number, {
    title: string;
    type: string;
    duration: string;
    description: string;
    protected_resource_url: string;
    is_preview: boolean;
    preview_content: string;
    preview_resource_url: string;
    published: boolean;
  }>>({});
  const steps = ["Basic information", "Curriculum", "Pricing & access", "Publication"];

  const updateDraft = <K extends keyof CourseEditorDraft>(key: K, value: CourseEditorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveCourse = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...draft,
        selling_price: draft.selling_price || null,
        list_price: draft.list_price || null,
        promotional_price: draft.promotional_price || null,
        promotion_starts_at: draft.promotion_starts_at ? new Date(draft.promotion_starts_at).toISOString() : null,
        promotion_ends_at: draft.promotion_ends_at ? new Date(draft.promotion_ends_at).toISOString() : null,
      };
      const result = await commerceApi<{ course: AdminCourse }>(
        course ? `admin/courses/${course.id}/` : "admin/courses/create/",
        { method: "POST", body: JSON.stringify(payload) },
      );
      setCourse(result.course);
      setDraft(courseEditorDraft(result.course));
      onSaved(result.course);
      setNotice(course ? "Course changes saved." : "Course created. You can now add its curriculum.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Course changes could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const addModule = async () => {
    if (!course) {
      setError("Save the course before adding its curriculum.");
      return;
    }
    if (!moduleTitle.trim()) return;
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ module: AdminCourseModule }>(`admin/courses/${course.id}/modules/`, {
        method: "POST",
        body: JSON.stringify({ title: moduleTitle.trim() }),
      });
      setCourse((current) => current ? { ...current, modules: [...current.modules, result.module] } : current);
      setModuleTitle("");
      setNotice("Module added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Module could not be added.");
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (module: AdminCourseModule) => {
    if (!course) return;
    const lesson = lessonDrafts[module.id];
    if (!lesson?.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ lesson: AdminCourseLesson }>(`admin/modules/${module.id}/lessons/`, {
        method: "POST",
        body: JSON.stringify(lesson),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id
          ? { ...item, lessons: [...item.lessons, result.lesson] }
          : item),
      } : current);
      setLessonDrafts((current) => ({
        ...current,
        [module.id]: {
          title: "",
          type: "video",
          duration: "",
          description: "",
          protected_resource_url: "",
          is_preview: false,
          preview_content: "",
          preview_resource_url: "",
          published: false,
        },
      }));
      setNotice("Lesson added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson could not be added.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLessonPublication = async (module: AdminCourseModule, lesson: AdminCourseLesson) => {
    setSaving(true);
    setError("");
    try {
      const result = await commerceApi<{ lesson: AdminCourseLesson }>(`admin/lessons/${lesson.id}/`, {
        method: "POST",
        body: JSON.stringify({ published: !lesson.published }),
      });
      setCourse((current) => current ? {
        ...current,
        modules: current.modules.map((item) => item.id === module.id
          ? { ...item, lessons: item.lessons.map((entry) => entry.id === lesson.id ? result.lesson : entry) }
          : item),
      } : current);
      setNotice(result.lesson.published ? "Lesson published." : "Lesson moved to draft.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson publication could not be changed.");
    } finally {
      setSaving(false);
    }
  };

  const lessonDraft = (moduleId: number) => lessonDrafts[moduleId] || {
    title: "",
    type: "video",
    duration: "",
    description: "",
    protected_resource_url: "",
    is_preview: false,
    preview_content: "",
    preview_resource_url: "",
    published: false,
  };

  const updateLessonDraft = (moduleId: number, patch: Partial<ReturnType<typeof lessonDraft>>) => {
    setLessonDrafts((current) => ({ ...current, [moduleId]: { ...lessonDraft(moduleId), ...patch } }));
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-3 text-xs outline-none focus:border-[#2bffff]/50";
  const field = (label: string, value: string, onChange: (value: string) => void, options: { required?: boolean; type?: string } = {}) => (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold text-white/65">{label}{options.required && <span className="ml-1 text-[#2bffff]">*</span>}</span>
      <input className={inputClass} type={options.type || "text"} required={options.required} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
  const textarea = (label: string, value: string, onChange: (value: string) => void, rows = 3) => (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold text-white/65">{label}</span>
      <textarea className={inputClass} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );

  return (
    <ModalShell
      title={course ? `Manage ${course.title}` : "Create a new course"}
      desc="Manage course information, curriculum, pricing, and publication."
      close={close}
      wide
    >
      <div className="grid h-[78vh] md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-white/10 p-4 md:block">
          <p className="mb-4 px-2 text-[9px] font-bold uppercase tracking-[.18em] text-white/30">Course setup</p>
          <div className="space-y-1">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold ${step === index ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/45 hover:bg-white/[.03]"}`}
              >
                <span className={`grid size-6 place-items-center rounded-full border text-[9px] ${index < step ? "border-[#2bffff] bg-[#2bffff] text-black" : "border-white/15"}`}>{index + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </aside>
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-white/10 px-5 py-3 md:hidden">
            <p className="text-xs font-bold text-[#2bffff]">Step {step + 1} of {steps.length} · {steps[step]}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
            <div className="mx-auto max-w-3xl space-y-5">
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200" role="alert">{error}</p>}
              {notice && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-200" role="status">{notice}</p>}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {field("Course title", draft.title, (value) => updateDraft("title", value), { required: true })}
                    {field("URL slug", draft.slug, (value) => updateDraft("slug", value), { required: true })}
                    {field("Course category", draft.category, (value) => updateDraft("category", value), { required: true })}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold text-white/65">Course type</span>
                      <select className={inputClass} value={draft.qualification} onChange={(event) => updateDraft("qualification", event.target.value)}>
                        {["Certification", "Diploma", "Master's", "Short course", "Module"].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    {field("Difficulty", draft.difficulty, (value) => updateDraft("difficulty", value))}
                    {field("Estimated duration", draft.duration, (value) => updateDraft("duration", value))}
                    <div className="sm:col-span-2">{field("Course thumbnail URL", draft.cover_image_url, (value) => updateDraft("cover_image_url", value))}</div>
                  </div>
                  {textarea("Short description", draft.description, (value) => updateDraft("description", value), 3)}
                  {textarea("Course overview", draft.overview, (value) => updateDraft("overview", value), 4)}
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  {!course && <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">Save the course first, then add its modules and lessons.</p>}
                  {(course?.modules || []).map((module, index) => (
                    <Card key={module.id} className="overflow-hidden">
                      <div className="border-b p-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/35">Module {index + 1}</p>
                        <p className="mt-1 text-sm font-bold">{module.title}</p>
                      </div>
                      <div className="space-y-2 p-4">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3">
                            <span className="text-[11px]">{lesson.type} · {lesson.title}</span>
                            <button className="text-[10px] font-bold text-[#2bffff]" disabled={saving} onClick={() => void toggleLessonPublication(module, lesson)}>
                              {lesson.published ? "Published · Unpublish" : "Draft · Publish"}
                            </button>
                          </div>
                        ))}
                        <div className="grid gap-2 border-t border-white/[.07] pt-3 sm:grid-cols-2">
                          {field("Lesson title", lessonDraft(module.id).title, (value) => updateLessonDraft(module.id, { title: value }), { required: true })}
                          <label className="block">
                            <span className="mb-2 block text-[11px] font-bold text-white/65">Lesson type</span>
                            <select className={inputClass} value={lessonDraft(module.id).type} onChange={(event) => updateLessonDraft(module.id, { type: event.target.value })}>
                              {["video", "reading", "resource", "quiz", "assignment"].map((item) => <option key={item}>{item}</option>)}
                            </select>
                          </label>
                          {field("Duration", lessonDraft(module.id).duration, (value) => updateLessonDraft(module.id, { duration: value }))}
                          {field("Protected resource URL", lessonDraft(module.id).protected_resource_url, (value) => updateLessonDraft(module.id, { protected_resource_url: value }))}
                          <div className="sm:col-span-2">{textarea("Lesson description", lessonDraft(module.id).description, (value) => updateLessonDraft(module.id, { description: value }), 2)}</div>
                          <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={lessonDraft(module.id).is_preview} onChange={(event) => updateLessonDraft(module.id, { is_preview: event.target.checked })} />Public preview</label>
                          <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={lessonDraft(module.id).published} onChange={(event) => updateLessonDraft(module.id, { published: event.target.checked })} />Published lesson</label>
                          {lessonDraft(module.id).is_preview && <div className="sm:col-span-2 space-y-2">
                            {textarea("Preview text", lessonDraft(module.id).preview_content, (value) => updateLessonDraft(module.id, { preview_content: value }), 2)}
                            {field("Preview resource URL", lessonDraft(module.id).preview_resource_url, (value) => updateLessonDraft(module.id, { preview_resource_url: value }))}
                          </div>}
                          <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-[10px] font-bold text-[#2bffff] disabled:opacity-40 sm:col-span-2" disabled={saving || !course} onClick={() => void addLesson(module)}>
                            <Plus size={13} /> Add lesson
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex gap-2">
                    <input className={`${inputClass} flex-1`} placeholder="New module title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} />
                    <button className="rounded-xl bg-[#2bffff]/10 px-4 py-2.5 text-xs font-bold text-[#2bffff] disabled:opacity-40" disabled={saving || !course || !moduleTitle.trim()} onClick={() => void addModule()}>Add module</button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {field("Selling price", draft.selling_price, (value) => updateDraft("selling_price", value), { type: "number" })}
                    {field("List price", draft.list_price, (value) => updateDraft("list_price", value), { type: "number" })}
                    {field("Promotional price", draft.promotional_price, (value) => updateDraft("promotional_price", value), { type: "number" })}
                    {field("Currency", draft.currency, (value) => updateDraft("currency", value))}
                    {field("Promotion starts", draft.promotion_starts_at, (value) => updateDraft("promotion_starts_at", value), { type: "datetime-local" })}
                    {field("Promotion ends", draft.promotion_ends_at, (value) => updateDraft("promotion_ends_at", value), { type: "datetime-local" })}
                  </div>
                  <p className="text-[10px] text-white/40">Prices and checkout totals are validated by Django. Leave prices blank to keep purchasing unavailable.</p>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {field("Instructor name", draft.instructor_name, (value) => updateDraft("instructor_name", value))}
                    {field("Instructor image URL", draft.instructor_image_url, (value) => updateDraft("instructor_image_url", value))}
                  </div>
                  {textarea("Instructor biography", draft.instructor_bio, (value) => updateDraft("instructor_bio", value), 4)}
                  {textarea("Prerequisites", draft.prerequisites, (value) => updateDraft("prerequisites", value), 3)}
                  {textarea("Learning outcomes (one per line)", draft.learning_outcomes.join("\n"), (value) => updateDraft("learning_outcomes", value.split("\n").map((item) => item.trim()).filter(Boolean),), 4)}
                  <div className="space-y-3">
                    {([
                      ["published", "Published"],
                      ["available", "Available for enrolment"],
                      ["purchase_eligible", "Purchasable"],
                      ["featured", "Feature on the public website"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold">
                        {label}
                        <input type="checkbox" checked={draft[key]} onChange={(event) => updateDraft(key, event.target.checked)} className="accent-cyan-300" />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4 sm:px-7">
            <button onClick={close} className="text-xs font-bold text-white/50">Close</button>
            <div className="flex gap-2">
              {step > 0 && <button onClick={() => setStep((current) => current - 1)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Back</button>}
              <button onClick={() => void saveCourse()} disabled={saving} className="rounded-xl border px-4 py-2.5 text-xs font-bold disabled:opacity-40">{saving ? "Saving…" : "Save course"}</button>
              {step < steps.length - 1
                ? <button onClick={() => setStep((current) => current + 1)} className="rounded-xl bg-[#2bffff] px-5 py-2.5 text-xs font-bold text-black">Continue</button>
                : <button onClick={() => void saveCourse()} disabled={saving} className="rounded-xl bg-[#2bffff] px-5 py-2.5 text-xs font-bold text-black disabled:opacity-40">{saving ? "Saving…" : draft.published ? "Save and publish" : "Save as draft"}</button>}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function CoursesPage({ student = false }: { student?: boolean }) {
  const [tab, setTab] = useState(student ? "All Courses" : "All");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(!student);
  const [error, setError] = useState("");
  const [editorCourse, setEditorCourse] = useState<AdminCourse | null | undefined>(undefined);
  const statusTabs = student
    ? ["All Courses", "In Progress", "Completed", "Upcoming"]
    : ["All", "Published", "Draft", "In Review", "Scheduled", "Archived"];

  useEffect(() => {
    if (student) return;
    let active = true;
    setLoading(true);
    commerceApi<{ results: AdminCourse[] }>("admin/courses/")
      .then((result) => {
        if (active) setAdminCourses(result.results);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Courses could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [student]);

  const rows = useMemo(() => {
    if (student) {
      return courses.map((course, index) => ({
        id: course.title,
        source: null,
        title: course.title,
        instructor: course.instructor,
        category: course.tag,
        type: index === 2 ? "Hybrid" : "Self-paced",
        image: course.image,
        status: "In Progress",
        price: `${course.lessons} lessons`,
        priceAvailable: true,
        enrolments: 0,
        progress: course.progress,
        updatedAt: "",
      }));
    }
    const totalEnrollments = adminCourses.reduce((total, course) => total + course.enrollment_count, 0);
    return adminCourses.map((course) => ({
      id: course.id,
      source: course,
      title: course.title,
      instructor: course.instructor_name || "Instructor not assigned",
      category: course.category,
      type: course.editor_data.course_type || course.qualification,
      image: course.image || "",
      status: course.published ? "Published" : "Draft",
      price: course.price
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: course.currency,
            maximumFractionDigits: 0,
          }).format(Number(course.price))
        : "Price unavailable",
      priceAvailable: course.price !== null,
      enrolments: course.enrollment_count,
      progress: totalEnrollments ? Math.round((course.enrollment_count / totalEnrollments) * 100) : 0,
      updatedAt: course.updated_at,
    }));
  }, [adminCourses, student]);

  const categories = [...new Set(rows.map((course) => course.category).filter(Boolean))].sort();
  const instructors = [...new Set(rows.map((course) => course.instructor).filter((name) => name !== "Instructor not assigned"))].sort();
  const types = [...new Set(rows.map((course) => course.type).filter(Boolean))].sort();
  const filtered = rows
    .filter((course) => course.title.toLowerCase().includes(search.toLowerCase()))
    .filter((course) => !categoryFilter || course.category === categoryFilter)
    .filter((course) => !instructorFilter || course.instructor === instructorFilter)
    .filter((course) => !typeFilter || course.type === typeFilter)
    .filter((course) => !priceFilter || (priceFilter === "priced" ? course.priceAvailable : !course.priceAvailable))
    .filter((course) => tab === "All" || tab === "All Courses" || course.status === tab)
    .sort((left, right) => sortOrder === "newest"
      ? right.updatedAt.localeCompare(left.updatedAt)
      : left.updatedAt.localeCompare(right.updatedAt));

  const saveCourseInList = (savedCourse: AdminCourse) => {
    setAdminCourses((current) => {
      const exists = current.some((course) => course.id === savedCourse.id);
      return exists
        ? current.map((course) => course.id === savedCourse.id ? savedCourse : course)
        : [savedCourse, ...current];
    });
  };

  const exportCourses = () => {
    const columns = ["title", "slug", "category", "qualification", "instructor_name", "published", "currency", "selling_price", "list_price", "enrollment_count"];
    const escape = (value: string | number | boolean | null) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      columns.join(","),
      ...adminCourses.map((course) => [
        course.title,
        course.slug,
        course.category,
        course.qualification,
        course.instructor_name,
        course.published,
        course.currency,
        course.selling_price,
        course.list_price,
        course.enrollment_count,
      ].map(escape).join(",")),
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "learnisphere-courses.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{student ? "My courses" : "Course Management"}</h2>
          <p className="mt-1 text-sm text-white/45">
            {student
              ? "Continue where you left off and keep building momentum."
              : "Create, publish, and manage your learning catalogue."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!student && (
            <>
              <button onClick={() => setError("Bulk import is not supported by the course API yet.")} className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold">
                <Upload size={14} />
                Import
              </button>
              <button onClick={exportCourses} className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold">
                <Download size={14} />
                Export
              </button>
            </>
          )}
          <button
            onClick={() => !student && setEditorCourse(null)}
            className="flex items-center gap-2 rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black"
          >
            {student ? <Search size={14} /> : <Plus size={14} />}
            {student ? "Explore catalogue" : "Create course"}
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-auto scrollbar-none">
        {statusTabs.map((status) => (
          <button
            onClick={() => setTab(status)}
            key={status}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold ${tab === status ? "bg-[#2bffff] text-black" : "border bg-white/[.03] text-white/45"}`}
          >
            {status}
          </button>
        ))}
      </div>
      {!student && (
        <Card className="p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-3 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by course title…"
                className="w-full rounded-xl border bg-white/[.03] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#2bffff]/40"
              />
            </div>
            <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border bg-[#071011] px-3 py-2.5 text-[10px] font-bold text-white/60">
              <option value="">Category</option>{categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select aria-label="Filter by instructor" value={instructorFilter} onChange={(event) => setInstructorFilter(event.target.value)} className="rounded-xl border bg-[#071011] px-3 py-2.5 text-[10px] font-bold text-white/60">
              <option value="">Instructor</option>{instructors.map((instructor) => <option key={instructor}>{instructor}</option>)}
            </select>
            <select aria-label="Filter by course type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border bg-[#071011] px-3 py-2.5 text-[10px] font-bold text-white/60">
              <option value="">Course type</option>{types.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select aria-label="Filter by price" value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="rounded-xl border bg-[#071011] px-3 py-2.5 text-[10px] font-bold text-white/60">
              <option value="">Price</option><option value="priced">Configured</option><option value="unpriced">Unavailable</option>
            </select>
            <select aria-label="Sort by last updated" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-xl border bg-[#071011] px-3 py-2.5 text-[10px] font-bold text-white/60">
              <option value="newest">Last updated</option><option value="oldest">Oldest</option>
            </select>
            <div className="flex rounded-xl border p-1">
              <button aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/30"}`}>
                <LayoutDashboard size={14} />
              </button>
              <button aria-label="List view" onClick={() => setView("table")} className={`rounded-lg p-2 ${view === "table" ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/30"}`}>
                <List size={14} />
              </button>
            </div>
          </div>
        </Card>
      )}
      {!student && loading && <Card className="p-6 text-sm text-white/45">Loading courses…</Card>}
      {!student && error && <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300" role="alert">{error}</div>}
      {(view === "grid" || student) && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="group overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                {course.image
                  ? <img alt="" src={course.image} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  : <div className="h-full w-full bg-gradient-to-br from-cyan-900/70 to-slate-950" />}
                <span className="absolute left-4 top-4 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold backdrop-blur">{course.category}</span>
                <button aria-label={`Manage ${course.title}`} onClick={() => course.source && setEditorCourse(course.source)} className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg bg-black/65 backdrop-blur">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <StatusBadge status={student ? "In Progress" : course.status} />
                  <span className="text-[10px] text-white/35">{course.type}</span>
                </div>
                <h3 className="mt-3 text-base font-bold">{course.title}</h3>
                <p className="mt-1 text-xs text-white/40">by {course.instructor}</p>
                <div className="mt-5 flex justify-between text-[10px] font-bold">
                  <span>{student ? "Course progress" : `${course.enrolments.toLocaleString()} enrolments`}</span>
                  <span title="Share of active catalogue enrolments">{course.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[.07]">
                  <div className="h-full rounded-full bg-[#2bffff]" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold">{course.price}</span>
                  <button onClick={() => course.source && setEditorCourse(course.source)} className="flex items-center gap-1.5 text-xs font-bold text-[#2bffff]">
                    {student ? "Continue" : "Manage"}<ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {view === "table" && !student && !loading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-xs">
              <thead className="bg-white/[.025] text-[9px] uppercase tracking-wider text-white/35">
                <tr><th className="px-5 py-3">Course</th><th>Category</th><th>Instructor</th><th>Type</th><th>Enrolments</th><th>Price</th><th>Status</th><th>Updated</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id} className="border-t">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {course.image && <img src={course.image} alt="" className="h-10 w-14 rounded-lg object-cover" />}
                        <b>{course.title}</b>
                      </div>
                    </td>
                    <td>{course.category}</td><td>{course.instructor}</td><td>{course.type}</td>
                    <td>{course.enrolments.toLocaleString()}</td><td className="font-bold">{course.price}</td>
                    <td><StatusBadge status={course.status} /></td>
                    <td className="text-white/40">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "—"}</td>
                    <td><button aria-label={`Manage ${course.title}`} onClick={() => course.source && setEditorCourse(course.source)}><MoreHorizontal size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {!loading && !error && filtered.length === 0 && (
        <Card className="grid min-h-64 place-items-center p-8 text-center">
          <div>
            <Search size={28} className="mx-auto text-white/25" />
            <h3 className="mt-3 font-bold">No courses found</h3>
            <p className="mt-1 text-xs text-white/35">Try adjusting your search or filters.</p>
          </div>
        </Card>
      )}
      {editorCourse !== undefined && (
        <CourseWizard
          key={editorCourse?.id ?? "new-course"}
          course={editorCourse}
          close={() => setEditorCourse(undefined)}
          onSaved={saveCourseInList}
        />
      )}
    </div>
  );
}

function PageLead({
  title,
  desc,
  action,
  icon: Icon,
}: {
  title: string;
  desc: string;
  action: string;
  icon: IconType;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      <button className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
        <Icon size={15} />
        {action}
      </button>
    </div>
  );
}

function SeoEditor({ compact = false }: { compact?: boolean }) {
  const wizardForm = useContext(CourseWizardFormContext);
  const socialImageInput = useRef<HTMLInputElement>(null);
  const [seoTab, setSeoTab] = useState("General SEO");
  const [socialImageKey, setSocialImageKey] = useState("");
  const [socialUploadError, setSocialUploadError] = useState("");
  const [socialUploading, setSocialUploading] = useState(false);
  const tabs = ["General SEO", "Social", "Advanced", "Schema", "Readability", "SEO Analysis"];
  const seoValue = (key: string, fallback: string) =>
    wizardForm ? String(wizardForm.values[key] ?? "") : fallback;
  const seoTitle = seoValue("SEO title", "Advanced Product Design Course | LearnIsphere");
  const metaDescription = seoValue(
    "Meta description",
    "Build job-ready product design skills through practical projects, expert instruction, and a recognised certificate.",
  );
  const uploadSocialImage = async (file?: File) => {
    if (!file || !socialImageKey || !wizardForm) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", "image");
    setSocialUploading(true);
    setSocialUploadError("");
    try {
      const result = await commerceApi<{ url: string }>("admin/uploads/", {
        method: "POST",
        body: formData,
      });
      wizardForm.update(socialImageKey, result.url);
    } catch (reason) {
      setSocialUploadError(reason instanceof Error ? reason.message : "The social image could not be uploaded.");
    } finally {
      setSocialUploading(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-white/[.025] p-1 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setSeoTab(t)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold ${seoTab === t ? "bg-[#2bffff] text-black" : "text-white/40"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {seoTab === "General SEO" && (
        <div className={`grid gap-5 ${compact ? "" : "xl:grid-cols-[1fr_360px]"}`}>
          <div className="space-y-4">
            <Field label="Focus keyword" value="product design course" />
            <Field label="Additional keywords" value="UX certification, design masterclass" />
            <div>
              <Field label="SEO title" value="Advanced Product Design Course | LearnIsphere" />
              <p className="mt-1 text-right text-[9px] text-emerald-400">{seoTitle.length} / 60 characters</p>
            </div>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-white/65">
                Meta description
              </span>
              <WizardTextarea label="Meta description" rows={4} value="Build job-ready product design skills through practical projects, expert instruction, and a recognised certificate." className="w-full rounded-xl border bg-white/[.04] p-3 text-xs outline-none focus:border-[#2bffff]/50" />
              <p className="mt-1 text-right text-[9px] text-emerald-400">{metaDescription.length} / 160 characters</p>
            </label>
            <Field label="URL slug" fieldKey="SEO URL slug" value="courses/advanced-product-design" />
            <Field
              label="Canonical URL"
              fieldKey="SEO canonical URL"
              value="https://learnisphere.com/courses/advanced-product-design"
            />
          </div>
          {!compact && (
            <Card className="h-fit p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold">Google preview</p>
                <div className="flex gap-1">
                  <Monitor size={14} className="text-[#2bffff]" />
                  <span className="text-[9px] text-white/35">Desktop</span>
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 font-['Open_Sans:Regular']">
                <p className="text-[10px] text-[#202124]">
                  learnisphere.com › courses › product-design
                </p>
                <p className="mt-1 text-[17px] text-[#1a0dab]">
                  Advanced Product Design Course | LearnIsphere
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#4d5156]">
                  Build job-ready product design skills through practical projects, expert
                  instruction, and a recognised certificate.
                </p>
              </div>
              <p className="mt-4 text-[9px] leading-relaxed text-white/35">
                Preview is indicative. Search engines may display different metadata.
              </p>
            </Card>
          )}
        </div>
      )}
      {seoTab === "Social" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <input ref={socialImageInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
            void uploadSocialImage(event.target.files?.[0]);
            event.currentTarget.value = "";
          }} />
          {["Open Graph / Facebook", "X / Twitter"].map((network) => (
            <Card key={network} className="p-5">
              <h4 className="font-bold">{network}</h4>
              <div className="mt-4 space-y-4">
                <Field label="Social title" fieldKey={`Social title ${network}`} value="Become a confident product designer" />
                <Field
                  label="Social description"
                  fieldKey={`Social description ${network}`}
                  value="Learn with real projects and expert feedback."
                />
                <Field label="Social image URL" fieldKey={`Social image URL ${network}`} placeholder="https://…" />
                <button
                  type="button"
                  disabled={!wizardForm || socialUploading}
                  onClick={() => {
                    setSocialImageKey(`Social image URL ${network}`);
                    socialImageInput.current?.click();
                  }}
                  className="flex h-32 w-full items-center justify-center gap-2 rounded-xl border border-dashed text-xs text-white/40 disabled:opacity-40"
                >
                  <ImageIcon size={16} />
                  {socialUploading ? "Uploading…" : "Upload social image"}
                </button>
                {wizardForm?.values[`Social image URL ${network}`] && <img src={String(wizardForm.values[`Social image URL ${network}`])} alt="" className="h-24 w-full rounded-xl object-cover" />}
              </div>
            </Card>
          ))}
          {socialUploadError && <p className="text-xs text-red-200 lg:col-span-2" role="alert">{socialUploadError}</p>}
        </div>
      )}
      {seoTab === "Advanced" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Index this content",
            "Follow links",
            "Include in sitemap",
            "Show in search results",
          ].map((x) => (
            <label
              key={x}
              className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
            >
              {x}
              <WizardCheckbox label={x} defaultChecked />
            </label>
          ))}
          <Field label="Breadcrumb title" value="Product Design Masterclass" />
          <Field label="Custom canonical URL" fieldKey="SEO custom canonical URL" placeholder="Leave empty to use default" />
        </div>
      )}
      {seoTab === "Schema" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Field label="Schema type" value="Course" />
            <label className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold">
              Automatic schema generation
              <WizardCheckbox label="Automatic schema generation" defaultChecked />
            </label>
            <Field label="Provider" value="LearnIsphere Academy" />
            <Field label="Course mode" value="Online" />
          </div>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Structured data</h4>
              <StatusBadge status="Valid" />
            </div>
            <pre className="mt-4 overflow-auto rounded-xl bg-black/40 p-4 text-[9px] leading-relaxed text-[#2bffff]">{`{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "Advanced Product Design",\n  "provider": "LearnIsphere"\n}`}</pre>
          </Card>
        </div>
      )}
      {(seoTab === "Readability" || seoTab === "SEO Analysis") && (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <Card className="grid min-h-48 place-items-center p-5 text-center">
            <div>
              <div className="mx-auto grid size-24 place-items-center rounded-full border-[8px] border-emerald-400/25">
                <span className="text-3xl font-bold text-emerald-400">
                  {seoTab === "Readability" ? "82" : "86"}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold">Strong {seoTab.toLowerCase()}</p>
              <p className="mt-1 text-[9px] text-white/35">
                Guidance only, not a ranking guarantee
              </p>
            </div>
          </Card>
          <div className="space-y-2">
            {[
              [
                "Good",
                seoTab === "Readability"
                  ? "Paragraph length is easy to scan."
                  : "Focus keyword appears in the SEO title.",
              ],
              [
                "Good",
                seoTab === "Readability"
                  ? "Subheadings are distributed well."
                  : "Meta description length is optimal.",
              ],
              [
                "Needs Improvement",
                seoTab === "Readability"
                  ? "Use more transition words."
                  : "Add two internal links to related courses.",
              ],
              [
                "Error",
                seoTab === "Readability"
                  ? "Three sentences exceed 25 words."
                  : "One course image is missing alt text.",
              ],
            ].map(([status, text]) => (
              <Card key={text} className="flex items-center gap-3 p-3">
                <span
                  className={`size-2 rounded-full ${status === "Good" ? "bg-emerald-400" : status === "Error" ? "bg-red-400" : "bg-amber-300"}`}
                />
                <div>
                  <p className="text-[10px] font-bold">{status}</p>
                  <p className="text-[10px] text-white/45">{text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveClassWizard({ close }: { close: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Basic details",
    "Schedule",
    "Meeting",
    "Access",
    "Notifications",
    "Recording",
    "Review",
  ];
  return (
    <ModalShell
      title="Schedule live class"
      desc="Configure a live learning session and participant access."
      close={close}
      wide
    >
      <div className="flex max-h-[78vh] min-h-[600px] flex-col">
        <div className="flex gap-1 overflow-x-auto border-b p-4 scrollbar-none">
          {steps.map((x, i) => (
            <button
              key={x}
              onClick={() => setStep(i)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold ${step === i ? "bg-[#2bffff] text-black" : "text-white/35"}`}
            >
              {i + 1}. {x}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-5 text-xl font-bold">{steps[step]}</h3>
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Session title" value="Advanced React Patterns — Live Lab" />
                </div>
                <Field label="Associated course" value="Modern React Engineering" />
                <Field label="Module" value="Module 6 · Architecture" />
                <Field label="Instructor" value="Vikram Joshi" />
                <Field label="Session category" value="Live workshop" />
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-white/65">
                    Description
                    <textarea
                      rows={5}
                      className="mt-2 w-full rounded-xl border bg-white/[.04] p-3 text-xs"
                    />
                  </label>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" value="2025-06-18" type="date" />
                <Field label="Timezone" value="Asia/Kolkata (GMT+5:30)" />
                <Field label="Start time" value="10:30" type="time" />
                <Field label="End time" value="12:00" type="time" />
                <label className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold sm:col-span-2">
                  Recurring session
                  <input type="checkbox" />
                </label>
                <Card className="p-4 sm:col-span-2">
                  <p className="text-xs font-bold text-amber-300">No scheduling conflicts</p>
                  <p className="mt-1 text-[10px] text-white/35">
                    Instructor and course calendar are available at this time.
                  </p>
                </Card>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {["Zoom", "Google Meet", "MS Teams", "Custom link"].map((x, i) => (
                    <button
                      key={x}
                      className={`rounded-xl border p-4 text-xs font-bold ${i === 0 ? "border-[#2bffff]/50 bg-[#2bffff]/10 text-[#2bffff]" : ""}`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Meeting URL" value="https://zoom.us/j/••••••••" />
                  <Field label="Meeting ID" value="847 291 6632" />
                  <Field label="Meeting password" value="••••••••" />
                  <Field label="Connection status" value="Zoom connected" />
                </div>
                <p className="text-[10px] text-white/35">
                  Meeting integrations require a connected provider. This prototype does not create
                  external meetings.
                </p>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Session access" value="Included with course" />
                <Field label="Maximum participants" value="120" />
                <Field label="Registration deadline" value="2 hours before start" />
                <Field label="Student access rule" value="Enrolled students only" />
                {["Enable waitlist", "Track attendance"].map((x) => (
                  <label
                    key={x}
                    className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
                  >
                    {x}
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-3">
                {[
                  "Notify enrolled students",
                  "Send joining instructions",
                  "Email reminder 24 hours before",
                  "In-platform reminder 15 minutes before",
                ].map((x) => (
                  <label
                    key={x}
                    className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
                  >
                    {x}
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-3">
                {[
                  "Enable recording",
                  "Publish recording after session",
                  "Attach recording to course",
                  "Allow enrolled students to view",
                ].map((x) => (
                  <label
                    key={x}
                    className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
                  >
                    {x}
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>
            )}
            {step === 6 && (
              <Card className="p-6">
                <StatusBadge status="Scheduled" />
                <h3 className="mt-4 text-xl font-bold">Advanced React Patterns — Live Lab</h3>
                <p className="mt-2 text-xs text-white/45">
                  18 June 2025 · 10:30 AM–12:00 PM · Asia/Kolkata
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Instructor", "Vikram Joshi"],
                    ["Platform", "Zoom"],
                    ["Capacity", "120 students"],
                  ].map(([a, b]) => (
                    <div key={a} className="rounded-xl bg-white/[.03] p-3">
                      <p className="text-[9px] text-white/30">{a}</p>
                      <p className="mt-1 text-xs font-bold">{b}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
        <div className="flex justify-between border-t p-4 sm:px-7">
          <button className="text-xs font-bold text-white/45">
            <Save size={14} className="mr-2 inline" />
            Save draft
          </button>
          <div className="flex gap-2">
            <button
              disabled={step === 0}
              onClick={() => setStep((x) => x - 1)}
              className="rounded-xl border px-4 py-2 text-xs disabled:opacity-30"
            >
              Back
            </button>
            <button
              onClick={() => (step === 6 ? close() : setStep((x) => x + 1))}
              className="rounded-xl bg-[#2bffff] px-5 py-2 text-xs font-bold text-black"
            >
              {step === 6 ? "Schedule session" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function LiveClassesPage() {
  const [tab, setTab] = useState("All Sessions");
  const [wizard, setWizard] = useState(false);
  const sessions = [
    [
      "Advanced React Patterns",
      "Modern React Engineering",
      "Vikram Joshi",
      "18 Jun · 10:30 AM",
      "90 min",
      "84 / 120",
      "Scheduled",
    ],
    [
      "Usability Testing Lab",
      "Product Design Masterclass",
      "Nisha Rao",
      "Today · 1:00 PM",
      "60 min",
      "62 / 80",
      "Live",
    ],
    [
      "Dashboard Storytelling",
      "Data Analytics",
      "Arjun Nair",
      "17 Jun · 4:30 PM",
      "75 min",
      "48 / 60",
      "Completed",
    ],
    [
      "Design Critique Office Hours",
      "Product Design Masterclass",
      "Nisha Rao",
      "22 Jun · 3:00 PM",
      "45 min",
      "31 / 50",
      "Scheduled",
    ],
  ];
  return (
    <div className="page-enter space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Classes</h2>
          <p className="mt-1 text-sm text-white/45">
            Schedule sessions, manage attendance, and publish recordings.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border px-4 py-2.5 text-xs font-bold">
            <Calendar size={14} className="mr-2 inline" />
            Calendar
          </button>
          <button
            onClick={() => setWizard(true)}
            className="rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black"
          >
            <Plus size={14} className="mr-2 inline" />
            Create live class
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total classes", "248", Video],
          ["Upcoming", "18", CalendarDays],
          ["Live now", "3", Radio],
          ["Completed", "224", CheckCircle2],
          ["Participants", "18.4k", Users],
        ].map(([a, b, I]) => (
          <Card key={a as string} className="p-4">
            <I size={17} className="text-[#2bffff]" />
            <p className="mt-4 text-xl font-bold">{b as string}</p>
            <p className="text-[10px] text-white/40">{a as string}</p>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 overflow-auto">
        {["All Sessions", "Upcoming", "Live Now", "Completed", "Cancelled"].map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold ${tab === x ? "bg-[#2bffff] text-black" : "border text-white/45"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input
              placeholder="Search session, course, or instructor…"
              className="w-full rounded-xl border bg-white/[.03] py-2.5 pl-9 text-xs"
            />
          </div>
          {["Instructor", "Course", "Date", "Status"].map((x) => (
            <button key={x} className="rounded-xl border px-3 text-[10px] font-bold text-white/40">
              {x}
              <ChevronDown size={11} className="ml-2 inline" />
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-xs">
            <thead className="bg-white/[.025] text-[9px] uppercase text-white/30">
              <tr>
                <th className="px-5 py-3">Session</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Date & time</th>
                <th>Duration</th>
                <th>Participants</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s[0]} className="border-t">
                  <td className="px-5 py-4 font-bold">{s[0]}</td>
                  {s.slice(1, 6).map((x) => (
                    <td key={x} className="text-white/55">
                      {x}
                    </td>
                  ))}
                  <td>
                    <StatusBadge status={s[6]} />
                  </td>
                  <td>
                    <MoreHorizontal size={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <LiveTimeline admin />
        <Card className="p-5">
          <h3 className="font-bold">Attendance overview</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Registered", "214"],
              ["Attended", "186"],
              ["Late arrivals", "12"],
              ["Attendance", "86.9%"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-white/[.03] p-4">
                <p className="text-lg font-bold">{b}</p>
                <p className="text-[10px] text-white/35">{a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {wizard && <LiveClassWizard close={() => setWizard(false)} />}
    </div>
  );
}

function EnrolmentWizard({ close }: { close: () => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Select student", "Select product", "Configure access", "Payment", "Review"];
  return (
    <ModalShell
      title="Manual enrolment"
      desc="Grant a learner access to a course, programme, bundle, or live class."
      close={close}
    >
      <div className="max-h-[78vh] overflow-y-auto p-6">
        <div className="mb-6 flex items-center gap-2">
          {steps.map((x, i) => (
            <div key={x} className="flex flex-1 items-center gap-2">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i <= step ? "bg-[#2bffff] text-black" : "border text-white/30"}`}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
            </div>
          ))}
        </div>
        <h3 className="mb-5 text-xl font-bold">{steps[step]}</h3>
        {step === 0 && (
          <div className="space-y-3">
            <Field label="Search student" value="Aman Verma" />
            <Card className="flex items-center gap-3 border-[#2bffff]/30 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-[#2bffff]/10 text-xs font-bold text-[#2bffff]">
                AV
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">Aman Verma</p>
                <p className="text-[10px] text-white/35">aman.verma@email.com · STU-2025-0842</p>
              </div>
              <CheckCircle2 size={17} className="text-[#2bffff]" />
            </Card>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["Course", "Bundle", "Programme", "Live class"].map((x, i) => (
                <button
                  key={x}
                  className={`rounded-xl border p-3 text-[10px] font-bold ${i === 0 ? "border-[#2bffff]/40 bg-[#2bffff]/10 text-[#2bffff]" : ""}`}
                >
                  {x}
                </button>
              ))}
            </div>
            <Field label="Select product" value="Advanced Product Design Masterclass" />
            <Card className="flex items-center gap-3 p-3">
              <img src={courses[0].image} alt="" className="h-12 w-16 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-bold">{courses[0].title}</p>
                <p className="text-[10px] text-white/35">₹4,999 · Lifetime access</p>
              </div>
            </Card>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Enrolment date" type="date" value="2025-06-18" />
            <Field label="Access start date" type="date" value="2025-06-18" />
            <Field label="Access type" value="Limited access" />
            <Field label="Access expiry" type="date" value="2026-06-18" />
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {["Paid", "Free", "Complimentary", "Offline payment", "Pending payment"].map((x, i) => (
              <button
                key={x}
                className={`rounded-xl border p-4 text-left text-xs font-bold ${i === 2 ? "border-[#2bffff]/40 bg-[#2bffff]/10 text-[#2bffff]" : ""}`}
              >
                {x}
              </button>
            ))}
          </div>
        )}
        {step === 4 && (
          <Card className="p-5">
            <StatusBadge status="Pending" />
            <h4 className="mt-4 font-bold">Enrolment summary</h4>
            <div className="mt-4 space-y-3">
              {[
                ["Student", "Aman Verma"],
                ["Product", "Advanced Product Design Masterclass"],
                ["Access", "18 Jun 2025 – 18 Jun 2026"],
                ["Payment", "Complimentary"],
                ["Notification", "Email and in-platform"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between border-b pb-3 text-xs last:border-0">
                  <span className="text-white/35">{a}</span>
                  <b className="text-right">{b}</b>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div className="mt-7 flex justify-end gap-2">
          <button
            disabled={step === 0}
            onClick={() => setStep((x) => x - 1)}
            className="rounded-xl border px-4 py-2.5 text-xs disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={() => (step === 4 ? close() : setStep((x) => x + 1))}
            className="rounded-xl bg-[#2bffff] px-5 py-2.5 text-xs font-bold text-black"
          >
            {step === 4 ? "Confirm enrolment" : "Continue"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function EnrolmentsPage() {
  const [tab, setTab] = useState("All");
  const [wizard, setWizard] = useState(false);
  const rows = [
    [
      "ENR-10482",
      "Aman Verma",
      "Product Design Masterclass",
      "12 May 2025",
      "Paid",
      "75%",
      "12 May 2026",
      "Active",
    ],
    [
      "ENR-10481",
      "Priya Sharma",
      "Data Analytics Programme",
      "10 May 2025",
      "Paid",
      "88%",
      "Lifetime",
      "Active",
    ],
    [
      "ENR-10480",
      "Rohan Mehta",
      "React Engineering",
      "09 May 2025",
      "Pending",
      "12%",
      "09 Nov 2025",
      "Pending",
    ],
    [
      "ENR-10479",
      "Sneha Iyer",
      "UX Career Bundle",
      "03 May 2025",
      "Paid",
      "100%",
      "Lifetime",
      "Completed",
    ],
  ];
  return (
    <div className="page-enter space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enrolment Management</h2>
          <p className="mt-1 text-sm text-white/45">
            Manage access, payments, progress, and enrolment lifecycle.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border px-4 py-2.5 text-xs font-bold">
            <Download size={14} className="mr-2 inline" />
            Export CSV
          </button>
          <button
            onClick={() => setWizard(true)}
            className="rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black"
          >
            <Plus size={14} className="mr-2 inline" />
            Manual enrolment
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Total", "18,420"],
          ["Active", "14,286"],
          ["Pending", "184"],
          ["Completed", "3,248"],
          ["Expired", "512"],
          ["Cancelled", "190"],
        ].map(([a, b]) => (
          <Card key={a} className="p-4">
            <p className="text-xl font-bold">{b}</p>
            <p className="text-[10px] text-white/35">{a}</p>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 overflow-auto">
        {["All", "Active", "Pending", "Completed", "Expired", "Cancelled"].map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === x ? "bg-[#2bffff] text-black" : "border text-white/45"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input
              placeholder="Search student, email, product, or enrolment ID…"
              className="w-full rounded-xl border bg-white/[.03] py-2.5 pl-9 text-xs"
            />
          </div>
          {["Product", "Payment", "Date", "Expiry"].map((x) => (
            <button key={x} className="rounded-xl border px-3 text-[10px] font-bold text-white/40">
              {x}
              <ChevronDown size={11} className="ml-2 inline" />
            </button>
          ))}
          <button className="rounded-xl border px-3 text-[10px] font-bold">
            <SlidersHorizontal size={12} className="mr-2 inline" />
            Advanced
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-xs">
            <thead className="bg-white/[.025] text-[9px] uppercase text-white/30">
              <tr>
                <th className="px-5 py-3">
                  <input type="checkbox" />
                </th>
                <th>ID</th>
                <th>Student</th>
                <th>Course / programme</th>
                <th>Enrolled</th>
                <th>Payment</th>
                <th>Progress</th>
                <th>Access expiry</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-t">
                  <td className="px-5 py-4">
                    <input type="checkbox" />
                  </td>
                  <td className="font-bold text-[#2bffff]">{r[0]}</td>
                  <td>
                    <b>{r[1]}</b>
                    <p className="text-[9px] text-white/30">
                      {r[1].toLowerCase().replace(" ", ".")}@email.com
                    </p>
                  </td>
                  <td>{r[2]}</td>
                  <td className="text-white/45">{r[3]}</td>
                  <td>
                    <StatusBadge status={r[4]} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded bg-white/[.07]">
                        <div className="h-full rounded bg-[#2bffff]" style={{ width: r[5] }} />
                      </div>
                      {r[5]}
                    </div>
                  </td>
                  <td>{r[6]}</td>
                  <td>
                    <StatusBadge status={r[7]} />
                  </td>
                  <td>
                    <MoreHorizontal size={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4 text-[10px] text-white/35">
          <span>Showing 1–4 of 18,420 enrolments</span>
          <div className="flex gap-1">
            <button className="rounded-lg border px-3 py-2">Previous</button>
            <button className="rounded-lg border px-3 py-2">Next</button>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Learners needing attention</h3>
            <p className="mt-1 text-xs text-white/35">
              Inactive or falling behind based on recent progress.
            </p>
          </div>
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-300">
            124 students
          </span>
        </div>
      </Card>
      {wizard && <EnrolmentWizard close={() => setWizard(false)} />}
    </div>
  );
}

function SeoManagerPage() {
  const [section, setSection] = useState("SEO Overview");
  const sections = [
    "SEO Overview",
    "Content SEO",
    "Technical SEO",
    "Redirects",
    "Sitemap",
    "Robots.txt",
    "Schema",
    "SEO Settings",
  ];
  return (
    <div className="page-enter space-y-5">
      <PageLead
        title="SEO Manager"
        desc="Optimise public content, metadata, indexing, schema, and technical search settings."
        action="Run content audit"
        icon={Globe2}
      />
      <div className="flex gap-2 overflow-auto scrollbar-none">
        {sections.map((x) => (
          <button
            key={x}
            onClick={() => setSection(x)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold ${section === x ? "bg-[#2bffff] text-black" : "border text-white/45"}`}
          >
            {x}
          </button>
        ))}
      </div>
      {section === "SEO Overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ["Indexed pages", "284"],
              ["Missing titles", "12"],
              ["Missing descriptions", "28"],
              ["Duplicate metadata", "6"],
              ["Excluded", "18"],
              ["Warnings", "42"],
            ].map(([a, b], i) => (
              <Card key={a} className="p-4">
                <p className={`text-xl font-bold ${i > 0 && i < 5 ? "text-amber-300" : ""}`}>{b}</p>
                <p className="text-[9px] text-white/35">{a}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden">
            <div className="border-b p-5">
              <h3 className="font-bold">Content SEO</h3>
              <p className="text-xs text-white/35">
                Pages and learning content requiring optimisation.
              </p>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-white/[.025] text-[9px] uppercase text-white/30">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th>Content type</th>
                    <th>Focus keyword</th>
                    <th>SEO score</th>
                    <th>Indexing</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Product Design Masterclass",
                      "Course",
                      "product design course",
                      "86",
                      "Indexed",
                    ],
                    [
                      "Data Analytics Programme",
                      "Programme",
                      "data analytics certification",
                      "72",
                      "Indexed",
                    ],
                    ["UX Career Guide", "Article", "UX design career", "58", "Indexed"],
                    ["React Engineering", "Course", "—", "34", "No index"],
                  ].map((r) => (
                    <tr key={r[0]} className="border-t">
                      <td className="px-5 py-4 font-bold">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td className="text-white/45">{r[2]}</td>
                      <td>
                        <span
                          className={
                            Number(r[3]) > 75
                              ? "text-emerald-400"
                              : Number(r[3]) > 50
                                ? "text-amber-300"
                                : "text-red-400"
                          }
                        >
                          {r[3]}/100
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r[4]} />
                      </td>
                      <td className="text-white/35">2 days ago</td>
                      <td>
                        <Pencil size={14} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      {section === "Content SEO" && (
        <Card className="p-6">
          <SeoEditor />
        </Card>
      )}
      {section === "Redirects" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h3 className="font-bold">Redirect manager</h3>
              <p className="text-xs text-white/35">Manage permanent and temporary URL redirects.</p>
            </div>
            <button className="rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black">
              + Add redirect
            </button>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-white/[.025] text-[9px] uppercase text-white/30">
                <tr>
                  <th className="px-5 py-3">Source URL</th>
                  <th>Destination</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[
                  ["/old-product-design", "/courses/product-design", "301"],
                  ["/react-course-v1", "/courses/react-engineering", "301"],
                  ["/summer-sale", "/offers/summer", "302"],
                ].map((r) => (
                  <tr key={r[0]} className="border-t">
                    <td className="px-5 py-4 font-mono text-[#2bffff]">{r[0]}</td>
                    <td className="font-mono">{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>
                      <StatusBadge status="Active" />
                    </td>
                    <td className="text-white/35">12 May 2025</td>
                    <td>
                      <MoreHorizontal size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {section === "Sitemap" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <StatusBadge status="Active" />
            <h3 className="mt-4 text-lg font-bold">XML Sitemap</h3>
            <p className="mt-2 text-xs text-white/40">https://learnisphere.com/sitemap.xml</p>
            <div className="mt-5 space-y-3">
              {["Courses", "Programmes", "Categories", "Blog articles", "Public pages"].map((x) => (
                <label key={x} className="flex justify-between text-xs">
                  {x}
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
            <button className="mt-6 rounded-xl border px-4 py-2.5 text-xs font-bold">
              Regenerate sitemap
            </button>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-white/35">Last generated</p>
            <p className="mt-2 text-xl font-bold">18 June 2025, 8:42 AM</p>
            <p className="mt-4 text-xs text-emerald-400">284 URLs included · Valid</p>
          </Card>
        </div>
      )}
      {section === "Robots.txt" && (
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold">Robots.txt editor</h3>
              <p className="text-xs text-white/35">
                Control crawler access. Review changes carefully.
              </p>
            </div>
            <StatusBadge status="Valid" />
          </div>
          <textarea
            rows={14}
            defaultValue={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /student/\n\nSitemap: https://learnisphere.com/sitemap.xml`}
            className="mt-5 w-full rounded-xl border bg-black/40 p-4 font-mono text-xs leading-relaxed text-[#2bffff]"
          />
          <button className="mt-4 rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black">
            Save changes
          </button>
        </Card>
      )}
      {!["SEO Overview", "Content SEO", "Redirects", "Sitemap", "Robots.txt"].includes(section) && (
        <Card className="p-7">
          <h3 className="text-lg font-bold">{section}</h3>
          <p className="mt-2 text-xs text-white/40">
            Configure global {section.toLowerCase()} rules and defaults for courses, programmes,
            articles, and public pages.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Default configuration" value="LearnIsphere recommended" />
            <Field label="Content scope" value="All public content" />
            {[
              "Enable automatic checks",
              "Notify editors about issues",
              "Include structured data",
            ].map((x) => (
              <label
                key={x}
                className="flex items-center justify-between rounded-xl border p-4 text-xs font-bold"
              >
                {x}
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function DirectoryManagementPage({ page }: { page: string }) {
  const config: Record<string, [string, string, string[]]> = {
    Instructors: [
      "Instructor Management",
      "Manage teaching profiles, access, assignments, and performance.",
      ["Nisha Rao", "Arjun Nair", "Vikram Joshi", "Meera Shah"],
    ],
    Categories: [
      "Course Categories",
      "Structure and optimise the public learning catalogue.",
      ["Design", "Development", "Analytics", "Business"],
    ],
    "Course Bundles": [
      "Course Bundles",
      "Package courses with flexible pricing and access.",
      ["UX Career Bundle", "Full-stack Engineer Path", "Analytics Leadership Pack"],
    ],
    "Coupons & Discounts": [
      "Coupons & Discounts",
      "Create promotions and monitor redemption performance.",
      ["WELCOME20", "LEARN15", "TEAM25"],
    ],
    Certificates: [
      "Certificates",
      "Manage templates, eligibility, and issued credentials.",
      ["Premium Completion", "Programme Distinction", "Live Workshop"],
    ],
    "Reviews & Feedback": [
      "Reviews & Feedback",
      "Moderate learner ratings and qualitative feedback.",
      ["Product Design Masterclass", "React Engineering", "Data Analytics"],
    ],
    "Blog & Content": [
      "Blog & Content",
      "Publish articles, landing pages, and institute updates.",
      ["How to Build a Design Career", "Analytics Skills for 2025", "React Architecture Guide"],
    ],
    "Website Settings": [
      "Website Settings",
      "Control public branding, navigation, pages, and integrations.",
      ["Brand & Identity", "Navigation", "Homepage", "Integrations"],
    ],
    "Roles & Permissions": [
      "Roles & Permissions",
      "Define secure access for administrators and instructors.",
      ["Super Admin", "Course Manager", "Instructor", "Finance Manager"],
    ],
    "General Settings": [
      "General Settings",
      "Configure institute preferences, timezone, security, and defaults.",
      ["Institute Profile", "Regional Settings", "Security", "Email Delivery"],
    ],
  };
  const [title, desc, items] = config[page] || [
    page,
    `Manage ${page.toLowerCase()} across LearnIsphere.`,
    ["Configuration", "Records", "Settings"],
  ];
  return (
    <div className="page-enter space-y-5">
      <PageLead
        title={title}
        desc={desc}
        action={`Create ${page === "Categories" ? "category" : "new"}`}
        icon={Plus}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total records", String(items.length * 24)],
          ["Active", String(items.length * 19)],
          ["Needs review", String(items.length + 2)],
        ].map(([a, b]) => (
          <Card key={a} className="p-5">
            <p className="text-2xl font-bold">{b}</p>
            <p className="text-[10px] text-white/35">{a}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input
              placeholder={`Search ${page.toLowerCase()}…`}
              className="w-full rounded-xl border bg-white/[.03] py-2.5 pl-9 text-xs"
            />
          </div>
          <button className="rounded-xl border px-4 text-xs font-bold">
            <Filter size={13} className="mr-2 inline" />
            Filters
          </button>
        </div>
        <div className="divide-y">
          {items.map((x, i) => (
            <div key={x} className="flex items-center gap-4 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-[#2bffff]/10 text-xs font-bold text-[#2bffff]">
                {x.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">{x}</p>
                <p className="mt-1 text-[10px] text-white/35">
                  Updated {i + 1} day{i ? "s" : ""} ago · {12 + i * 8} linked records
                </p>
              </div>
              <StatusBadge status={i === items.length - 1 ? "Draft" : "Active"} />
              <button>
                <MoreHorizontal size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GenericAdmin({ page }: { page: string }) {
  const isLive = page === "Live Classes";
  const isPay = page === "Payments & Revenue";
  const isNotify = page === "Notifications";
  if (isLive)
    return (
      <div className="page-enter space-y-5">
        <PageLead
          title="Live classes"
          desc="Schedule sessions, monitor attendance, and manage recordings."
          action="Schedule class"
          icon={Plus}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Happening now", "3", Radio],
            ["Today's sessions", "12", CalendarDays],
            ["Attendance rate", "84.6%", Users],
          ].map(([a, b, I]) => (
            <Card key={a as string} className="p-5">
              <I size={18} className="text-indigo-600" />
              <p className="mt-5 text-2xl font-extrabold">{b as string}</p>
              <p className="text-xs text-slate-400">{a as string}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <LiveTimeline admin />
          <Card className="p-6">
            <h3 className="font-extrabold">Attendance this week</h3>
            <div className="mt-5 h-56">
              <ResponsiveContainer>
                <BarChart data={activityData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Bar dataKey="hours" fill="#2bffff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  return (
    <div className="page-enter space-y-5">
      <PageLead
        title={page}
        desc={
          isPay
            ? "Track sales, transactions, refunds, and course revenue."
            : isNotify
              ? "Reach learners with timely, targeted communication."
              : `Detailed ${page.toLowerCase()} intelligence and institute reporting.`
        }
        action={
          isNotify ? "New announcement" : page === "Reports" ? "Export report" : "Download data"
        }
        icon={isNotify ? MessageSquare : Download}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["This month", isPay ? "₹8.42L" : "12,840"],
          ["Growth", "+18.4%"],
          ["Success rate", isPay ? "96.8%" : "84.2%"],
          ["Needs attention", isPay ? "18" : "124"],
        ].map(([a, b], i) => (
          <Card key={a} className="p-5">
            <p className="text-xs text-slate-400">{a}</p>
            <p className="mt-3 text-2xl font-extrabold">{b}</p>
            <p
              className={`mt-2 text-[10px] font-bold ${i === 3 ? "text-amber-600" : "text-emerald-600"}`}
            >
              {i === 3 ? "Review recommended" : "Trending upward"}
            </p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="font-extrabold">{isPay ? "Revenue & transactions" : page + " trend"}</h3>
            <p className="mt-1 text-xs text-slate-400">Performance over the last 30 days</p>
          </div>
          <button className="rounded-lg border p-2">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="generic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2bffff" stopOpacity=".25" />
                  <stop offset="1" stopColor="#2bffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis hide />
              <Tooltip />
              <Area dataKey="current" stroke="#2bffff" fill="url(#generic)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StreakCard() {
  const days = [
    ["Mon", true],
    ["Tue", true],
    ["Wed", true],
    ["Thu", true],
    ["Fri", true],
    ["Sat", true],
    ["Sun", false],
  ] as const;
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#2bffff]/25 bg-[linear-gradient(145deg,rgba(43,255,255,.13),rgba(3,15,16,.78)_48%,rgba(255,28,247,.09))] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,.35)] backdrop-blur-[24px] sm:p-7">
      <div className="absolute -right-16 -top-20 size-64 rounded-full bg-[#2bffff]/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-400/15 text-amber-400">
              <Flame size={25} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-300">
                Current streak
              </p>
              <p className="mt-1 text-2xl font-extrabold">12-Day Learning Streak</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold sm:block">
            Personal best: 28
          </span>
        </div>
        <p className="mt-4 text-xs text-slate-300">
          You’re building an amazing learning habit. One focused lesson today keeps it alive.
        </p>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {days.map(([d, done], i) => (
            <div key={d} className="text-center">
              <p className="mb-2 text-[9px] font-bold text-slate-400">{d}</p>
              <div
                className={`mx-auto grid aspect-square max-w-10 place-items-center rounded-xl ${done ? "bg-indigo-500 text-white" : "border border-white/15 text-slate-500"}`}
              >
                {done ? (
                  <CheckCircle2 size={16} />
                ) : i === 6 ? (
                  <span className="size-1.5 rounded-full bg-slate-500" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/[.06] px-3 py-2.5">
          <span className="text-[10px] text-slate-300">
            <b className="text-white">22 minutes</b> learned today
          </span>
          <span className="text-[10px] font-bold text-amber-300">Goal: 30 min</span>
        </div>
      </div>
    </div>
  );
}

function Heatmap() {
  const cells = useMemo(
    () => Array.from({ length: 154 }, (_, i) => (i * 13 + (i % 7) * 3) % 10),
    [],
  );
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-extrabold">Learning activity</h3>
          <p className="mt-1 text-xs text-slate-400">Your consistency over the last 22 weeks</p>
        </div>
        <span className="text-xs font-bold text-indigo-600">186 active days</span>
      </div>
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="grid min-w-[600px] grid-flow-col grid-rows-7 gap-1.5">
          {cells.map((v, i) => (
            <div
              title={`${8 + v * 4} learning minutes`}
              key={i}
              className={`heat-cell size-3 rounded-[3px] transition ${v < 3 ? "bg-slate-100" : v < 5 ? "bg-indigo-200" : v < 8 ? "bg-indigo-400" : "bg-indigo-700"}`}
            />
          ))}
        </div>
        <div className="mt-3 flex min-w-[600px] justify-between text-[9px] font-semibold text-slate-400">
          <span>January</span>
          <span>February</span>
          <span>March</span>
          <span>April</span>
          <span>May</span>
        </div>
      </div>
    </Card>
  );
}

function StudentDashboard() {
  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-slate-500">Good morning, Aman 👋</p>
          <h2 className="mt-1 text-2xl font-extrabold">Ready to continue your learning journey?</h2>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white">
          <Play size={15} fill="currentColor" />
          Continue learning
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Learning hours", "48.5h", "+4.2h", Clock3],
          ["Courses enrolled", "3", "2 active", BookOpen],
          ["Lessons completed", "57", "+8 this week", CheckCircle2],
          ["Overall progress", "46%", "+6% this month", Target],
        ].map(([l, v, c, I]) => (
          <Card key={l as string} className="p-5">
            <div className="flex justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <I size={18} />
              </span>
              <ArrowUpRight size={15} className="text-slate-300" />
            </div>
            <p className="mt-5 text-[11px] font-semibold text-slate-400">{l as string}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-extrabold">{v as string}</p>
              <span className="text-[10px] font-bold text-emerald-600">{c as string}</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <StreakCard />
        <Card className="overflow-hidden">
          <div className="relative h-full min-h-[300px]">
            <img
              src={courses[0].image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold backdrop-blur">
                CONTINUE LEARNING
              </span>
              <h3 className="mt-3 text-xl font-extrabold">Product Design Masterclass</h3>
              <p className="mt-1 text-xs text-slate-300">
                Module 6 · Prototyping meaningful interactions
              </p>
              <div className="mt-4 h-1.5 rounded-full bg-white/20">
                <div className="h-full w-[72%] rounded-full bg-indigo-400" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-300">72% complete</span>
                <button className="grid size-10 place-items-center rounded-full bg-white text-indigo-700">
                  <Play size={15} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Heatmap />
        <LiveTimeline />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold">Weekly learning time</h3>
              <p className="mt-1 text-xs text-slate-400">17.6 hours this week</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
              +12%
            </span>
          </div>
          <div className="mt-5 h-52">
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="hours" fill="#2bffff" radius={[7, 7, 7, 7]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <h3 className="font-extrabold">Next milestone</h3>
              <p className="mt-1 text-xs text-slate-400">15-day streak badge</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
              <Trophy size={19} />
            </span>
          </div>
          <div className="mx-auto my-6 grid size-28 place-items-center rounded-full border-[9px] border-indigo-100 text-center">
            <div>
              <b className="text-2xl text-indigo-700">12</b>
              <p className="text-[9px] text-slate-400">of 15 days</p>
            </div>
          </div>
          <p className="text-center text-xs font-semibold text-slate-500">
            Just 3 more days. Keep showing up!
          </p>
        </Card>
      </div>
    </div>
  );
}

function Achievements() {
  const badges: [string, IconType, boolean][] = [
    ["7-day streak", Flame, true],
    ["First course", Award, true],
    ["Perfect quiz", Target, true],
    ["30-day streak", Zap, false],
    ["100 lessons", BookOpen, false],
    ["Live champion", Radio, false],
  ];
  return (
    <div className="page-enter space-y-5">
      <PageLead
        title="Achievements"
        desc="Every milestone reflects the work you’ve put in."
        action="View leaderboard"
        icon={Trophy}
      />
      <Card className="overflow-hidden bg-[rgba(5,18,19,.86)] p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
          Learning level 8
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-3xl font-extrabold">Focused Explorer</h3>
            <p className="mt-2 text-sm text-slate-400">
              2,840 total learning points · Top 8% of learners
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-extrabold">#42</p>
            <p className="text-[10px] text-slate-400">Institute rank</p>
          </div>
        </div>
        <div className="mt-6 h-2 rounded-full bg-white/10">
          <div className="h-full w-[68%] rounded-full bg-indigo-400" />
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map(([name, I, earned]) => (
          <Card key={name as string} className={`p-6 ${!earned ? "opacity-55 grayscale" : ""}`}>
            <span
              className={`grid size-12 place-items-center rounded-2xl ${earned ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"}`}
            >
              <I size={22} />
            </span>
            <h3 className="mt-5 font-extrabold">{name as string}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {earned ? "Earned May 2025" : "Keep learning to unlock"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentModal({ name, close }: { name: string; close: () => void }) {
  const s = students.find((x) => x.name === name) || students[0];
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-[92vh] w-full overflow-y-auto border-l border-[#2bffff]/15 bg-[rgba(3,14,15,.96)] p-6 shadow-2xl backdrop-blur-2xl sm:max-w-lg sm:rounded-l-3xl"
      >
        <div className="flex justify-between">
          <span
            className={`grid size-14 place-items-center rounded-2xl text-sm font-bold ${s.color}`}
          >
            {s.initials}
          </span>
          <button onClick={close} className="grid size-9 place-items-center rounded-xl border">
            <X size={18} />
          </button>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold">{s.name}</h2>
        <p className="text-sm text-slate-400">STU-2025-0842 · Student since Jan 2024</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Progress", `${s.progress}%`],
            ["Streak", `${s.streak} days`],
            ["Spent", s.spend],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] uppercase text-slate-400">{a}</p>
              <p className="mt-1 text-sm font-extrabold">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 border-b">
          <div className="flex gap-6">
            <button className="border-b-2 border-indigo-600 pb-3 text-xs font-bold text-indigo-600">
              Learning
            </button>
            <button className="pb-3 text-xs font-bold text-slate-400">Purchases</button>
            <button className="pb-3 text-xs font-bold text-slate-400">Activity</button>
          </div>
        </div>
        <h3 className="mt-6 font-extrabold">Course progress</h3>
        <div className="mt-4 space-y-4">
          {courses.slice(0, s.courses).map((c, i) => (
            <div key={c.title} className="rounded-xl border p-4">
              <div className="flex justify-between">
                <p className="text-xs font-bold">{c.title}</p>
                <span className="text-xs font-bold">{Math.max(c.progress - i * 8, 10)}%</span>
              </div>
              <div className="mt-3 h-1.5 rounded bg-slate-100">
                <div
                  className="h-full rounded bg-indigo-600"
                  style={{ width: `${Math.max(c.progress - i * 8, 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <h3 className="mt-7 font-extrabold">Recent activity</h3>
        <div className="mt-4 space-y-4">
          {[
            ["Completed “Design Systems”", "Today, 9:42 AM", CheckCircle2],
            ["Attended live class", "Yesterday, 4:30 PM", Video],
            ["Scored 92% in quiz", "May 22, 2:18 PM", Target],
          ].map(([a, b, I]) => (
            <div key={a as string} className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <I size={16} />
              </span>
              <div>
                <p className="text-xs font-bold">{a as string}</p>
                <p className="text-[10px] text-slate-400">{b as string}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white">
            <Mail size={15} />
            Send message
          </button>
          <button className="grid size-11 place-items-center rounded-xl border">
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ role }: { role: Role }) {
  const [active, setActive] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const navigate = (page: string) => {
    setActive(page);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  let content: React.ReactNode;
  if (role === "admin") {
    if (active === "Overview") content = <AdminOverview openStudent={setProfile} />;
    else if (active === "Students") content = <StudentsPage openStudent={setProfile} />;
    else if (active === "Courses") content = <CoursesPage />;
    else if (isCommerceSection(active)) content = <CommerceManager section={active} />;
    else if (active === "Live Classes") content = <LiveClassesPage />;
    else if (active === "SEO Manager") content = <SeoManagerPage />;
    else if (
      [
        "Instructors",
        "Categories",
        "Course Bundles",
        "Coupons & Discounts",
        "Certificates",
        "Reviews & Feedback",
        "Blog & Content",
        "Website Settings",
        "Roles & Permissions",
        "General Settings",
      ].includes(active)
    )
      content = <DirectoryManagementPage page={active} />;
    else content = <GenericAdmin page={active} />;
  } else {
    if (active === "My Dashboard") content = <StudentDashboard />;
    else if (active === "My Courses") content = <CommerceMyCourses />;
    else if (active === "Achievements") content = <Achievements />;
    else if (active === "Live Classes") content = <StudentLiveClasses />;
    else content = <GenericAdmin page={active} />;
  }
  return (
    <div className="neo-theme min-h-screen">
      <Sidebar
        role={role}
        active={active}
        onChange={navigate}
        open={menu}
        close={() => setMenu(false)}
      />
      <div className="lg:pl-[262px]">
        <Header role={role} title={active} menu={() => setMenu(true)} />
        <main key={`${role}-${active}`} className="mobile-safe mx-auto max-w-[1600px] p-4 sm:p-7">
          {content}
        </main>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl border border-white/10 bg-[rgba(3,15,16,.9)] p-2 shadow-xl backdrop-blur-2xl lg:hidden">
        {(role === "admin" ? adminNav.slice(0, 4) : studentNav.slice(0, 4)).map(([n, I]) => (
          <button
            onClick={() => navigate(n)}
            key={n}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] font-bold ${active === n ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}
          >
            <I size={18} />
            <span className="max-w-16 truncate">{n}</span>
          </button>
        ))}
      </nav>
      {profile && <StudentModal name={profile} close={() => setProfile(null)} />}
    </div>
  );
}
