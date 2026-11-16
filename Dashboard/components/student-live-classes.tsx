"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorPlay,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type SessionStatus = "upcoming" | "live" | "past" | "cancelled";
type AttendanceStatus = "Present" | "Absent" | "Late" | "Partial Attendance";
type LiveSession = {
  id: string;
  title: string;
  course: string;
  instructor: string;
  instructorRole: string;
  initials: string;
  start: Date;
  duration: number;
  type: string;
  status: SessionStatus;
  participants: number;
  attendance: AttendanceStatus;
  recording: "available" | "unavailable" | "none";
  description: string;
};
type TabName = "Upcoming" | "Live Now" | "Past Classes" | "Recordings" | "My Attendance";
type ScreenName =
  | "browse"
  | "calendar"
  | "details"
  | "lobby"
  | "connecting"
  | "live"
  | "summary"
  | "player"
  | "attendance-detail";
type ModalName = "reminder" | "calendar-add" | "leave" | "notifications" | null;
type PanelName = "Chat" | "Participants" | "Session info";

const tabs: TabName[] = ["Upcoming", "Live Now", "Past Classes", "Recordings", "My Attendance"];

function createSampleSessions(now: Date): LiveSession[] {
  const atDay = (offset: number, hour: number, minute: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  const startsSoon = new Date(now.getTime() + 10 * 60 * 1000);
  return [
    {
      id: "react-patterns",
      title: "Advanced React Patterns",
      course: "Modern React Engineering",
      instructor: "Vikram Joshi",
      instructorRole: "Senior Frontend Engineer",
      initials: "VJ",
      start: startsSoon,
      duration: 90,
      type: "Workshop",
      status: "upcoming",
      participants: 84,
      attendance: "Present",
      recording: "none",
      description:
        "Explore composable component APIs, state colocation, and patterns for building resilient React interfaces.",
    },
    {
      id: "usability-lab",
      title: "Usability Testing Lab",
      course: "Product Design Masterclass",
      instructor: "Nisha Rao",
      instructorRole: "Product Design Lead",
      initials: "NR",
      start: atDay(1, 13, 0),
      duration: 60,
      type: "Interactive lab",
      status: "upcoming",
      participants: 62,
      attendance: "Present",
      recording: "none",
      description:
        "Practice running moderated usability sessions and turning observed behavior into clear product insights.",
    },
    {
      id: "storytelling",
      title: "Dashboard Storytelling",
      course: "Data Analytics & Storytelling",
      instructor: "Arjun Nair",
      instructorRole: "Analytics Educator",
      initials: "AN",
      start: atDay(3, 16, 30),
      duration: 75,
      type: "Lecture",
      status: "upcoming",
      participants: 48,
      attendance: "Present",
      recording: "none",
      description:
        "Learn to structure analytical dashboards so that data leads to a clear and actionable narrative.",
    },
    {
      id: "design-office-hours",
      title: "Design Critique Office Hours",
      course: "Product Design Masterclass",
      instructor: "Nisha Rao",
      instructorRole: "Product Design Lead",
      initials: "NR",
      start: atDay(4, 15, 0),
      duration: 45,
      type: "Q&A",
      status: "cancelled",
      participants: 31,
      attendance: "Absent",
      recording: "none",
      description:
        "Bring your latest design work for a focused, supportive critique with the instructor.",
    },
    {
      id: "live-design-systems",
      title: "Building Accessible Design Systems",
      course: "Product Design Masterclass",
      instructor: "Nisha Rao",
      instructorRole: "Product Design Lead",
      initials: "NR",
      start: new Date(now.getTime() - 20 * 60 * 1000),
      duration: 75,
      type: "Workshop",
      status: "live",
      participants: 56,
      attendance: "Present",
      recording: "none",
      description:
        "A live walkthrough of accessible components, design tokens, and inclusive documentation.",
    },
    {
      id: "research-foundations",
      title: "Research Foundations: Ask Better Questions",
      course: "Product Design Masterclass",
      instructor: "Nisha Rao",
      instructorRole: "Product Design Lead",
      initials: "NR",
      start: atDay(-2, 11, 0),
      duration: 60,
      type: "Lecture",
      status: "past",
      participants: 71,
      attendance: "Present",
      recording: "available",
      description:
        "A practical introduction to research planning, interview guides, and reducing leading questions.",
    },
    {
      id: "analytics-clinic",
      title: "Analytics Q&A Clinic",
      course: "Data Analytics & Storytelling",
      instructor: "Arjun Nair",
      instructorRole: "Analytics Educator",
      initials: "AN",
      start: atDay(-5, 14, 30),
      duration: 45,
      type: "Q&A",
      status: "past",
      participants: 39,
      attendance: "Partial Attendance",
      recording: "available",
      description:
        "Bring your questions about metrics, visualization choices, and communicating analytical findings.",
    },
    {
      id: "react-testing",
      title: "Testing React Applications",
      course: "Modern React Engineering",
      instructor: "Vikram Joshi",
      instructorRole: "Senior Frontend Engineer",
      initials: "VJ",
      start: atDay(-8, 10, 0),
      duration: 90,
      type: "Workshop",
      status: "past",
      participants: 88,
      attendance: "Absent",
      recording: "unavailable",
      description:
        "An applied session on component tests, user-centric assertions, and dependable test suites.",
    },
    {
      id: "portfolio-review",
      title: "Portfolio Review: First Impressions",
      course: "Product Design Masterclass",
      instructor: "Nisha Rao",
      instructorRole: "Product Design Lead",
      initials: "NR",
      start: atDay(-11, 12, 0),
      duration: 60,
      type: "Interactive lab",
      status: "past",
      participants: 52,
      attendance: "Late",
      recording: "available",
      description:
        "A guided portfolio review focused on telling a clear story about your design decisions.",
    },
  ];
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function getEndTime(session: LiveSession) {
  return new Date(session.start.getTime() + session.duration * 60_000);
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass-card rounded-[22px] border p-5 ${className}`}>{children}</section>;
}

function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "cyan" | "red" | "green" | "amber" }) {
  const tones = {
    neutral: "border-white/10 bg-white/[.04] text-white/55",
    cyan: "border-[#2bffff]/20 bg-[#2bffff]/10 text-[#2bffff]",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function InstructorAvatar({ name, initials, size = "size-9" }: { name: string; initials: string; size?: string }) {
  return (
    <div
      title={name}
      className={`grid ${size} shrink-0 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-[#2bffff]/25 to-fuchsia-400/20 text-[10px] font-bold text-white`}
    >
      {initials}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  secondary = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${secondary ? "border border-white/10 bg-white/[.03] text-white/75 hover:bg-white/[.07]" : "bg-[#2bffff] text-[#001010] hover:bg-[#7affff]"} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export default function StudentLiveClasses() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabName>("Upcoming");
  const [screen, setScreen] = useState<ScreenName>("browse");
  const [returnTo, setReturnTo] = useState<ScreenName>("browse");
  const [selected, setSelected] = useState<LiveSession | null>(null);
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [reminderChoice, setReminderChoice] = useState("15 minutes before");
  const [customReminder, setCustomReminder] = useState("30");
  const [emailReminder, setEmailReminder] = useState(true);
  const [inAppReminder, setInAppReminder] = useState(true);
  const [reminders, setReminders] = useState<string[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<string[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Agenda">("Month");
  const [calendarCourse, setCalendarCourse] = useState("");
  const [calendarStatus, setCalendarStatus] = useState("");
  const [meetingPanel, setMeetingPanel] = useState<PanelName>("Participants");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { name: "Nisha Rao", initials: "NR", text: "Welcome! We’ll get started in just a moment.", time: "Now" },
    { name: "Aman Verma", initials: "AV", text: "Excited to be here.", time: "Now" },
  ]);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [micTested, setMicTested] = useState(false);
  const [cameraTested, setCameraTested] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1×");
  const [attendanceDetail, setAttendanceDetail] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessions(createSampleSessions(new Date()));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen !== "connecting") return;
    const timer = window.setTimeout(() => setScreen("live"), 800);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const upcomingSessions = sessions.filter((session) => session.status === "upcoming" || session.status === "cancelled");
  const liveSessions = sessions.filter((session) => session.status === "live");
  const pastSessions = sessions.filter((session) => session.status === "past");
  const recordingSessions = pastSessions.filter((session) => session.recording !== "none");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cutoff = new Date();
    if (dateFilter === "This week") cutoff.setDate(cutoff.getDate() + 7);
    if (dateFilter === "This month") cutoff.setMonth(cutoff.getMonth() + 1);
    return sessions.filter((session) => {
      const matchesQuery =
        !query ||
        [session.title, session.course, session.instructor].some((value) => value.toLowerCase().includes(query));
      const matchesCourse = !courseFilter || session.course === courseFilter;
      const matchesInstructor = !instructorFilter || session.instructor === instructorFilter;
      const matchesStatus = !statusFilter || session.status === statusFilter;
      const matchesAttendance =
        !attendanceFilter ||
        (tab !== "Past Classes" && tab !== "My Attendance") ||
        session.attendance === attendanceFilter;
      const matchesType = !typeFilter || session.type === typeFilter;
      const matchesDate =
        !dateFilter ||
        (dateFilter === "This week"
          ? session.start >= new Date() && session.start <= cutoff
          : session.start.getMonth() === new Date().getMonth() &&
            session.start.getFullYear() === new Date().getFullYear());
      return matchesQuery && matchesCourse && matchesInstructor && matchesStatus && matchesAttendance && matchesType && matchesDate;
    });
  }, [sessions, search, courseFilter, instructorFilter, statusFilter, attendanceFilter, typeFilter, dateFilter, tab]);

  const counts: Record<TabName, number> = {
    Upcoming: upcomingSessions.length,
    "Live Now": liveSessions.length,
    "Past Classes": pastSessions.length,
    Recordings: recordingSessions.length,
    "My Attendance": pastSessions.length,
  };

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setInstructorFilter("");
    setStatusFilter("");
    setAttendanceFilter("");
    setTypeFilter("");
    setDateFilter("");
  };

  const openDetails = (session: LiveSession, from: ScreenName = "browse") => {
    setSelected(session);
    setReturnTo(from);
    setScreen("details");
  };

  const openReminder = (session: LiveSession) => {
    setSelected(session);
    setModal("reminder");
  };

  const joinSession = (session: LiveSession) => {
    if (session.status === "cancelled" || session.status === "past") return;
    setSelected(session);
    setMicOn(false);
    setCameraOn(false);
    setScreen("lobby");
  };

  const canJoin = (session: LiveSession) => {
    if (session.status === "live") return true;
    if (session.status !== "upcoming") return false;
    const now = Date.now();
    return now >= session.start.getTime() - 15 * 60_000 && now <= getEndTime(session).getTime();
  };

  const addReminder = () => {
    if (!selected) return;
    setReminders((current) => [...new Set([...current, selected.id])]);
    setModal(null);
    setToast(`Reminder saved for ${selected.title}`);
  };

  const addCalendarEvent = () => {
    if (!selected) return;
    setCalendarEvents((current) => [...new Set([...current, selected.id])]);
    setModal(null);
    setToast("Session added to your calendar");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessages((current) => [...current, { name: "Aman Verma", initials: "AV", text, time: "Now" }]);
    setMessage("");
  };

  const goBack = () => setScreen(returnTo);
  const moveCalendar = (amount: number) =>
    setCalendarDate((current) =>
      calendarView === "Week"
        ? new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount * 7)
        : new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  const filteredSessionsForTab = (name: TabName) => {
    const filteredIds = new Set(filtered.map((session) => session.id));
    const source =
      name === "Upcoming"
        ? upcomingSessions
        : name === "Live Now"
          ? liveSessions
          : name === "Past Classes" || name === "My Attendance"
            ? pastSessions
            : recordingSessions;
    return source.filter((session) => filteredIds.has(session.id));
  };

  const renderSessionCard = (session: LiveSession, kind: "upcoming" | "live" | "past" | "recording") => {
    const joinAvailable = canJoin(session);
    const isCancelled = session.status === "cancelled";
    return (
      <article key={session.id} className="glass-card overflow-hidden rounded-[22px] border border-white/10">
        <button
          type="button"
          onClick={() => openDetails(session)}
          className="group relative block h-36 w-full overflow-hidden bg-gradient-to-br from-[#063234] via-[#10292b] to-[#311e3c] text-left"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(43,255,255,.25),transparent_35%)]" />
          <div className="absolute -right-6 -top-10 size-44 rounded-full border border-white/10" />
          <div className="absolute -right-1 top-4 size-28 rounded-full border border-[#2bffff]/20" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <Tag tone={session.status === "live" ? "red" : isCancelled ? "amber" : "cyan"}>
              {session.status === "live" ? (
                <>
                  <span className="size-1.5 animate-pulse rounded-full bg-red-300" /> LIVE NOW
                </>
              ) : isCancelled ? (
                "CANCELLED"
              ) : (
                session.type
              )}
            </Tag>
            <span className="grid size-9 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition group-hover:bg-[#2bffff] group-hover:text-black">
              <Play size={15} fill="currentColor" />
            </span>
          </div>
        </button>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => openDetails(session)}
                className="text-left font-bold leading-snug hover:text-[#2bffff]"
              >
                {session.title}
              </button>
              <p className="mt-1 text-[11px] text-white/45">{session.course}</p>
            </div>
            <button
              type="button"
              onClick={() => openDetails(session)}
              aria-label={`More details for ${session.title}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <InstructorAvatar name={session.instructor} initials={session.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold">{session.instructor}</p>
              <p className="truncate text-[10px] text-white/40">{session.instructorRole}</p>
            </div>
            <span className="text-[10px] text-white/40">
              {kind === "live" ? `${session.participants} here` : `${session.duration} min`}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-2 border-t border-white/[.07] pt-3">
            <div>
              <p className="text-[11px] font-bold">{formatDate(session.start)}</p>
              <p className="mt-0.5 text-[10px] text-white/45">
                {formatTime(session.start)} · {session.duration} min · Local time
              </p>
            </div>
            {kind === "past" || kind === "recording" ? (
              <Tag tone={session.attendance === "Absent" ? "amber" : "green"}>{session.attendance}</Tag>
            ) : session.status === "live" ? (
              <Tag tone="red">LIVE</Tag>
            ) : isCancelled ? (
              <Tag tone="amber">Cancelled</Tag>
            ) : reminders.includes(session.id) ? (
              <Tag tone="cyan">
                <Bell size={11} /> Reminder set
              </Tag>
            ) : (
              <span className="text-[10px] font-semibold text-[#2bffff]">
                {canJoin(session) ? "Join window open" : "Join opens 15 min before"}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {kind === "upcoming" || kind === "live" ? (
              <>
                <ActionButton
                  onClick={() => joinSession(session)}
                  disabled={!joinAvailable}
                  className="min-w-36 flex-1"
                >
                  {isCancelled
                    ? "Session Cancelled"
                    : session.status === "live"
                      ? "Join Live Now"
                      : joinAvailable
                        ? "Join Class"
                        : "Join Available Soon"}
                </ActionButton>
                <button
                  type="button"
                  onClick={() => openReminder(session)}
                  aria-label={`Set reminder for ${session.title}`}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/65 hover:bg-white/[.05]"
                >
                  <Bell size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(session);
                    setModal("calendar-add");
                  }}
                  aria-label={`Add ${session.title} to calendar`}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/65 hover:bg-white/[.05]"
                >
                  <CalendarDays size={15} />
                </button>
              </>
            ) : kind === "recording" ? (
              <>
                {session.recording === "available" ? (
                  <>
                    <ActionButton
                      onClick={() => {
                        setSelected(session);
                        setIsPlaying(false);
                        setScreen("player");
                      }}
                      className="flex-1"
                    >
                      <Play size={14} fill="currentColor" /> Watch Recording
                    </ActionButton>
                    <ActionButton
                      secondary
                      onClick={() => {
                        setSelected(session);
                        setIsPlaying(true);
                        setScreen("player");
                      }}
                    >
                      Continue Watching
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton onClick={() => openDetails(session)} disabled className="flex-1">
                    Recording Unavailable
                  </ActionButton>
                )}
                <ActionButton onClick={() => openDetails(session)} secondary>
                  Details
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton onClick={() => openDetails(session)} secondary className="flex-1">
                  View Details
                </ActionButton>
                {session.recording === "available" && (
                  <ActionButton
                    onClick={() => {
                      setSelected(session);
                      setScreen("player");
                    }}
                  >
                    <Play size={13} fill="currentColor" /> Watch
                  </ActionButton>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelected(session);
                    setAttendanceDetail(true);
                    setScreen("attendance-detail");
                  }}
                  className="rounded-xl border border-white/10 px-3 text-[10px] font-bold text-white/65 hover:bg-white/[.05]"
                >
                  Attendance
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderEmpty = (title: string, desc: string, action?: () => void, actionLabel?: string) => (
    <Panel className="grid min-h-64 place-items-center border-dashed text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#2bffff]/15 bg-[#2bffff]/[.07] text-[#2bffff]">
          <Video size={22} />
        </span>
        <h3 className="mt-4 text-base font-bold">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-white/45">{desc}</p>
        {action && actionLabel && (
          <ActionButton onClick={action} className="mt-5">
            {actionLabel}
          </ActionButton>
        )}
      </div>
    </Panel>
  );

  const renderBrowse = () => {
    const selectedTabSessions = filteredSessionsForTab(tab);
    return (
      <>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl border border-[#2bffff]/15 bg-[#2bffff]/[.07] text-[#2bffff]">
                <Video size={17} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2bffff]/70">Student portal</p>
            </div>
            <h2 className="mt-3 text-3xl font-bold">Live Classes</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              Join your live learning sessions, connect with instructors, and revisit recorded classes.
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton secondary onClick={() => setModal("notifications")} className="relative">
              <Bell size={15} /> Notifications
              <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#2bffff]" />
            </ActionButton>
            <ActionButton onClick={() => setScreen("calendar")}>
              <CalendarDays size={15} /> View Calendar
            </ActionButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Upcoming sessions", String(upcomingSessions.filter((item) => item.status === "upcoming").length), "Your next learning moments", CalendarDays, "cyan"],
            ["Live now", String(liveSessions.length), "Join a session in progress", Radio, "red"],
            ["Classes attended", String(pastSessions.filter((item) => item.attendance !== "Absent").length), "Across your enrolled courses", CheckCircle2, "green"],
            ["Available recordings", String(recordingSessions.filter((item) => item.recording === "available").length), "Ready when you are", MonitorPlay, "amber"],
          ].map(([label, value, note, Icon, tone]) => (
            <Panel key={label as string} className="p-4">
              <div className="flex items-center justify-between">
                <span
                  className={`grid size-9 place-items-center rounded-xl ${
                    tone === "red"
                      ? "bg-red-400/10 text-red-300"
                      : tone === "green"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : tone === "amber"
                          ? "bg-amber-400/10 text-amber-300"
                          : "bg-[#2bffff]/10 text-[#2bffff]"
                  }`}
                >
                  <Icon size={17} />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">Your learning</span>
              </div>
              <p className="mt-4 text-2xl font-bold">{value as string}</p>
              <p className="mt-0.5 text-xs font-semibold">{label as string}</p>
              <p className="mt-1 text-[10px] text-white/40">{note as string}</p>
            </Panel>
          ))}
        </div>

        <div className="border-b border-white/10">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
                  tab === name
                    ? "border-[#2bffff] text-[#2bffff]"
                    : "border-transparent text-white/45 hover:text-white/80"
                }`}
              >
                {name}
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === name ? "bg-[#2bffff]/10" : "bg-white/[.06]"}`}>
                  {counts[name]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Panel className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search size={15} className="absolute left-3 top-3 text-white/35" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search live classes, courses or instructors..."
                className="w-full rounded-xl border border-white/10 bg-white/[.03] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-white/30 focus:border-[#2bffff]/40"
              />
            </label>
            {[
              {
                value: courseFilter,
                set: setCourseFilter,
                label: "All courses",
                options: [...new Set(sessions.map((session) => session.course))],
              },
              {
                value: instructorFilter,
                set: setInstructorFilter,
                label: "All instructors",
                options: [...new Set(sessions.map((session) => session.instructor))],
              },
              {
                value: dateFilter,
                set: setDateFilter,
                label: "Any date",
                options: ["This week", "This month"],
              },
              {
                value: statusFilter,
                set: setStatusFilter,
                label: "Any status",
                options: ["upcoming", "live", "past", "cancelled"],
              },
              {
                value: typeFilter,
                set: setTypeFilter,
                label: "Any type",
                options: [...new Set(sessions.map((session) => session.type))],
              },
              ...(tab === "Past Classes" || tab === "My Attendance"
                ? [
                    {
                      value: attendanceFilter,
                      set: setAttendanceFilter,
                      label: "Any attendance",
                      options: ["Present", "Absent", "Late", "Partial Attendance"],
                    },
                  ]
                : []),
            ].map((filter) => (
              <label key={filter.label} className="relative min-w-32">
                <Filter size={12} className="pointer-events-none absolute left-2.5 top-3 text-white/30" />
                <select
                  value={filter.value}
                  onChange={(event) => filter.set(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#071314] py-2.5 pl-7 pr-6 text-[10px] text-white/65 outline-none focus:border-[#2bffff]/40"
                  aria-label={filter.label}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-3 text-white/30" />
              </label>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold text-white/50 hover:bg-white/[.04]"
            >
              Clear filters
            </button>
          </div>
        </Panel>

        {loading ? (
          <Panel className="grid min-h-64 place-items-center text-center">
            <div>
              <span className="mx-auto grid size-10 animate-pulse place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]">
                <Video size={18} />
              </span>
              <p className="mt-3 text-sm font-bold">Loading your sessions...</p>
              <p className="mt-1 text-xs text-white/40">Getting your live class schedule ready.</p>
            </div>
          </Panel>
        ) : tab === "My Attendance" ? (
          renderAttendance(filteredSessionsForTab("My Attendance"))
        ) : tab === "Recordings" ? (
          selectedTabSessions.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedTabSessions.map((session) => renderSessionCard(session, "recording"))}
            </div>
          ) : (
            renderEmpty("No recordings yet", "Recordings from your completed classes will appear here.")
          )
        ) : tab === "Live Now" ? (
          selectedTabSessions.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {selectedTabSessions.map((session) => renderSessionCard(session, "live"))}
            </div>
          ) : (
            renderEmpty(
              "No live classes at the moment.",
              "Your upcoming live sessions will appear here.",
              () => setTab("Upcoming"),
              "View Upcoming Sessions",
            )
          )
        ) : tab === "Past Classes" ? (
          selectedTabSessions.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedTabSessions.map((session) => renderSessionCard(session, "past"))}
            </div>
          ) : (
            renderEmpty("No past classes found", "Try adjusting your filters to see completed sessions.")
          )
        ) : selectedTabSessions.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedTabSessions.map((session) => renderSessionCard(session, session.status === "live" ? "live" : "upcoming"))}
          </div>
        ) : (
          renderEmpty("No sessions match your filters", "Clear or adjust your filters to see your upcoming sessions.", clearFilters, "Clear Filters")
        )}
      </>
    );
  };

  const renderAttendance = (items: LiveSession[]) => {
    const total = pastSessions.length;
    const attended = pastSessions.filter((session) => session.attendance !== "Absent").length;
    const attendanceRate = total ? Math.round((attended / total) * 100) : 0;
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([
            ["Total sessions", total, Video],
            ["Attended", attended, CheckCircle2],
            ["Missed", pastSessions.filter((session) => session.attendance === "Absent").length, Clock3],
            ["Attendance rate", `${attendanceRate}%`, ShieldCheck],
          ] as const).map(([label, value, Icon]) => (
            <Panel key={label as string} className="p-4">
              <Icon size={17} className="text-[#2bffff]" />
              <p className="mt-3 text-2xl font-bold">{value as string | number}</p>
              <p className="mt-1 text-[11px] text-white/45">{label as string}</p>
            </Panel>
          ))}
        </div>
        <Panel>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">Attendance trends</h3>
              <p className="mt-1 text-[11px] text-white/40">Your recent class participation</p>
            </div>
            <Tag tone="cyan">{attendanceRate}% average</Tag>
          </div>
          <div className="mt-6 flex h-36 items-end gap-3 border-b border-white/10 pb-2 sm:gap-6">
            {pastSessions.map((session) => {
              const height = session.attendance === "Absent" ? 24 : session.attendance === "Partial Attendance" ? 58 : 94;
              return (
                <div key={session.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[9px] text-white/40">{height}%</span>
                  <div
                    className={`w-full max-w-12 rounded-t-lg ${height < 40 ? "bg-amber-400/60" : "bg-gradient-to-t from-[#087f7f] to-[#2bffff]"}`}
                    style={{ height: `${height}%` }}
                    title={`${session.title}: ${session.attendance}`}
                  />
                  <span className="w-full truncate text-center text-[9px] text-white/35">{formatDate(session.start, { weekday: undefined, month: "short", day: "numeric" })}</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <h3 className="font-bold">Attendance history</h3>
              <p className="mt-1 text-[10px] text-white/40">Select a class to review attendance details.</p>
            </div>
            <Download size={15} className="text-white/40" />
          </div>
          {items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-white/[.025] text-[9px] uppercase tracking-wider text-white/35">
                  <tr>
                    <th className="px-4 py-3">Session</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => {
                        setSelected(session);
                        setAttendanceDetail(true);
                        setScreen("attendance-detail");
                      }}
                      className="cursor-pointer border-t border-white/[.07] hover:bg-white/[.03]"
                    >
                      <td className="px-4 py-3 font-bold">{session.title}</td>
                      <td className="text-white/50">{session.course}</td>
                      <td className="text-white/50">{session.instructor}</td>
                      <td className="text-white/50">{formatDate(session.start)}</td>
                      <td className="text-white/50">{session.duration} min</td>
                      <td>
                        <Tag tone={session.attendance === "Absent" ? "amber" : "green"}>{session.attendance}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-center text-xs text-white/45">No attendance records match your filters.</p>
          )}
        </Panel>
      </div>
    );
  };

  const renderCalendar = () => {
    const calendarSessions = filtered.filter((session) => !calendarCourse || session.course === calendarCourse);
    const events = [
      ...calendarSessions.map((session) => ({
        id: session.id,
        title: session.title,
        date: session.start,
        session,
        type: session.status === "live" ? "Live class" : session.status === "past" ? "Past session" : "Upcoming",
      })),
      ...(calendarSessions.find((session) => session.id === "react-patterns")
        ? [
            {
              id: "react-deadline",
              title: "React practice submission due",
              date: new Date(calendarSessions.find((session) => session.id === "react-patterns")!.start.getTime() + 24 * 60 * 60_000),
              session: calendarSessions.find((session) => session.id === "react-patterns")!,
              type: "Course deadline",
            },
          ]
        : []),
    ].filter((event) => {
      if (!calendarStatus) return true;
      if (calendarStatus === "Classes") return event.type !== "Course deadline";
      if (calendarStatus === "Deadlines") return event.type === "Course deadline";
      return event.type === calendarStatus;
    });
    const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
    const weekStart = new Date(calendarDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
    const visibleDays = calendarView === "Week" ? weekDays : calendarView === "Month" ? days : [];
    const eventsForDay = (date: Date) =>
      events.filter(
        (event) =>
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate(),
      );
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setScreen("browse")} className="grid size-9 place-items-center rounded-xl border border-white/10 hover:bg-white/[.05]" aria-label="Back to live classes">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]/70">Your schedule</p>
              <h2 className="mt-1 text-2xl font-bold">Live Class Calendar</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <ActionButton secondary onClick={() => setCalendarDate(new Date())}>Today</ActionButton>
            <ActionButton secondary onClick={() => moveCalendar(-1)}><ChevronLeft size={15} /> Previous</ActionButton>
            <ActionButton secondary onClick={() => moveCalendar(1)}>Next <ChevronRight size={15} /></ActionButton>
          </div>
        </div>
        <Panel className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2">
            {(["Month", "Week", "Agenda"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalendarView(view)}
                className={`rounded-lg px-3 py-2 text-[10px] font-bold ${calendarView === view ? "bg-[#2bffff] text-black" : "text-white/50 hover:bg-white/[.05]"}`}
              >
                {view}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={calendarCourse} onChange={(event) => setCalendarCourse(event.target.value)} className="rounded-lg border border-white/10 bg-[#071314] px-3 py-2 text-[10px] text-white/60">
              <option value="">All courses</option>
              {[...new Set(sessions.map((session) => session.course))].map((course) => <option key={course}>{course}</option>)}
            </select>
            <select value={calendarStatus} onChange={(event) => setCalendarStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#071314] px-3 py-2 text-[10px] text-white/60">
              <option value="">All events</option>
              <option>Classes</option><option>Deadlines</option><option>Upcoming</option><option>Past session</option><option>Live class</option>
            </select>
          </div>
        </Panel>
        <Panel className="p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">{calendarView === "Agenda" ? "Upcoming agenda" : formatDate(calendarDate, { month: "long", year: "numeric", day: undefined, weekday: undefined })}</h3>
            <p className="text-[10px] text-white/40">Times shown in your local timezone</p>
          </div>
          {calendarView === "Agenda" ? (
            <div className="space-y-2">
              {events.sort((a, b) => a.date.getTime() - b.date.getTime()).map((event) => (
                <button
                  type="button"
                  key={event.id}
                  onClick={() => openDetails(event.session, "calendar")}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] p-3 text-left hover:border-[#2bffff]/30 hover:bg-white/[.03]"
                >
                  <span className="min-w-16 text-[10px] font-bold text-[#2bffff]">{formatDate(event.date, { month: "short", day: "numeric" })}</span>
                  <span className="flex-1">
                    <span className="block text-xs font-bold">{event.title}</span>
                    <span className="mt-1 block text-[10px] text-white/40">{event.type} · {formatTime(event.date)}</span>
                  </span>
                  <ChevronRight size={15} className="text-white/35" />
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 border-b border-white/10 pb-2 text-center text-[9px] font-bold uppercase text-white/35">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className={`mt-2 grid grid-cols-7 ${calendarView === "Month" ? "gap-px" : "gap-2"}`}>
                {visibleDays.map((date) => {
                  const dayEvents = eventsForDay(date);
                  const inMonth = date.getMonth() === calendarDate.getMonth();
                  return (
                    <div key={date.toISOString()} className={`min-h-24 border border-white/[.06] p-1.5 sm:min-h-28 sm:p-2 ${!inMonth && calendarView === "Month" ? "opacity-35" : ""}`}>
                      <span className={`grid size-6 place-items-center rounded-full text-[10px] ${date.toDateString() === new Date().toDateString() ? "bg-[#2bffff] font-bold text-black" : "text-white/55"}`}>{date.getDate()}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            type="button"
                            key={event.id}
                            onClick={() => openDetails(event.session, "calendar")}
                            title={`${event.type}: ${event.title}`}
                            className={`block w-full truncate rounded px-1 py-1 text-left text-[8px] font-semibold sm:text-[9px] ${event.type === "Course deadline" ? "bg-amber-400/10 text-amber-300" : event.type === "Live class" ? "bg-red-400/10 text-red-300" : "bg-[#2bffff]/10 text-[#2bffff]"}`}
                          >
                            {formatTime(event.date)} {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && <span className="text-[8px] text-white/40">+{dayEvents.length - 2} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Panel>
      </div>
    );
  };

  const renderDetails = () => {
    if (!selected) return null;
    const cancelled = selected.status === "cancelled";
    const joinAvailable = canJoin(selected);
    return (
      <div className="space-y-5">
        <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]">
          <ArrowLeft size={15} /> Back to {returnTo === "calendar" ? "Calendar" : "Live Classes"}
        </button>
        <Panel className="overflow-hidden p-0">
          <div className="relative flex min-h-56 flex-col justify-end overflow-hidden bg-gradient-to-br from-[#073436] via-[#10282b] to-[#261d38] p-6 sm:min-h-64 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(43,255,255,.25),transparent_30%)]" />
            <div className="absolute -right-12 -top-20 size-72 rounded-full border border-white/10" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <Tag tone={selected.status === "live" ? "red" : cancelled ? "amber" : "cyan"}>{selected.status === "live" ? "LIVE NOW" : cancelled ? "SESSION CANCELLED" : selected.status === "past" ? "COMPLETED" : "UPCOMING SESSION"}</Tag>
                <Tag>{selected.type}</Tag>
              </div>
              <h2 className="mt-4 max-w-3xl text-2xl font-bold sm:text-3xl">{selected.title}</h2>
              <p className="mt-2 text-sm text-white/60">{selected.course}</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Date", formatDate(selected.start, { year: "numeric" }), CalendarDays],
              ["Time", `${formatTime(selected.start)} – ${formatTime(getEndTime(selected))}`, Clock3],
              ["Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time", Globe2],
              ["Duration", `${selected.duration} minutes`, Video],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="flex items-start gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-3">
                <Icon size={15} className="mt-0.5 text-[#2bffff]" />
                <div><p className="text-[9px] uppercase tracking-wider text-white/35">{label as string}</p><p className="mt-1 text-[11px] font-bold">{value as string}</p></div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
          <div className="space-y-5">
            <Panel>
              <h3 className="font-bold">About this session</h3>
              <p className="mt-3 text-xs leading-relaxed text-white/55">{selected.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><h4 className="text-[11px] font-bold text-[#2bffff]">Learning objectives</h4><ul className="mt-2 space-y-2 text-[11px] text-white/50">{["Understand the core concepts and their practical use", "Apply the ideas in a guided, hands-on activity", "Leave with clear next steps and useful resources"].map((item) => <li key={item} className="flex gap-2"><Check size={13} className="shrink-0 text-emerald-300" />{item}</li>)}</ul></div>
                <div><h4 className="text-[11px] font-bold text-[#2bffff]">Topics covered</h4><div className="mt-2 flex flex-wrap gap-2">{["Foundations", "Real-world examples", "Practice", "Q&A"].map((item) => <Tag key={item}>{item}</Tag>)}</div></div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[.07] p-3"><h4 className="text-[11px] font-bold">Before you join</h4><p className="mt-1.5 text-[10px] leading-relaxed text-white/45">Bring your questions and have a notebook ready. You can join the room up to 15 minutes before the start.</p></div>
                <div className="rounded-xl border border-white/[.07] p-3"><h4 className="text-[11px] font-bold">Learning resources</h4><button type="button" onClick={() => setToast("Session notes are ready to view")} className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-[#2bffff]"><FileText size={13} /> Session notes and prep guide <ExternalLink size={11} /></button></div>
              </div>
            </Panel>
            <Panel>
              <div className="flex items-center justify-between"><div><h3 className="font-bold">Meeting information</h3><p className="mt-1 text-[10px] text-white/40">Secure classroom · access for enrolled students</p></div><ShieldCheck size={18} className="text-emerald-300" /></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[9px] uppercase text-white/35">Platform</p><p className="mt-1 text-xs font-bold">LearnIsphere classroom</p></div>
                <div className="rounded-xl bg-white/[.03] p-3"><p className="text-[9px] uppercase text-white/35">Joining availability</p><p className="mt-1 text-xs font-bold">15 minutes before start</p></div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-white/40">This prototype shows the meeting experience only. No external meeting provider or live connection is used.</p>
            </Panel>
          </div>
          <div className="space-y-5">
            <Panel>
              <h3 className="font-bold">Your instructor</h3>
              <div className="mt-4 flex items-center gap-3"><InstructorAvatar name={selected.instructor} initials={selected.initials} size="size-12" /><div><p className="text-sm font-bold">{selected.instructor}</p><p className="mt-1 text-[10px] text-white/45">{selected.instructorRole}</p></div></div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/50">{selected.instructor} helps learners turn new ideas into practical skills through clear examples and collaborative sessions.</p>
              <div className="mt-4 border-t border-white/[.08] pt-3"><p className="text-[9px] font-bold uppercase tracking-wider text-white/35">Other sessions</p>{sessions.filter((session) => session.instructor === selected.instructor && session.id !== selected.id).slice(0, 2).map((session) => <button key={session.id} type="button" onClick={() => openDetails(session, returnTo)} className="mt-2 flex w-full items-center justify-between gap-2 text-left text-[10px] font-semibold text-white/60 hover:text-[#2bffff]"><span className="truncate">{session.title}</span><ChevronRight size={13} /></button>)}</div>
            </Panel>
            <Panel>
              <h3 className="font-bold">Session actions</h3>
              {cancelled && <p className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[.06] p-3 text-[10px] text-amber-200">Meeting unavailable: this session was cancelled. Check your notifications for updated class information.</p>}
              <div className="mt-4 space-y-2">
                <ActionButton onClick={() => joinSession(selected)} disabled={!joinAvailable} className="w-full">
                  {selected.status === "live" ? "Join Live Now" : cancelled ? "Session Cancelled" : selected.status === "past" ? "Session Ended" : joinAvailable ? "Join Class" : "Join Available Soon"}
                </ActionButton>
                <ActionButton secondary onClick={() => setModal("calendar-add")} className="w-full"><CalendarDays size={14} /> Add to Calendar</ActionButton>
                <ActionButton secondary onClick={() => openReminder(selected)} className="w-full"><Bell size={14} /> {reminders.includes(selected.id) ? "Reminder Set" : "Set Reminder"}</ActionButton>
                {selected.status === "past" && selected.recording === "available" && <ActionButton secondary onClick={() => setScreen("player")} className="w-full"><Play size={14} /> Watch Recording</ActionButton>}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  };

  const renderLobby = () => {
    if (!selected) return null;
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <button type="button" onClick={() => setScreen("details")} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={15} /> Back to session details</button>
        <Panel className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Meeting lobby · frontend preview</p>
            <h2 className="mt-2 text-2xl font-bold">{selected.title}</h2>
            <p className="mt-1 text-xs text-white/45">{selected.course} · with {selected.instructor}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Tag><CalendarDays size={11} /> {formatDate(selected.start)}</Tag><Tag><Clock3 size={11} /> {formatTime(selected.start)} · {selected.duration} min</Tag><Tag tone={selected.status === "live" ? "red" : "cyan"}>{selected.status === "live" ? "Session live" : "Ready to join"}</Tag></div>
          </div>
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.4fr_.8fr]">
            <div className="space-y-3">
              <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a2123] via-[#111924] to-[#241c31]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(43,255,255,.12),transparent_40%)]" />
                {cameraOn ? <div className="relative grid size-24 place-items-center rounded-full border border-[#2bffff]/30 bg-[#2bffff]/10 text-2xl font-bold text-[#2bffff]">AV</div> : <div className="relative text-center"><Camera size={28} className="mx-auto text-white/35" /><p className="mt-2 text-[11px] text-white/45">Camera preview is simulated</p></div>}
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-2.5 py-1.5 text-[10px] font-bold">Aman Verma · You</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={() => setMicOn((value) => !value)} className={`grid size-11 place-items-center rounded-xl border ${micOn ? "border-[#2bffff]/30 bg-[#2bffff]/10 text-[#2bffff]" : "border-white/10 bg-white/[.04] text-white/65"}`} aria-label={micOn ? "Mute microphone" : "Turn microphone on"}>{micOn ? <Mic size={17} /> : <MicOff size={17} />}</button>
                <button type="button" onClick={() => setCameraOn((value) => !value)} className={`grid size-11 place-items-center rounded-xl border ${cameraOn ? "border-[#2bffff]/30 bg-[#2bffff]/10 text-[#2bffff]" : "border-white/10 bg-white/[.04] text-white/65"}`} aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}><Camera size={17} /></button>
                <label className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 text-[10px] text-white/50"><Volume2 size={15} /><select className="max-w-36 bg-transparent text-[10px] text-white/70 outline-none"><option>Default speaker</option><option>Built-in audio</option></select></label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[.08] p-4">
                <h3 className="text-sm font-bold">Check your setup</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-white/40">These controls are a visual prototype and will not request access to your devices.</p>
                <div className="mt-4 space-y-2">
                  <button type="button" onClick={() => setMicTested(true)} className="flex w-full items-center justify-between rounded-xl bg-white/[.03] p-3 text-left text-[11px] font-semibold"><span className="flex items-center gap-2"><Mic size={14} className="text-[#2bffff]" /> Test microphone</span>{micTested ? <Tag tone="green">Looks good</Tag> : <ChevronRight size={14} />}</button>
                  <button type="button" onClick={() => setCameraTested(true)} className="flex w-full items-center justify-between rounded-xl bg-white/[.03] p-3 text-left text-[11px] font-semibold"><span className="flex items-center gap-2"><Camera size={14} className="text-[#2bffff]" /> Test camera</span>{cameraTested ? <Tag tone="green">Looks good</Tag> : <ChevronRight size={14} />}</button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[.08] p-4">
                <h3 className="text-sm font-bold">Before you join</h3>
                <ul className="mt-3 space-y-2 text-[10px] text-white/50">{["Use headphones for the best audio experience.", "Keep your microphone muted until you speak.", "Be kind and respectful to everyone in the room."].map((item) => <li key={item} className="flex gap-2"><Check size={13} className="shrink-0 text-[#2bffff]" />{item}</li>)}</ul>
              </div>
              <ActionButton onClick={() => setScreen("connecting")} className="w-full py-3">Join Session <ChevronRight size={15} /></ActionButton>
              <p className="text-center text-[9px] text-white/30">Demo only — no video, microphone, or conferencing connection is created.</p>
            </div>
          </div>
        </Panel>
      </div>
    );
  };

  const renderConnecting = () => (
    <Panel className="grid min-h-[65vh] place-items-center text-center">
      <div>
        <div className="mx-auto grid size-16 animate-pulse place-items-center rounded-2xl border border-[#2bffff]/20 bg-[#2bffff]/[.08] text-[#2bffff]"><Radio size={26} /></div>
        <h2 className="mt-5 text-xl font-bold">Connecting to your live class...</h2>
        <p className="mt-2 text-xs text-white/45">Preparing your classroom preview.</p>
        <p className="mt-5 text-[10px] text-white/30">This is a simulated frontend experience.</p>
      </div>
    </Panel>
  );

  const renderMeeting = () => {
    if (!selected) return null;
    return (
      <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-[70] overflow-auto bg-[#020707] p-3 sm:p-5" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-red-400/10 text-red-300"><Radio size={17} /></span><div><h2 className="text-base font-bold">{selected.title}</h2><p className="text-[10px] text-white/40">{selected.course}</p></div></div>
          <div className="flex items-center gap-2"><Tag tone="red"><span className="size-1.5 animate-pulse rounded-full bg-red-300" /> LIVE · Demo session</Tag><button type="button" onClick={() => setIsFullscreen((value) => !value)} className="grid size-9 place-items-center rounded-xl border border-white/10 hover:bg-white/[.05]" aria-label={isFullscreen ? "Exit full screen" : "Full screen"}><Maximize2 size={15} /></button></div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <Panel className="flex min-h-[58vh] flex-col justify-between p-3 sm:p-5">
            <div className="relative grid flex-1 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a2426] via-[#141b28] to-[#251c35]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(43,255,255,.12),transparent_45%)]" />
              <div className="relative text-center"><div className="mx-auto grid size-24 place-items-center rounded-full border border-[#2bffff]/25 bg-[#2bffff]/10 text-2xl font-bold text-[#2bffff]">{selected.initials}</div><p className="mt-3 text-sm font-bold">{selected.instructor}</p><p className="mt-1 text-[10px] text-white/40">Instructor video preview · not connected</p></div>
              <span className="absolute left-3 top-3 rounded-lg bg-black/40 px-2.5 py-1.5 text-[9px] font-bold text-white/70">{formatTime(selected.start)} · {selected.duration} min</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => setMicOn((value) => !value)} className={`grid size-10 place-items-center rounded-xl border ${micOn ? "border-[#2bffff]/30 bg-[#2bffff]/10 text-[#2bffff]" : "border-white/10 bg-white/[.04] text-white/55"}`} aria-label={micOn ? "Mute microphone" : "Unmute microphone"}>{micOn ? <Mic size={16} /> : <MicOff size={16} />}</button>
              <button type="button" onClick={() => setCameraOn((value) => !value)} className={`grid size-10 place-items-center rounded-xl border ${cameraOn ? "border-[#2bffff]/30 bg-[#2bffff]/10 text-[#2bffff]" : "border-white/10 bg-white/[.04] text-white/55"}`} aria-label="Toggle camera"><Camera size={16} /></button>
              <button type="button" onClick={() => setSpeakerOn((value) => !value)} className={`grid size-10 place-items-center rounded-xl border ${speakerOn ? "border-white/10 bg-white/[.04] text-white/55" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`} aria-label="Toggle speaker">{speakerOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
              <button type="button" onClick={() => setMeetingPanel("Chat")} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-white/55 hover:text-[#2bffff]" aria-label="Open chat"><MessageSquare size={16} /></button>
              <button type="button" onClick={() => setMeetingPanel("Participants")} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-white/55 hover:text-[#2bffff]" aria-label="Open participants"><Users size={16} /></button>
              <button type="button" onClick={() => setIsFullscreen((value) => !value)} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-white/55 hover:text-[#2bffff]" aria-label="Toggle full screen"><Maximize2 size={16} /></button>
              <button type="button" onClick={() => setModal("leave")} className="rounded-xl bg-red-500/15 px-4 py-2.5 text-[10px] font-bold text-red-300 hover:bg-red-500/25">Leave Class</button>
            </div>
          </Panel>
          <Panel className="flex min-h-[58vh] flex-col p-0">
            <div className="flex border-b border-white/10 p-2">
              {(["Participants", "Chat", "Session info"] as PanelName[]).map((panel) => <button key={panel} type="button" onClick={() => setMeetingPanel(panel)} className={`flex-1 rounded-lg px-2 py-2 text-[9px] font-bold ${meetingPanel === panel ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/45"}`}>{panel}</button>)}
            </div>
            {meetingPanel === "Chat" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-3">{messages.map((item, index) => <div key={`${item.name}-${index}`} className="flex gap-2"><InstructorAvatar name={item.name} initials={item.initials} size="size-7" /><div className="min-w-0 flex-1 rounded-xl bg-white/[.04] p-2.5"><div className="flex justify-between gap-2"><span className="text-[9px] font-bold">{item.name}</span><span className="text-[8px] text-white/30">{item.time}</span></div><p className="mt-1 break-words text-[10px] text-white/60">{item.text}</p></div></div>)}</div>
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message everyone..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] outline-none focus:border-[#2bffff]/40" /><button type="submit" className="grid size-9 place-items-center rounded-lg bg-[#2bffff] text-black" aria-label="Send message"><Send size={14} /></button></form>
              </>
            ) : meetingPanel === "Participants" ? (
              <div className="flex-1 space-y-1 overflow-y-auto p-3">
                <div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold">In this room</p><Tag>{selected.participants + 2}</Tag></div>
                {[["Nisha Rao", "NR", "Instructor"], ["Vikram Joshi", "VJ", "Co-instructor"], ["Aman Verma", "AV", "You"], ["Priya Sharma", "PS", "Student"], ["Rohan Mehta", "RM", "Student"], ["Sneha Iyer", "SI", "Student"]].map(([name, initials, role]) => <div key={name} className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/[.03]"><InstructorAvatar name={name} initials={initials} size="size-7" /><span className="flex-1 truncate text-[10px] font-semibold">{name}</span><span className="text-[8px] text-white/35">{role}</span></div>)}
              </div>
            ) : (
              <div className="space-y-3 p-4"><h3 className="text-xs font-bold">Session information</h3><p className="text-[10px] leading-relaxed text-white/45">{selected.description}</p><div className="rounded-xl bg-white/[.03] p-3"><p className="text-[9px] text-white/35">Course</p><p className="mt-1 text-[10px] font-bold">{selected.course}</p></div><div className="rounded-xl bg-white/[.03] p-3"><p className="text-[9px] text-white/35">Instructor</p><p className="mt-1 text-[10px] font-bold">{selected.instructor}</p></div></div>
            )}
          </Panel>
        </div>
        <p className="text-center text-[9px] text-white/30">Frontend prototype only. No real video stream, device access, or conferencing connection is active.</p>
      </div>
    );
  };

  const renderSummary = () => selected ? (
    <div className="mx-auto max-w-3xl space-y-5">
      <Panel className="p-6 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={25} /></span>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-300">You left the session</p>
        <h2 className="mt-2 text-2xl font-bold">Class summary</h2>
        <p className="mt-2 text-xs text-white/45">{selected.title} · {selected.course}</p>
        <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
          {[["Time attended", "42 minutes"], ["Session duration", `${selected.duration} minutes`], ["Attendance status", "Present"]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.08] p-4"><p className="text-[9px] uppercase text-white/35">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>)}
        </div>
        <p className="mt-5 text-[10px] text-white/35">Your attendance summary is a sample preview and is not saved to an account.</p>
        <ActionButton onClick={() => { setScreen("browse"); setTab("Upcoming"); }} className="mt-6"><ArrowLeft size={14} /> Return to Live Classes</ActionButton>
      </Panel>
    </div>
  ) : null;

  const renderPlayer = () => selected ? (
    <div className="space-y-5">
      <button type="button" onClick={() => { setScreen("browse"); setTab("Recordings"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={15} /> Back to Recordings</button>
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Panel className="p-3 sm:p-4">
            <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a2426] via-[#141b28] to-[#251c35]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(43,255,255,.1),transparent_45%)]" />
              <button type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? "Pause recording" : "Play recording"} className="relative grid size-14 place-items-center rounded-full border border-[#2bffff]/40 bg-black/40 text-[#2bffff]">{isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}</button>
              <span className="absolute bottom-3 left-3 text-[9px] text-white/60">Recording preview · playback is simulated</span>
              <span className="absolute bottom-3 right-3 text-[9px] text-white/60">18:24 / {selected.duration}:00</span>
            </div>
            <div className="mt-3"><div className="h-1.5 cursor-pointer rounded-full bg-white/10" onClick={() => setToast("Playback position updated")}><div className="h-full w-1/3 rounded-full bg-[#2bffff]" /></div><div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => setIsPlaying((value) => !value)} className="flex items-center gap-2 text-[10px] font-bold text-white/60">{isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? "Pause" : "Play"}</button><div className="flex items-center gap-2"><select value={playbackSpeed} onChange={(event) => setPlaybackSpeed(event.target.value)} className="rounded-lg border border-white/10 bg-[#071314] px-2 py-1.5 text-[9px] text-white/60"><option>0.75×</option><option>1×</option><option>1.25×</option><option>1.5×</option><option>2×</option></select><button type="button" onClick={() => setIsFullscreen((value) => !value)} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50" aria-label="Toggle player full screen"><Maximize2 size={13} /></button></div></div></div>
          </Panel>
          <Panel><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{selected.title}</h2><p className="mt-1 text-xs text-white/45">{selected.course}</p></div><Tag tone="green">Available</Tag></div><div className="mt-4 flex items-center gap-3 border-t border-white/[.08] pt-4"><InstructorAvatar name={selected.instructor} initials={selected.initials} /><div><p className="text-[11px] font-bold">{selected.instructor}</p><p className="mt-1 text-[9px] text-white/40">Recorded {formatDate(selected.start)}</p></div><span className="ml-auto text-[10px] text-white/40">{selected.duration} minutes</span></div><p className="mt-4 text-[11px] leading-relaxed text-white/50">{selected.description}</p></Panel>
        </div>
        <Panel><h3 className="font-bold">Related recordings</h3><div className="mt-3 space-y-2">{recordingSessions.filter((session) => session.id !== selected.id && session.recording === "available").map((session) => <button key={session.id} type="button" onClick={() => setSelected(session)} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] p-2 text-left hover:bg-white/[.03]"><span className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-[#063234] to-[#271d38] text-[#2bffff]"><Play size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-bold">{session.title}</span><span className="mt-1 block text-[9px] text-white/40">{session.course} · {session.duration} min</span></span><ChevronRight size={13} className="text-white/35" /></button>)}</div><button type="button" onClick={() => setToast("Recording notes are ready to view")} className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#2bffff]"><Download size={13} /> Download session notes</button></Panel>
      </div>
    </div>
  ) : null;

  const renderAttendanceDetail = () => selected ? (
    <div className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={() => { setScreen("browse"); setTab("My Attendance"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={15} /> Back to attendance</button>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Attendance details</p><h2 className="mt-2 text-xl font-bold">{selected.title}</h2><p className="mt-1 text-xs text-white/45">{selected.course}</p></div><Tag tone={selected.attendance === "Absent" ? "amber" : "green"}>{selected.attendance}</Tag></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Instructor", selected.instructor], ["Date", formatDate(selected.start)], ["Scheduled duration", `${selected.duration} minutes`], ["Time attended", selected.attendance === "Absent" ? "0 minutes" : selected.attendance === "Partial Attendance" ? "32 minutes" : `${selected.duration} minutes`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.07] p-3"><p className="text-[9px] uppercase text-white/35">{label}</p><p className="mt-1.5 text-xs font-bold">{value}</p></div>)}</div>
        <p className="mt-4 text-[10px] text-white/40">Attendance details shown here are sample UI data for this frontend prototype.</p>
      </Panel>
      {attendanceDetail && <ActionButton onClick={() => openDetails(selected, "attendance-detail")} secondary>View Session Details</ActionButton>}
    </div>
  ) : null;

  let content: ReactNode = null;
  if (screen === "browse") content = renderBrowse();
  else if (screen === "calendar") content = renderCalendar();
  else if (screen === "details") content = renderDetails();
  else if (screen === "lobby") content = renderLobby();
  else if (screen === "connecting") content = renderConnecting();
  else if (screen === "live") content = renderMeeting();
  else if (screen === "summary") content = renderSummary();
  else if (screen === "player") content = renderPlayer();
  else content = renderAttendanceDetail();

  return (
    <div className={`page-enter space-y-5 ${isFullscreen && screen === "player" ? "fixed inset-0 z-[70] overflow-auto bg-[#020707] p-3 sm:p-5" : ""}`}>
      {content}
      {modal === "reminder" && selected && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="reminder-title" className="w-full max-w-md rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 id="reminder-title" className="text-lg font-bold">Set a reminder</h2><p className="mt-1 text-[11px] text-white/45">{selected.title}</p></div><button type="button" onClick={() => setModal(null)} className="grid size-8 place-items-center rounded-lg border border-white/10" aria-label="Close reminder"><X size={15} /></button></div>
            <div className="mt-5 space-y-2">{["24 hours before", "1 hour before", "15 minutes before", "Custom reminder"].map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[.08] p-3 text-[11px] font-semibold hover:bg-white/[.03]"><input type="radio" name="reminder-time" checked={reminderChoice === option} onChange={() => setReminderChoice(option)} className="accent-[#2bffff]" />{option}{option === "Custom reminder" && reminderChoice === option && <span className="ml-auto flex items-center gap-1"><input type="number" min="1" value={customReminder} onChange={(event) => setCustomReminder(event.target.value)} className="w-16 rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-right text-[10px]" /><span className="text-[9px] text-white/40">min before</span></span>}</label>)}</div>
            <div className="mt-4 space-y-2 border-t border-white/[.08] pt-4"><label className="flex items-center justify-between text-[11px] text-white/65">Email reminder <input type="checkbox" checked={emailReminder} onChange={(event) => setEmailReminder(event.target.checked)} className="accent-[#2bffff]" /></label><label className="flex items-center justify-between text-[11px] text-white/65">In-app reminder <input type="checkbox" checked={inAppReminder} onChange={(event) => setInAppReminder(event.target.checked)} className="accent-[#2bffff]" /></label></div>
            <div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Cancel</ActionButton><ActionButton onClick={addReminder} disabled={!emailReminder && !inAppReminder}>Save Reminder</ActionButton></div>
          </div>
        </div>
      )}
      {modal === "calendar-add" && selected && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="calendar-add-title" className="w-full max-w-md rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 id="calendar-add-title" className="text-lg font-bold">Add to calendar</h2><p className="mt-1 text-[11px] text-white/45">Confirm this session for your schedule.</p></div><button type="button" onClick={() => setModal(null)} className="grid size-8 place-items-center rounded-lg border border-white/10" aria-label="Close calendar confirmation"><X size={15} /></button></div>
            <div className="mt-4 rounded-xl border border-white/[.08] p-4"><p className="text-sm font-bold">{selected.title}</p><p className="mt-1 text-[11px] text-white/45">{formatDate(selected.start)} · {formatTime(selected.start)} · {selected.duration} min</p><p className="mt-2 text-[10px] text-white/35">{selected.course} · {selected.instructor}</p></div>
            <p className="mt-3 text-[10px] text-white/35">Calendar changes are stored only in this frontend preview.</p>
            <div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Cancel</ActionButton><ActionButton onClick={addCalendarEvent} disabled={calendarEvents.includes(selected.id)}>{calendarEvents.includes(selected.id) ? <><Check size={14} /> Added</> : "Add event"}</ActionButton></div>
          </div>
        </div>
      )}
      {modal === "leave" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="leave-title" className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#061011] p-5 shadow-2xl">
            <span className="grid size-10 place-items-center rounded-xl bg-red-400/10 text-red-300"><X size={18} /></span><h2 id="leave-title" className="mt-4 text-lg font-bold">Leave this class?</h2><p className="mt-2 text-xs leading-relaxed text-white/45">You can rejoin while the class is live. Your attendance summary will be shown next.</p><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Stay in class</ActionButton><button type="button" onClick={() => { setModal(null); setScreen("summary"); }} className="rounded-xl bg-red-400/15 px-4 py-2.5 text-xs font-bold text-red-200 hover:bg-red-400/25">Leave Class</button></div>
          </div>
        </div>
      )}
      {modal === "notifications" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="w-full max-w-md rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 id="notifications-title" className="text-lg font-bold">Notifications</h2><p className="mt-1 text-[11px] text-white/45">Updates for your live classes</p></div><button type="button" onClick={() => setModal(null)} className="grid size-8 place-items-center rounded-lg border border-white/10" aria-label="Close notifications"><X size={15} /></button></div>
            <div className="mt-4 space-y-2">{["Your live class starts in one hour.", "Your instructor has updated a session.", "Your live class starts in 15 minutes.", "A new class recording is available."].map((item, index) => <div key={item} className="flex gap-3 rounded-xl border border-white/[.07] p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2bffff]/10 text-[#2bffff]">{index === 3 ? <MonitorPlay size={15} /> : <Bell size={15} />}</span><div><p className="text-[11px] font-semibold">{item}</p><p className="mt-1 text-[9px] text-white/35">{index === 0 ? "Today · 9:30 AM" : `${index + 1}h ago`}</p></div></div>)}</div>
            <ActionButton onClick={() => setModal(null)} className="mt-4 w-full">Done</ActionButton>
          </div>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-20 right-4 z-[100] flex max-w-sm items-center gap-2 rounded-xl border border-[#2bffff]/20 bg-[#061011] px-4 py-3 text-xs font-semibold shadow-2xl"><CheckCircle2 size={15} className="shrink-0 text-[#2bffff]" />{toast}</div>}
      {loading && screen !== "browse" && <span className="sr-only">Loading sessions</span>}
    </div>
  );
}
