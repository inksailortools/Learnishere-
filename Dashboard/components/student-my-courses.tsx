"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flag,
  Globe2,
  GraduationCap,
  Layers,
  Link2,
  LayoutDashboard,
  List,
  LockKeyhole,
  Mail,
  Medal,
  MessageSquare,
  Mic,
  MoreHorizontal,
  NotebookPen,
  Paperclip,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UserRound,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type CourseStatus = "In Progress" | "Not Started" | "Completed" | "Archived";
type CourseTab =
  | "Overview"
  | "Curriculum"
  | "Resources"
  | "Assignments"
  | "Quizzes"
  | "Announcements"
  | "Discussions";
type LibraryTab = "All Courses" | "In Progress" | "Not Started" | "Completed" | "Archived";
type Screen =
  | "library"
  | "course"
  | "player"
  | "assignment"
  | "submission"
  | "quiz-instructions"
  | "quiz"
  | "quiz-results"
  | "announcement"
  | "discussion"
  | "completion"
  | "certificate"
  | "resource-preview"
  | "progress";
type LessonType =
  | "Video Lesson"
  | "Reading Material"
  | "PDF Resource"
  | "Live Class"
  | "Quiz"
  | "Assignment"
  | "Practical Exercise";
type Course = {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  initials: string;
  category: string;
  level: string;
  type: string;
  enrolled: string;
  accessed: string;
  modules: number;
  lessons: number;
  initialCompleted: number;
  remaining: string;
  language: string;
  gradient: string;
};
type Lesson = { id: string; title: string; type: LessonType; duration: string; description: string };
type Module = { id: string; title: string; description: string; lessons: Lesson[] };
type Note = { id: number; courseId: string; lessonId: string; title: string; body: string; date: string };
type AssignmentStatus = "Pending" | "Submitted" | "Graded" | "Overdue";
type Assignment = {
  id: string;
  title: string;
  module: string;
  lesson: string;
  due: string;
  status: AssignmentStatus;
  marks?: string;
  feedback?: string;
};
type Discussion = { id: number; title: string; author: string; initials: string; body: string; module: string; replies: number; likes: number; liked: boolean };
type CourseResource = { id: string; name: string; type: string; size: string; lesson: string; published: string };

const libraryTabs: LibraryTab[] = ["All Courses", "In Progress", "Not Started", "Completed", "Archived"];
const courseTabs: CourseTab[] = [
  "Overview",
  "Curriculum",
  "Resources",
  "Assignments",
  "Quizzes",
  "Announcements",
  "Discussions",
];
const lessonCatalog: Omit<Lesson, "id">[] = [
  { title: "Welcome to the Course", type: "Video Lesson", duration: "08:24", description: "Meet your instructor and learn how to get the most from this course." },
  { title: "Course Overview", type: "Reading Material", duration: "6 min read", description: "Review the course structure, expectations, and learning path." },
  { title: "Learning Roadmap", type: "PDF Resource", duration: "4 pages", description: "A quick reference for the skills and milestones in this course." },
  { title: "Introduction to Core Concepts", type: "Video Lesson", duration: "18:42", description: "Build a strong foundation with the concepts used throughout the course." },
  { title: "Practical Demonstration", type: "Practical Exercise", duration: "22:10", description: "Follow a guided demonstration and apply the core ideas." },
  { title: "Knowledge Check", type: "Quiz", duration: "10 min", description: "Check your understanding before moving on to advanced topics." },
  { title: "Advanced Techniques", type: "Video Lesson", duration: "24:18", description: "Explore advanced techniques and when to use them." },
  { title: "Real-World Applications", type: "Live Class", duration: "45 min", description: "Join an instructor-led session with examples from real projects." },
  { title: "Practical Exercise", type: "Assignment", duration: "30 min", description: "Complete a practical task and reflect on your approach." },
  { title: "Final Quiz", type: "Quiz", duration: "20 min", description: "Demonstrate your understanding of the course outcomes." },
  { title: "Final Assignment", type: "Assignment", duration: "60 min", description: "Bring together your learning in a final applied project." },
  { title: "Course Completion", type: "Reading Material", duration: "3 min read", description: "Review your progress and next steps for continued learning." },
];

const sampleCourses: Course[] = [
  {
    id: "react",
    title: "Modern React Engineering",
    instructor: "Vikram Joshi",
    instructorRole: "Senior Frontend Engineer",
    initials: "VJ",
    category: "Development",
    level: "Intermediate",
    type: "Self-paced",
    enrolled: "Oct 18, 2026",
    accessed: "Today",
    modules: 4,
    lessons: 12,
    initialCompleted: 6,
    remaining: "5h 20m",
    language: "English",
    gradient: "from-cyan-950 via-slate-900 to-indigo-950",
  },
  {
    id: "design",
    title: "Product Design Masterclass",
    instructor: "Nisha Rao",
    instructorRole: "Product Design Lead",
    initials: "NR",
    category: "Design",
    level: "All levels",
    type: "Cohort-based",
    enrolled: "Sep 30, 2026",
    accessed: "Yesterday",
    modules: 4,
    lessons: 12,
    initialCompleted: 9,
    remaining: "2h 45m",
    language: "English",
    gradient: "from-fuchsia-950 via-slate-900 to-rose-950",
  },
  {
    id: "analytics",
    title: "Data Analytics & Storytelling",
    instructor: "Arjun Nair",
    instructorRole: "Analytics Educator",
    initials: "AN",
    category: "Analytics",
    level: "Beginner",
    type: "Self-paced",
    enrolled: "Nov 02, 2026",
    accessed: "Nov 10, 2026",
    modules: 4,
    lessons: 12,
    initialCompleted: 3,
    remaining: "7h 10m",
    language: "English",
    gradient: "from-emerald-950 via-slate-900 to-teal-950",
  },
  {
    id: "sap",
    title: "SAP FICO Professional Training",
    instructor: "Meera Shah",
    instructorRole: "SAP Finance Consultant",
    initials: "MS",
    category: "Finance",
    level: "Advanced",
    type: "Instructor-led",
    enrolled: "Jun 12, 2026",
    accessed: "Oct 28, 2026",
    modules: 4,
    lessons: 12,
    initialCompleted: 12,
    remaining: "Completed",
    language: "English",
    gradient: "from-amber-950 via-slate-900 to-orange-950",
  },
  {
    id: "ai",
    title: "AI & Automation Fundamentals",
    instructor: "Kabir Sethi",
    instructorRole: "Applied AI Instructor",
    initials: "KS",
    category: "Technology",
    level: "Beginner",
    type: "Self-paced",
    enrolled: "Nov 11, 2026",
    accessed: "Not started",
    modules: 4,
    lessons: 12,
    initialCompleted: 0,
    remaining: "6h 30m",
    language: "English",
    gradient: "from-violet-950 via-slate-900 to-blue-950",
  },
  {
    id: "marketing",
    title: "Digital Marketing Masterclass",
    instructor: "Riya Kapoor",
    instructorRole: "Growth Marketing Strategist",
    initials: "RK",
    category: "Marketing",
    level: "Intermediate",
    type: "Cohort-based",
    enrolled: "Aug 22, 2026",
    accessed: "Sep 14, 2026",
    modules: 4,
    lessons: 12,
    initialCompleted: 4,
    remaining: "4h 50m",
    language: "English",
    gradient: "from-pink-950 via-slate-900 to-purple-950",
  },
];

const initialNotes: Note[] = [
  {
    id: 1,
    courseId: "react",
    lessonId: "react-lesson-3",
    title: "Core concepts to revisit",
    body: "Prefer composition when components need to stay flexible. Keep state close to where it is used.",
    date: "Nov 12, 2026",
  },
];
const initialAssignments: Assignment[] = [
  { id: "practice", title: "Build a reusable component", module: "Module 03 — Advanced Topics", lesson: "Practical Exercise", due: "Nov 20, 2026", status: "Pending" },
  { id: "final", title: "Course capstone project", module: "Module 04 — Final Assessment", lesson: "Final Assignment", due: "Nov 28, 2026", status: "Pending" },
  { id: "graded", title: "Component architecture reflection", module: "Module 02 — Core Concepts", lesson: "Knowledge Check", due: "Nov 08, 2026", status: "Graded", marks: "18 / 20", feedback: "Clear reasoning and a thoughtful use of composition. Add one more example to support your trade-off analysis." },
];
const initialDiscussions: Discussion[] = [
  { id: 1, title: "When should state live higher in the tree?", author: "Priya Sharma", initials: "PS", body: "I am deciding whether to lift this state to the page level or keep it in the component. What signals do you look for?", module: "Module 02 — Core Concepts", replies: 4, likes: 8, liked: false },
  { id: 2, title: "Sharing my capstone approach", author: "Rohan Mehta", initials: "RM", body: "I have outlined the component structure for the final project. Would love feedback on the boundaries before I start building.", module: "Module 03 — Advanced Topics", replies: 2, likes: 5, liked: false },
];
const sampleAnnouncements = [
  { id: 1, title: "New module published: Advanced Topics", instructor: "Vikram Joshi", initials: "VJ", date: "Nov 12, 2026", body: "Module 03 is now available. It includes a real-world walkthrough and a practical exercise. Work through the examples before the final assessment.", read: false },
  { id: 2, title: "Updated course resources", instructor: "Vikram Joshi", initials: "VJ", date: "Nov 08, 2026", body: "The component patterns reference has been refreshed with additional examples and links to the lesson materials.", read: true },
  { id: 3, title: "Final assessment opens next week", instructor: "Vikram Joshi", initials: "VJ", date: "Nov 05, 2026", body: "The final quiz and capstone assignment will be available from next week. Please review the learning outcomes before you begin.", read: true },
];
const sampleResources: CourseResource[] = [
  { id: "roadmap", name: "Course learning roadmap.pdf", type: "PDF", size: "1.8 MB", lesson: "Module 01 · Learning Roadmap", published: "Oct 18, 2026" },
  { id: "patterns", name: "Component patterns reference.pdf", type: "PDF", size: "3.2 MB", lesson: "Module 03 · Advanced Techniques", published: "Nov 12, 2026" },
  { id: "starter", name: "Project starter files.zip", type: "Source code", size: "840 KB", lesson: "Module 04 · Final Assignment", published: "Nov 12, 2026" },
  { id: "slides", name: "Core concepts presentation.pptx", type: "Presentation", size: "5.4 MB", lesson: "Module 02 · Core Concepts", published: "Oct 25, 2026" },
];
const quizQuestions = [
  {
    question: "Which design approach helps components stay flexible and reusable?",
    options: ["Composition", "Global state", "Deep inheritance", "Duplicating markup"],
    answer: "Composition",
  },
  {
    question: "A component should always own every piece of state used by its children.",
    options: ["True", "False"],
    answer: "False",
  },
  {
    question: "When is lifting state to a shared parent most useful?",
    options: ["For every local input", "Only to increase render count", "When sibling components need the same state", "Whenever a component is reused"],
    answer: "When sibling components need the same state",
  },
];

function buildModules(courseId: string): Module[] {
  return [
    { id: "module-1", title: "Module 01 — Introduction", description: "Get oriented, meet your instructor, and map out your learning journey.", lessons: lessonCatalog.slice(0, 3).map((lesson, index) => ({ ...lesson, id: `${courseId}-lesson-${index}` })) },
    { id: "module-2", title: "Module 02 — Core Concepts", description: "Build a confident foundation with the tools and concepts used throughout the course.", lessons: lessonCatalog.slice(3, 6).map((lesson, index) => ({ ...lesson, id: `${courseId}-lesson-${index + 3}` })) },
    { id: "module-3", title: "Module 03 — Advanced Topics", description: "Apply your skills to realistic scenarios and practice advanced techniques.", lessons: lessonCatalog.slice(6, 9).map((lesson, index) => ({ ...lesson, id: `${courseId}-lesson-${index + 6}` })) },
    { id: "module-4", title: "Module 04 — Final Assessment", description: "Demonstrate your learning with a final quiz and applied capstone.", lessons: lessonCatalog.slice(9, 12).map((lesson, index) => ({ ...lesson, id: `${courseId}-lesson-${index + 9}` })) },
  ];
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass-card rounded-[22px] border border-white/10 ${className}`}>{children}</section>;
}

function ActionButton({
  children,
  onClick,
  secondary = false,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
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

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "cyan" | "green" | "amber" | "red" }) {
  const style = {
    neutral: "border-white/10 bg-white/[.04] text-white/55",
    cyan: "border-[#2bffff]/20 bg-[#2bffff]/10 text-[#2bffff]",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style[tone]}`}>{children}</span>;
}

function Avatar({ name, initials, size = "size-9" }: { name: string; initials: string; size?: string }) {
  return <span title={name} className={`grid ${size} shrink-0 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-[#2bffff]/25 to-fuchsia-400/20 text-[10px] font-bold text-white`}>{initials}</span>;
}

function statusTone(status: CourseStatus) {
  if (status === "Completed") return "green" as const;
  if (status === "In Progress") return "cyan" as const;
  if (status === "Not Started") return "neutral" as const;
  return "amber" as const;
}

function lessonIcon(type: LessonType) {
  if (type === "Video Lesson") return <Video size={14} />;
  if (type === "Reading Material") return <BookOpen size={14} />;
  if (type === "PDF Resource") return <FileText size={14} />;
  if (type === "Live Class") return <Users size={14} />;
  if (type === "Quiz") return <CircleHelp size={14} />;
  if (type === "Assignment") return <FileText size={14} />;
  return <Activity size={14} />;
}

function courseStatus(course: Course, progress: number): CourseStatus {
  if (progress === 100) return "Completed";
  if (progress === 0) return "Not Started";
  return "In Progress";
}

export default function StudentMyCourses() {
  const [courses] = useState(sampleCourses);
  const [screen, setScreen] = useState<Screen>("library");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("All Courses");
  const [courseTab, setCourseTab] = useState<CourseTab>("Overview");
  const [selectedCourseId, setSelectedCourseId] = useState("react");
  const [currentLessonId, setCurrentLessonId] = useState("react-lesson-6");
  const [completedLessons, setCompletedLessons] = useState<string[]>(() =>
    sampleCourses.flatMap((course) =>
      Array.from({ length: course.initialCompleted }, (_, index) => `${course.id}-lesson-${index}`),
    ),
  );
  const [archivedIds, setArchivedIds] = useState<string[]>(["marketing"]);
  const [passedQuizIds, setPassedQuizIds] = useState<string[]>(["sap"]);
  const [notes, setNotes] = useState(initialNotes);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [search, setSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [progressFilter, setProgressFilter] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState("");
  const [completionFilter, setCompletionFilter] = useState("");
  const [sortBy, setSortBy] = useState("Recently Accessed");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [expandedModules, setExpandedModules] = useState<string[]>(["module-1", "module-2"]);
  const [curriculumOpen, setCurriculumOpen] = useState(true);
  const [playerTab, setPlayerTab] = useState<"Overview" | "Notes" | "Resources" | "Discussion" | "Transcript">("Overview");
  const [assignmentTab, setAssignmentTab] = useState("All Assignments");
  const [assignmentId, setAssignmentId] = useState("practice");
  const [assignmentAnswer, setAssignmentAnswer] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizReview, setQuizReview] = useState<number[]>([]);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSeconds, setQuizSeconds] = useState(900);
  const [showQuizReview, setShowQuizReview] = useState(false);
  const [discussionSearch, setDiscussionSearch] = useState("");
  const [discussionReply, setDiscussionReply] = useState("");
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(1);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(1);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<number[]>([2, 3]);
  const [selectedResourceId, setSelectedResourceId] = useState("patterns");
  const [notesModal, setNotesModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [modal, setModal] = useState<"submit-assignment" | "submit-quiz" | "create-discussion" | "more-options" | "notifications" | "archive" | "share" | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1×");
  const [captions, setCaptions] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pictureInPicture, setPictureInPicture] = useState(false);
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activity, setActivity] = useState(["Completed Module 02 · Core Concepts", "Added a note to Welcome to the Course", "Last studied Modern React Engineering"]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const modules = buildModules(selectedCourse.id);
  const allLessons = modules.flatMap((module) => module.lessons);
  const progressFor = (course: Course) => {
    const completed = allLessonsFor(course.id).filter((lesson) => completedLessons.includes(lesson.id)).length;
    return Math.round((completed / course.lessons) * 100);
  };
  const allLessonsFor = (courseId: string) => buildModules(courseId).flatMap((module) => module.lessons);
  const selectedProgress = progressFor(selectedCourse);
  const currentLesson = allLessons.find((lesson) => lesson.id === currentLessonId) ?? allLessons[0];
  const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === currentLesson?.id);
  const firstIncomplete = allLessons.findIndex((lesson) => !completedLessons.includes(lesson.id));
  const currentAssignment = assignments.find((assignment) => assignment.id === assignmentId) ?? assignments[0];
  const selectedDiscussion = discussions.find((discussion) => discussion.id === selectedDiscussionId) ?? discussions[0];
  const selectedAnnouncement = sampleAnnouncements.find((announcement) => announcement.id === selectedAnnouncementId) ?? sampleAnnouncements[0];
  const currentNote = notes.filter((note) => note.courseId === selectedCourse.id && note.lessonId === currentLessonId);
  const courseResources = selectedCourse.id === "react" ? sampleResources : sampleResources.map((resource) => ({ ...resource, lesson: resource.lesson.replace("React", selectedCourse.title.split(" ")[0]) }));

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen !== "quiz") return;
    const timer = window.setInterval(() => setQuizSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen === "quiz" && quizSeconds === 0) setModal("submit-quiz");
  }, [screen, quizSeconds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const progressForId = (id: string) => {
    const course = courses.find((item) => item.id === id);
    return course ? progressFor(course) : 0;
  };
  const statusFor = (course: Course): CourseStatus =>
    archivedIds.includes(course.id) ? "Archived" : courseStatus(course, progressFor(course));
  const toggleModule = (moduleId: string) =>
    setExpandedModules((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId],
    );
  const openCourse = (course: Course, tab: CourseTab = "Overview") => {
    setSelectedCourseId(course.id);
    setCourseTab(tab);
    setScreen("course");
    setMoreOpen(false);
  };
  const clearFilters = () => {
    setSearch("");
    setInstructorSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setProgressFilter("");
    setEnrollmentFilter("");
    setCompletionFilter("");
  };
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const instructorQuery = instructorSearch.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      const progress = progressFor(course);
      const status = archivedIds.includes(course.id) ? "Archived" : courseStatus(course, progress);
      const queryMatch = !query || course.title.toLowerCase().includes(query);
      const instructorMatch = !instructorQuery || course.instructor.toLowerCase().includes(instructorQuery);
      const categoryMatch = !categoryFilter || course.category === categoryFilter;
      const typeMatch = !typeFilter || course.type === typeFilter;
      const progressMatch =
        !progressFilter ||
        (progressFilter === "0–25%" && progress <= 25) ||
        (progressFilter === "26–75%" && progress > 25 && progress <= 75) ||
        (progressFilter === "76–99%" && progress > 75 && progress < 100) ||
        (progressFilter === "100%" && progress === 100);
      const enrollmentMatch =
        !enrollmentFilter ||
        (enrollmentFilter === "This month" && course.enrolled.includes("Nov")) ||
        (enrollmentFilter === "Earlier" && !course.enrolled.includes("Nov"));
      const completionMatch = !completionFilter || status === completionFilter;
      const tabMatch =
        libraryTab === "All Courses" ||
        (libraryTab === "In Progress" && status === "In Progress") ||
        (libraryTab === "Not Started" && status === "Not Started") ||
        (libraryTab === "Completed" && status === "Completed") ||
        (libraryTab === "Archived" && status === "Archived");
      return queryMatch && instructorMatch && categoryMatch && typeMatch && progressMatch && enrollmentMatch && completionMatch && tabMatch;
    });
    return filtered.sort((a, b) => {
      if (sortBy === "Course Name") return a.title.localeCompare(b.title);
      if (sortBy === "Progress") return progressFor(b) - progressFor(a);
      if (sortBy === "Recently Enrolled") return b.enrolled.localeCompare(a.enrolled);
      return a.accessed === "Today" ? -1 : b.accessed === "Today" ? 1 : a.title.localeCompare(b.title);
    });
  }, [
    courses,
    completedLessons,
    archivedIds,
    search,
    instructorSearch,
    categoryFilter,
    typeFilter,
    progressFilter,
    enrollmentFilter,
    completionFilter,
    libraryTab,
    sortBy,
  ]);

  const counts: Record<LibraryTab, number> = {
    "All Courses": courses.length,
    "In Progress": courses.filter((course) => statusFor(course) === "In Progress").length,
    "Not Started": courses.filter((course) => statusFor(course) === "Not Started").length,
    Completed: courses.filter((course) => statusFor(course) === "Completed").length,
    Archived: courses.filter((course) => statusFor(course) === "Archived").length,
  };

  const openLesson = (lesson: Lesson, index: number) => {
    const isComplete = completedLessons.includes(lesson.id);
    const nextIndex = allLessons.findIndex((item) => !completedLessons.includes(item.id));
    if (!isComplete && index > nextIndex) {
      setToast("Complete the previous lesson to unlock this activity.");
      return;
    }
    setCurrentLessonId(lesson.id);
    setScreen("player");
    setPlaying(false);
    setPlayerTab("Overview");
  };

  const openLessonForCourse = (course: Course, lesson: Lesson) => {
    const lessons = allLessonsFor(course.id);
    const index = lessons.findIndex((item) => item.id === lesson.id);
    const nextIndex = lessons.findIndex((item) => !completedLessons.includes(item.id));
    if (!completedLessons.includes(lesson.id) && index > nextIndex) {
      setToast("Complete the previous lesson to unlock this activity.");
      return;
    }
    setSelectedCourseId(course.id);
    setCurrentLessonId(lesson.id);
    setScreen("player");
    setPlaying(false);
    setPlayerTab("Overview");
  };

  const continueCourse = (course: Course) => {
    const lessons = allLessonsFor(course.id);
    const next = lessons.find((lesson) => !completedLessons.includes(lesson.id)) ?? lessons[0];
    openLessonForCourse(course, next);
  };

  const completeLesson = () => {
    if (!currentLesson) return;
    const updated = new Set([...completedLessons, currentLesson.id]);
    setCompletedLessons([...updated]);
    setActivity((current) => [`Completed ${currentLesson.title}`, ...current].slice(0, 6));
    setToast("Lesson completed — your course progress has been updated.");
    const allCourseLessonsCompleted = allLessonsFor(selectedCourse.id).every((lesson) => updated.has(lesson.id));
    const finalAssignmentDone = assignments.some(
      (assignment) => assignment.id === "final" && ["Submitted", "Graded"].includes(assignment.status),
    );
    if (allCourseLessonsCompleted && passedQuizIds.includes(selectedCourse.id) && finalAssignmentDone) {
      setScreen("completion");
    }
  };

  const goToNextLesson = () => {
    const next = allLessons[currentLessonIndex + 1];
    if (next) openLesson(next, currentLessonIndex + 1);
    else setScreen("course");
  };

  const startNote = (note?: Note) => {
    if (note) {
      setEditingNoteId(note.id);
      setNoteTitle(note.title);
      setNoteBody(note.body);
      setNotesModal("edit");
    } else {
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteBody("");
      setNotesModal("add");
    }
  };

  const saveNote = () => {
    const cleanTitle = noteTitle.trim();
    const cleanBody = noteBody.trim();
    if (!cleanTitle || !cleanBody) {
      setToast("Add a note title and some note content first.");
      return;
    }
    if (notesModal === "edit" && editingNoteId !== null) {
      setNotes((current) => current.map((note) => note.id === editingNoteId ? { ...note, title: cleanTitle, body: cleanBody, date: "Just now" } : note));
    } else {
      setNotes((current) => [...current, { id: Date.now(), courseId: selectedCourse.id, lessonId: currentLessonId, title: cleanTitle, body: cleanBody, date: "Just now" }]);
    }
    setNotesModal(null);
    setToast("Your note has been saved.");
  };

  const addUploadedFile = () => {
    setUploadedFiles((current) => [...current, `project-submission-${current.length + 1}.pdf`]);
  };

  const submitAssignment = () => {
    setAssignments((current) =>
      current.map((item) => item.id === assignmentId ? { ...item, status: "Submitted" } : item),
    );
    setModal(null);
    setScreen("submission");
    setToast("Assignment submitted successfully.");
  };

  const toggleLike = (discussionId: number) =>
    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === discussionId
          ? { ...discussion, liked: !discussion.liked, likes: discussion.likes + (discussion.liked ? -1 : 1) }
          : discussion,
      ),
    );

  const replyToDiscussion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!discussionReply.trim()) return;
    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === selectedDiscussionId ? { ...discussion, replies: discussion.replies + 1 } : discussion,
      ),
    );
    setDiscussionReply("");
    setToast("Your reply has been posted.");
  };

  const isCourseComplete = (course: Course) =>
    progressFor(course) === 100 &&
    (passedQuizIds.includes(course.id) || course.initialCompleted === course.lessons) &&
    (course.initialCompleted === course.lessons ||
      assignments.some((assignment) => assignment.id === "final" && ["Submitted", "Graded"].includes(assignment.status)));

  const announceCompletion = () => {
    if (isCourseComplete(selectedCourse)) {
      setScreen("completion");
      return;
    }
    setToast("Complete all lessons, the final quiz, and the final assignment to earn your certificate.");
  };

  const archiveCourse = () => {
    setArchivedIds((current) => current.includes(selectedCourse.id) ? current : [...current, selectedCourse.id]);
    setModal(null);
    setToast("Course archived. You can find it in Archived courses.");
    setScreen("library");
    setLibraryTab("Archived");
  };

  const restoreCourse = (course: Course, returnToLibrary = false) => {
    setArchivedIds((current) => current.filter((id) => id !== course.id));
    setModal(null);
    setToast("Course restored to your learning library.");
    if (returnToLibrary) {
      setScreen("library");
      setLibraryTab("All Courses");
    }
  };

  const openResource = (resourceId: string, preview = false) => {
    setSelectedResourceId(resourceId);
    if (preview) setScreen("resource-preview");
    else setToast("Resource action is a frontend preview; no file is downloaded.");
  };

  const beginQuiz = () => {
    setQuizQuestion(0);
    setQuizAnswers({});
    setQuizReview([]);
    setQuizSeconds(900);
    setQuizAttempts((current) => current + 1);
    setScreen("quiz");
  };

  const finishQuiz = () => {
    const score = quizQuestions.reduce(
      (total, question, index) => total + (quizAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    setQuizScore(score);
    if (score >= 2 && !passedQuizIds.includes(selectedCourse.id)) {
      setPassedQuizIds((current) => [...current, selectedCourse.id]);
    }
    setScreen("quiz-results");
    setModal(null);
  };

  const createDiscussion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!title || !body) return;
    const discussion: Discussion = {
      id: Date.now(),
      title,
      author: "Aman Verma",
      initials: "AV",
      body,
      module: String(formData.get("module") ?? modules[0].title),
      replies: 0,
      likes: 0,
      liked: false,
    };
    setDiscussions((current) => [discussion, ...current]);
    setSelectedDiscussionId(discussion.id);
    setModal(null);
    setScreen("discussion");
    setToast("Your discussion has been posted.");
  };

  const openAnnouncement = (id: number) => {
    setSelectedAnnouncementId(id);
    setReadAnnouncementIds((current) => current.includes(id) ? current : [...current, id]);
    setScreen("announcement");
  };

  const openCertificate = () => {
    if (!isCourseComplete(selectedCourse)) {
      setToast("Complete all required course activities before viewing a certificate.");
      return;
    }
    setScreen("certificate");
  };

  const libraryCourseCard = (course: Course) => {
    const progress = progressFor(course);
    const status = statusFor(course);
    return (
      <Panel key={course.id} className={`group overflow-hidden ${view === "list" ? "flex flex-col sm:flex-row" : ""}`}>
        <button
          type="button"
          onClick={() => openCourse(course)}
          className={`relative block overflow-hidden text-left ${view === "list" ? "h-40 sm:h-auto sm:w-56" : "h-44 w-full"} bg-gradient-to-br ${course.gradient}`}
          aria-label={`View ${course.title}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(43,255,255,.2),transparent_35%)]" />
          <div className="absolute -right-7 -top-10 size-44 rounded-full border border-white/10" />
          <div className="absolute right-4 top-4 size-28 rounded-full border border-[#2bffff]/15" />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-bold text-white/75 backdrop-blur">{course.category}</span>
          <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.18em] text-white/50">{course.level} · LearnIsphere</span>
        </button>
        <div className={`p-4 sm:p-5 ${view === "list" ? "flex-1" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <Badge tone={statusTone(status)}>{status}</Badge>
            <button type="button" onClick={() => { setSelectedCourseId(course.id); setModal("more-options"); }} aria-label={`More options for ${course.title}`} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/45 hover:bg-white/[.05]"><MoreHorizontal size={15} /></button>
          </div>
          <button type="button" onClick={() => openCourse(course)} className="mt-3 block text-left text-base font-bold hover:text-[#2bffff]">{course.title}</button>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={course.instructor} initials={course.initials} size="size-7" />
            <span className="text-[10px] text-white/55">{course.instructor}</span>
            <span className="ml-auto text-[9px] text-white/35">{course.type}</span>
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-semibold">
            <span className="text-white/45">Course progress</span>
            <span>{progress}% · {course.initialCompleted || (progress / 100) * course.lessons}/{course.lessons} lessons</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-[#09a8a8] to-[#2bffff] transition-all" style={{ width: `${progress}%` }} /></div>
          <div className="mt-4 grid grid-cols-2 gap-y-2 text-[9px] text-white/40">
            <span>Enrolled {course.enrolled}</span><span className="text-right">Last accessed {course.accessed}</span>
            <span>{course.modules} modules · {course.lessons} lessons</span><span className="text-right">{status === "Archived" ? "Course archived" : status === "Completed" ? "Course complete" : `${course.remaining} left`}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[.07] pt-3">
            <ActionButton onClick={() => status === "Archived" ? restoreCourse(course, true) : status === "Completed" ? openCourse(course, "Overview") : continueCourse(course)} className="flex-1">
              {status === "Archived" ? "Restore Course" : status === "Completed" ? "Review Course" : progress === 0 ? "Start Learning" : "Continue Learning"} <ChevronRight size={14} />
            </ActionButton>
            <ActionButton secondary onClick={() => openCourse(course)}>View Course</ActionButton>
            {status === "Completed" && <button type="button" onClick={() => { setSelectedCourseId(course.id); setScreen("certificate"); }} className="rounded-xl border border-white/10 px-3 text-[10px] font-bold text-[#2bffff]">View Certificate</button>}
            <button type="button" onClick={() => setToast("Course resources are available inside the course. No files are downloaded in this preview.")} className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:bg-white/[.05]" aria-label="Download course resources"><Download size={14} /></button>
          </div>
        </div>
      </Panel>
    );
  };

  const renderLibrary = () => (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2bffff]/70">Student learning space</p>
          <h2 className="mt-2 text-3xl font-bold">My Courses</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">Your learning journey, all in one place. Continue where you left off and achieve your learning goals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton secondary onClick={() => setModal("notifications")} className="relative"><Bell size={14} /> Notifications<span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#2bffff]" /></ActionButton>
          <ActionButton onClick={() => setToast("Course catalogue is not connected in this frontend prototype.")}><Search size={14} /> Explore Courses</ActionButton>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          ["Total enrolled courses", courses.length, BookOpen, "Your learning library, including archived courses"],
          ["Courses in progress", counts["In Progress"], Activity, "Keep your momentum going"],
          ["Completed courses", counts.Completed, CheckCircle2, "Celebrate your achievements"],
          ["Not started", counts["Not Started"], Clock3, "Ready when you are"],
        ] as const).map(([label, count, Icon, note]) => (
          <Panel key={label as string} className="p-4">
            <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><Icon size={17} /></span><span className="text-[9px] font-bold uppercase tracking-wider text-white/30">My learning</span></div>
            <p className="mt-4 text-2xl font-bold">{count as number}</p><p className="mt-0.5 text-[11px] font-semibold">{label as string}</p><p className="mt-1 text-[9px] text-white/40">{note as string}</p>
          </Panel>
        ))}
      </div>
      <div className="border-b border-white/10">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {libraryTabs.map((name) => (
            <button key={name} type="button" onClick={() => setLibraryTab(name)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold ${libraryTab === name ? "border-[#2bffff] text-[#2bffff]" : "border-transparent text-white/45 hover:text-white/80"}`}>
              {name}<span className={`rounded-full px-1.5 py-0.5 text-[9px] ${libraryTab === name ? "bg-[#2bffff]/10" : "bg-white/[.06]"}`}>{counts[name]}</span>
            </button>
          ))}
        </div>
      </div>
      <Panel className="p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative lg:col-span-1"><Search size={14} className="absolute left-3 top-3 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search course name..." className="w-full rounded-xl border border-white/10 bg-white/[.03] py-2.5 pl-9 pr-3 text-[10px] outline-none focus:border-[#2bffff]/40" /></label>
          <label className="relative"><UserRound size={13} className="absolute left-2.5 top-3 text-white/35" /><input value={instructorSearch} onChange={(event) => setInstructorSearch(event.target.value)} placeholder="Search instructor..." className="w-full rounded-xl border border-white/10 bg-white/[.03] py-2.5 pl-8 pr-3 text-[10px] outline-none focus:border-[#2bffff]/40" /></label>
          <select aria-label="Course category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65"><option value="">All categories</option>{[...new Set(courses.map((course) => course.category))].map((category) => <option key={category}>{category}</option>)}</select>
          <select aria-label="Course type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65"><option value="">All course types</option>{[...new Set(courses.map((course) => course.type))].map((type) => <option key={type}>{type}</option>)}</select>
          <select aria-label="Learning progress" value={progressFilter} onChange={(event) => setProgressFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65"><option value="">Any progress</option>{["0–25%", "26–75%", "76–99%", "100%"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Enrolment date" value={enrollmentFilter} onChange={(event) => setEnrollmentFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65"><option value="">Any enrolment date</option><option>This month</option><option>Earlier</option></select>
          <select aria-label="Course completion status" value={completionFilter} onChange={(event) => setCompletionFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65"><option value="">Any completion status</option>{["In Progress", "Not Started", "Completed", "Archived"].map((item) => <option key={item}>{item}</option>)}</select>
          <div className="flex gap-2">
            <select aria-label="Sort courses" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-[10px] text-white/65">{["Recently Accessed", "Recently Enrolled", "Progress", "Course Name"].map((item) => <option key={item}>{item}</option>)}</select>
            <div className="flex rounded-xl border border-white/10 p-1"><button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={`grid size-7 place-items-center rounded-lg ${view === "grid" ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/40"}`}><LayoutDashboard size={14} /></button><button type="button" onClick={() => setView("list")} aria-label="List view" className={`grid size-7 place-items-center rounded-lg ${view === "list" ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/40"}`}><List size={14} /></button></div>
          </div>
        </div>
        <div className="mt-3 flex justify-end"><button type="button" onClick={clearFilters} className="text-[10px] font-bold text-white/45 hover:text-[#2bffff]"><Filter size={12} className="mr-1 inline" /> Clear Filters</button></div>
      </Panel>
      {loading ? (
        <Panel className="grid min-h-56 place-items-center text-center"><div><span className="mx-auto grid size-11 animate-pulse place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><BookOpen size={20} /></span><p className="mt-3 text-sm font-bold">Loading your courses...</p><p className="mt-1 text-[10px] text-white/40">Preparing your learning library.</p></div></Panel>
      ) : filteredCourses.length ? (
        <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>{filteredCourses.map(libraryCourseCard)}</div>
      ) : (
        <Panel className="grid min-h-64 place-items-center border-dashed p-6 text-center"><div className="max-w-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#2bffff]/[.07] text-[#2bffff]"><Search size={21} /></span><h3 className="mt-4 font-bold">{libraryTab === "All Courses" ? "No courses match your filters" : `No ${libraryTab.toLowerCase()} courses`}</h3><p className="mt-2 text-xs text-white/45">Try adjusting your search or filters to find your course.</p><ActionButton onClick={clearFilters} className="mt-4">Clear Filters</ActionButton></div></Panel>
      )}
    </div>
  );

  const renderCourseOverview = () => {
    const completed = completedLessons.filter((id) => id.startsWith(`${selectedCourse.id}-lesson-`)).length;
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([
            ["Total modules", selectedCourse.modules, Layers],
            ["Total lessons", selectedCourse.lessons, BookOpen],
            ["Completed lessons", completed, CheckCircle2],
            ["Remaining lessons", selectedCourse.lessons - completed, Clock3],
          ] as const).map(([label, value, Icon]) => (
            <Panel key={label as string} className="p-4">
              <Icon size={16} className="text-[#2bffff]" />
              <p className="mt-3 text-2xl font-bold">{value as number}</p>
              <p className="mt-1 text-[10px] text-white/45">{label as string}</p>
            </Panel>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.8fr]">
          <div className="space-y-5">
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="font-bold">About this course</h3><p className="mt-2 text-xs leading-relaxed text-white/50">Build practical skills through instructor-led explanations, hands-on lessons, and realistic projects. This learning path takes you from the foundations to confident real-world application.</p></div>
                <button type="button" onClick={() => setModal("more-options")} className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-white/50"><MoreHorizontal size={16} /></button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><h4 className="text-[11px] font-bold text-[#2bffff]">Learning outcomes</h4><ul className="mt-2 space-y-2 text-[10px] text-white/50">{["Explain and apply the core course concepts.", "Build confidence through guided practice.", "Evaluate your work using professional standards.", "Create a final project that demonstrates your skills."].map((item) => <li key={item} className="flex gap-2"><Check size={12} className="shrink-0 text-emerald-300" />{item}</li>)}</ul></div>
                <div><h4 className="text-[11px] font-bold text-[#2bffff]">Skills you will gain</h4><div className="mt-2 flex flex-wrap gap-2">{[selectedCourse.category, "Problem solving", "Project skills", "Communication"].map((item) => <Badge key={item}>{item}</Badge>)}</div></div>
              </div>
            </Panel>
            <Panel>
              <h3 className="font-bold">Course progress</h3>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-4xl font-bold">{selectedProgress}<span className="text-lg text-white/40">%</span></p><p className="mt-1 text-[10px] text-white/40">You’re making steady progress. Keep going!</p></div><ActionButton onClick={() => statusFor(selectedCourse) === "Archived" ? restoreCourse(selectedCourse) : continueCourse(selectedCourse)}><Play size={14} fill="currentColor" /> {statusFor(selectedCourse) === "Archived" ? "Restore Course" : "Continue Learning"}</ActionButton></div>
              <div className="mt-4 h-2 rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-[#078989] to-[#2bffff] transition-all" style={{ width: `${selectedProgress}%` }} /></div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Study time", "8h 35m"], ["Course duration", "14h"], ["Language", selectedCourse.language], ["Last activity", selectedCourse.accessed]].map(([label, value]) => <div key={label}><p className="text-[9px] text-white/35">{label}</p><p className="mt-1 text-[10px] font-semibold">{value}</p></div>)}</div>
            </Panel>
            <Panel>
              <div className="flex items-center justify-between"><div><h3 className="font-bold">Continue where you left off</h3><p className="mt-1 text-[10px] text-white/40">Pick up your current lesson at any time.</p></div><Badge tone="cyan">Next lesson</Badge></div>
              {allLessons.find((lesson) => !completedLessons.includes(lesson.id)) ? (
                <button type="button" onClick={() => continueCourse(selectedCourse)} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/[.08] p-3 text-left hover:border-[#2bffff]/30">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><Play size={16} fill="currentColor" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{allLessons.find((lesson) => !completedLessons.includes(lesson.id))?.title}</span><span className="mt-1 block text-[10px] text-white/40">{allLessons.find((lesson) => !completedLessons.includes(lesson.id))?.duration} · {allLessons.find((lesson) => !completedLessons.includes(lesson.id))?.type}</span></span><ChevronRight size={15} className="text-white/40" />
                </button>
              ) : <p className="mt-4 rounded-xl bg-emerald-400/[.06] p-3 text-xs text-emerald-200">All lessons are complete. Finish the required assessment to earn your certificate.</p>}
            </Panel>
          </div>
          <div className="space-y-5">
            <Panel>
              <div className="flex items-center gap-3"><Avatar name={selectedCourse.instructor} initials={selectedCourse.initials} size="size-12" /><div><p className="text-sm font-bold">{selectedCourse.instructor}</p><p className="mt-1 text-[10px] text-white/40">{selectedCourse.instructorRole}</p></div></div>
              <p className="mt-3 text-[10px] leading-relaxed text-white/45">Learn with an experienced instructor who brings clear explanations and practical examples to every module.</p>
              <button type="button" onClick={() => setToast(`Instructor profile: ${selectedCourse.instructor} · ${selectedCourse.instructorRole}`)} className="mt-3 text-[10px] font-bold text-[#2bffff]">View Instructor <ArrowRight size={12} className="ml-1 inline" /></button>
            </Panel>
            <Panel>
              <h3 className="font-bold">Course information</h3>
              <div className="mt-3 space-y-3">{[["Category", selectedCourse.category], ["Level", selectedCourse.level], ["Course type", selectedCourse.type], ["Duration", "14 hours"], ["Language", selectedCourse.language], ["Enrolled", selectedCourse.enrolled]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-white/[.06] pb-2 last:border-0"><span className="text-[10px] text-white/40">{label}</span><span className="text-right text-[10px] font-semibold">{value}</span></div>)}</div>
            </Panel>
            <Panel>
              <h3 className="font-bold">Recent activity</h3>
              <div className="mt-3 space-y-3">{activity.slice(0, 3).map((item, index) => <div key={`${item}-${index}`} className="flex gap-2.5"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#2bffff]" /><p className="text-[10px] text-white/50">{item}<span className="mt-1 block text-[9px] text-white/30">{index === 0 ? "Today" : `${index + 1} days ago`}</span></p></div>)}</div>
              <button type="button" onClick={() => setScreen("progress")} className="mt-3 text-[10px] font-bold text-[#2bffff]">View learning activity</button>
            </Panel>
          </div>
        </div>
        {isCourseComplete(selectedCourse) && <Panel className="flex flex-wrap items-center justify-between gap-3 border-emerald-300/15 bg-emerald-300/[.04]"><div className="flex items-center gap-3"><Award size={20} className="text-emerald-300" /><div><p className="text-sm font-bold">Course completed</p><p className="mt-1 text-[10px] text-white/45">Your certificate is ready to view.</p></div></div><ActionButton onClick={openCertificate}>View Certificate</ActionButton></Panel>}
      </div>
    );
  };

  const renderCurriculum = () => {
    let lessonOffset = 0;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Course curriculum</h3><p className="mt-1 text-[10px] text-white/40">Complete each lesson to unlock the next activity.</p></div><Badge tone="cyan">{completedLessons.filter((id) => id.startsWith(`${selectedCourse.id}-lesson-`)).length} / {selectedCourse.lessons} lessons complete</Badge></div>
        {modules.map((module) => {
          const startOffset = lessonOffset;
          lessonOffset += module.lessons.length;
          const completedCount = module.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
          const moduleProgress = Math.round((completedCount / module.lessons.length) * 100);
          const unlocked = startOffset <= (firstIncomplete < 0 ? allLessons.length : firstIncomplete);
          const expanded = expandedModules.includes(module.id);
          return (
            <Panel key={module.id} className="overflow-hidden p-0">
              <button type="button" onClick={() => toggleModule(module.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-white/[.02]">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${unlocked ? "bg-[#2bffff]/10 text-[#2bffff]" : "bg-white/[.05] text-white/35"}`}>{unlocked ? <Layers size={15} /> : <LockKeyhole size={15} />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{module.title}</span><span className="mt-1 block text-[10px] text-white/40">{module.description}</span></span>
                <span className="hidden text-right sm:block"><span className="block text-[10px] font-bold">{moduleProgress}%</span><span className="text-[9px] text-white/35">{completedCount}/{module.lessons.length} lessons</span></span>
                {expanded ? <ChevronDown size={16} className="text-white/45" /> : <ChevronRight size={16} className="text-white/45" />}
              </button>
              <div className="mx-4 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[#2bffff]" style={{ width: `${moduleProgress}%` }} /></div>
              {expanded && <div className="space-y-1 p-3 pt-2">{module.lessons.map((lesson) => {
                const index = allLessons.findIndex((item) => item.id === lesson.id);
                const isComplete = completedLessons.includes(lesson.id);
                const locked = !isComplete && index > firstIncomplete;
                const status = isComplete ? "Completed" : locked ? "Locked" : index === firstIncomplete ? "In Progress" : "Not Started";
                return (
                  <button key={lesson.id} type="button" onClick={() => openLesson(lesson, index)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${lesson.id === currentLessonId ? "border border-[#2bffff]/20 bg-[#2bffff]/[.06]" : "hover:bg-white/[.03]"}`}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${isComplete ? "bg-emerald-400/10 text-emerald-300" : locked ? "bg-white/[.04] text-white/30" : "bg-white/[.05] text-[#2bffff]"}`}>{isComplete ? <Check size={14} /> : locked ? <LockKeyhole size={13} /> : lessonIcon(lesson.type)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{lesson.title}</span><span className="mt-1 block text-[9px] text-white/40">{lesson.type} · {lesson.duration}</span></span>
                    <Badge tone={isComplete ? "green" : status === "In Progress" ? "cyan" : locked ? "neutral" : "neutral"}>{status}</Badge>
                  </button>
                );
              })}</div>}
            </Panel>
          );
        })}
      </div>
    );
  };

  const renderResources = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Learning resources</h3><p className="mt-1 text-[10px] text-white/40">Reference files and materials shared by your instructor.</p></div><ActionButton secondary onClick={() => setToast("Resource download is a frontend preview; files are not downloaded.")}><Download size={14} /> Download available resources</ActionButton></div>
      {courseResources.length ? <div className="grid gap-3 md:grid-cols-2">{courseResources.map((resource) => <Panel key={resource.id} className="flex items-center gap-3 p-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]">{resource.type === "Source code" ? <Layers size={18} /> : resource.type === "Presentation" ? <FileText size={18} /> : <FileText size={18} />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{resource.name}</p><p className="mt-1 truncate text-[9px] text-white/40">{resource.type} · {resource.size} · {resource.lesson}</p><p className="mt-1 text-[9px] text-white/30">Published {resource.published}</p></div><div className="flex gap-1"><button type="button" onClick={() => openResource(resource.id, true)} aria-label={`Preview ${resource.name}`} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/55 hover:text-[#2bffff]"><Eye size={14} /></button><button type="button" onClick={() => openResource(resource.id)} aria-label={`Download ${resource.name}`} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/55 hover:text-[#2bffff]"><Download size={14} /></button></div></Panel>)}</div> : <Panel className="p-8 text-center text-xs text-white/45">No resources are available for this course yet.</Panel>}
    </div>
  );

  const renderAssignments = () => {
    const tabs = ["All Assignments", "Upcoming", "Pending", "Submitted", "Graded"];
    const list = assignments.filter((assignment) =>
      assignmentTab === "All Assignments" ||
      (assignmentTab === "Upcoming" && assignment.status === "Pending") ||
      assignmentTab === assignment.status,
    );
    return (
      <div className="space-y-4">
        <div><h3 className="font-bold">Assignments</h3><p className="mt-1 text-[10px] text-white/40">Practice what you learn and get feedback from your instructor.</p></div>
        <div className="flex gap-2 overflow-auto scrollbar-none">{tabs.map((name) => <button key={name} type="button" onClick={() => setAssignmentTab(name)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-bold ${assignmentTab === name ? "bg-[#2bffff] text-black" : "border border-white/10 text-white/45"}`}>{name}</button>)}</div>
        {list.length ? <div className="space-y-3">{list.map((assignment) => <Panel key={assignment.id} className="flex flex-wrap items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><FileText size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold">{assignment.title}</p><p className="mt-1 text-[10px] text-white/40">{assignment.module} · {assignment.lesson}</p><p className="mt-1 text-[9px] text-white/35">Due {assignment.due} · {selectedCourse.instructor}</p></div><Badge tone={assignment.status === "Graded" ? "green" : assignment.status === "Overdue" ? "red" : assignment.status === "Submitted" ? "cyan" : "amber"}>{assignment.status}</Badge>{assignment.marks && <span className="text-[10px] font-bold">{assignment.marks}</span>}<ActionButton secondary onClick={() => { setAssignmentId(assignment.id); setScreen("assignment"); }}>{assignment.status === "Graded" ? "View Feedback" : assignment.status === "Submitted" ? "View Submission" : "View Assignment"} <ChevronRight size={13} /></ActionButton></Panel>)}</div> : <Panel className="p-8 text-center"><FileText size={20} className="mx-auto text-white/30" /><p className="mt-3 text-xs font-bold">No {assignmentTab.toLowerCase()} assignments</p><p className="mt-1 text-[10px] text-white/40">New assignment activities will appear here.</p></Panel>}
      </div>
    );
  };

  const renderAssignmentDetail = () => {
    if (!currentAssignment) return null;
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <button type="button" onClick={() => { setScreen("course"); setCourseTab("Assignments"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Assignments</button>
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Assignment details</p><h2 className="mt-2 text-xl font-bold">{currentAssignment.title}</h2><p className="mt-1 text-[10px] text-white/40">{currentAssignment.module} · {currentAssignment.lesson}</p></div><Badge tone={currentAssignment.status === "Graded" ? "green" : currentAssignment.status === "Submitted" ? "cyan" : currentAssignment.status === "Overdue" ? "red" : "amber"}>{currentAssignment.status}</Badge></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Due date", currentAssignment.due], ["Maximum marks", "20 marks"], ["Passing marks", "12 marks"]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.07] p-3"><p className="text-[9px] uppercase text-white/35">{label}</p><p className="mt-1.5 text-xs font-bold">{value}</p></div>)}</div>
          <div className="mt-5 space-y-4">
            <section><h3 className="text-xs font-bold">Instructions</h3><p className="mt-2 text-[11px] leading-relaxed text-white/50">Create a reusable solution that demonstrates the concepts covered in this module. Explain the decisions you made, show how your work handles common edge cases, and include a short reflection on what you would improve next.</p></section>
            <section><h3 className="text-xs font-bold">Learning objectives</h3><ul className="mt-2 space-y-1.5 text-[10px] text-white/50">{["Apply the module’s core concepts in a practical task.", "Communicate your design choices clearly.", "Review your work against the course requirements."].map((item) => <li key={item} className="flex gap-2"><Check size={12} className="text-[#2bffff]" />{item}</li>)}</ul></section>
            <section className="rounded-xl border border-white/[.07] p-3"><h3 className="text-[11px] font-bold">Reference files</h3><button type="button" onClick={() => openResource("starter")} className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-[#2bffff]"><Paperclip size={13} /> Project starter files.zip · 840 KB</button></section>
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] p-3 text-[10px] text-amber-200">Submission requirements: upload a PDF, DOCX, ZIP or image file up to 25 MB. Late submissions may require instructor approval.</div>
          </div>
          {currentAssignment.status === "Graded" ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.05] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">Graded assignment</h3><Badge tone="green">{currentAssignment.marks}</Badge></div>
              <p className="mt-3 text-[10px] text-white/40">Evaluated Nov 10, 2026 · Resubmission allowed</p>
              <p className="mt-3 text-xs leading-relaxed text-white/60">{currentAssignment.feedback}</p>
            </div>
          ) : currentAssignment.status === "Submitted" ? (
            <div className="mt-5 rounded-xl border border-[#2bffff]/15 bg-[#2bffff]/[.05] p-4"><p className="text-xs font-bold">Submission received</p><p className="mt-1 text-[10px] text-white/45">Submitted just now · {uploadedFiles.length} file(s) attached · Awaiting instructor feedback.</p></div>
          ) : (
            <div className="mt-6 space-y-4 border-t border-white/[.08] pt-5">
              <div><label htmlFor="assignment-answer" className="text-xs font-bold">Your answer</label><textarea id="assignment-answer" value={assignmentAnswer} onChange={(event) => setAssignmentAnswer(event.target.value)} rows={5} placeholder="Write your response or explain your approach..." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs outline-none placeholder:text-white/30 focus:border-[#2bffff]/40" /></div>
              <div><p className="text-xs font-bold">Attach your work</p><label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[.02] p-4 text-center hover:border-[#2bffff]/40"><Upload size={19} className="text-[#2bffff]" /><span className="mt-2 text-[10px] font-semibold">Choose a file or drop it here</span><span className="mt-1 text-[9px] text-white/35">PDF, DOCX, ZIP or image · Max 25 MB</span><input type="file" accept=".pdf,.docx,.zip,.png,.jpg" className="sr-only" onChange={(event) => { const name = event.target.files?.[0]?.name; if (name) setUploadedFiles((current) => [...current, name]); }} /></label>
                <button type="button" onClick={addUploadedFile} className="mt-2 text-[9px] font-bold text-[#2bffff]">Add sample file (prototype)</button>
                {uploadedFiles.map((name, index) => <div key={`${name}-${index}`} className="mt-2 flex items-center gap-2 rounded-lg bg-white/[.03] p-2 text-[10px]"><FileText size={13} className="text-[#2bffff]" /><span className="flex-1">{name}</span><button type="button" onClick={() => setUploadedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${name}`}><X size={13} /></button></div>)}
              </div>
              <div><label htmlFor="submission-notes" className="text-xs font-bold">Submission notes</label><textarea id="submission-notes" value={assignmentNotes} onChange={(event) => setAssignmentNotes(event.target.value)} rows={2} placeholder="Add a note for your instructor (optional)" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs outline-none placeholder:text-white/30 focus:border-[#2bffff]/40" /></div>
              <div className="flex flex-wrap justify-end gap-2"><ActionButton secondary onClick={() => setScreen("course")}>Save Draft</ActionButton><ActionButton onClick={() => setModal("submit-assignment")} disabled={!assignmentAnswer.trim() && uploadedFiles.length === 0}>Submit Assignment <ArrowRight size={14} /></ActionButton></div>
            </div>
          )}
        </Panel>
      </div>
    );
  };

  const renderQuizList = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-bold">Quizzes & assessments</h3><p className="mt-1 text-[10px] text-white/40">Check your understanding and track your assessment progress.</p></div><Badge tone={passedQuizIds.includes(selectedCourse.id) ? "green" : "cyan"}>{passedQuizIds.includes(selectedCourse.id) ? "1 assessment passed" : "1 quiz available"}</Badge></div>
      <div className="grid gap-3 md:grid-cols-2">
        {[{ id: "knowledge", title: "Core Concepts Knowledge Check", module: "Module 02 — Core Concepts", questions: 10, time: "15 minutes", due: "No due date", status: passedQuizIds.includes(selectedCourse.id) ? "Completed" : "Available" }, { id: "final-quiz", title: "Final Course Assessment", module: "Module 04 — Final Assessment", questions: 20, time: "30 minutes", due: "Nov 28, 2026", status: passedQuizIds.includes(selectedCourse.id) ? "Passed" : "Upcoming" }].map((quiz) => (
          <Panel key={quiz.id} className="p-4">
            <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><CircleHelp size={18} /></span><Badge tone={quiz.status === "Passed" || quiz.status === "Completed" ? "green" : quiz.status === "Available" ? "cyan" : "amber"}>{quiz.status}</Badge></div>
            <h4 className="mt-4 text-sm font-bold">{quiz.title}</h4><p className="mt-1 text-[10px] text-white/40">{quiz.module}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] text-white/45"><span>{quiz.questions} questions</span><span>{quiz.time}</span><span>Passing score 70%</span><span>Attempts {quizAttempts}/3</span></div>
            <div className="mt-4 flex gap-2">{quiz.status === "Passed" || quiz.status === "Completed" ? <ActionButton secondary onClick={() => { setScreen("quiz-results"); setShowQuizReview(true); }}>Review Results</ActionButton> : <ActionButton onClick={() => setScreen("quiz-instructions")}>{quiz.status === "Upcoming" ? "View Instructions" : "Start Quiz"} <ChevronRight size={13} /></ActionButton>}<button type="button" onClick={() => setScreen("quiz-instructions")} className="rounded-xl border border-white/10 px-3 text-[10px] font-bold text-white/55">Details</button></div>
          </Panel>
        ))}
      </div>
    </div>
  );

  const renderQuizInstructions = () => (
    <div className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={() => { setScreen("course"); setCourseTab("Quizzes"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Quizzes</button>
      <Panel className="p-5 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Quiz instructions</p><h2 className="mt-2 text-2xl font-bold">Core Concepts Knowledge Check</h2><p className="mt-2 text-xs text-white/45">{selectedCourse.title} · Module 02 — Core Concepts</p>
        <p className="mt-5 text-xs leading-relaxed text-white/55">This quiz checks your understanding of the core concepts from this course. Read each question carefully and select the best answer. You may move between questions before submitting.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Questions", "3 sample questions"], ["Time limit", "15 minutes"], ["Passing score", "70%"], ["Attempts remaining", `${Math.max(0, 3 - quizAttempts)} of 3`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.08] p-3"><p className="text-[9px] uppercase text-white/35">{label}</p><p className="mt-1.5 text-xs font-bold">{value}</p></div>)}</div>
        <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[.05] p-3 text-[10px] text-amber-100">Once started, the timer begins. Your progress is kept in this prototype while you remain on this screen.</div>
        <div className="mt-5 flex flex-wrap gap-2"><ActionButton onClick={beginQuiz} disabled={quizAttempts >= 3}>Start Quiz <ArrowRight size={14} /></ActionButton><ActionButton secondary onClick={() => { setScreen("course"); setCourseTab("Curriculum"); }}>Review Curriculum</ActionButton></div>
      </Panel>
    </div>
  );

  const renderQuiz = () => {
    const question = quizQuestions[quizQuestion];
    const formatTimer = `${Math.floor(quizSeconds / 60).toString().padStart(2, "0")}:${(quizSeconds % 60).toString().padStart(2, "0")}`;
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Assessment in progress</p><h2 className="mt-1 text-xl font-bold">Core Concepts Knowledge Check</h2></div><Badge tone={quizSeconds < 60 ? "red" : "cyan"}><Clock3 size={12} /> {formatTimer} remaining</Badge></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between"><Badge>Question {quizQuestion + 1} of {quizQuestions.length}</Badge><button type="button" onClick={() => setQuizReview((current) => current.includes(quizQuestion) ? current.filter((index) => index !== quizQuestion) : [...current, quizQuestion])} className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${quizReview.includes(quizQuestion) ? "text-amber-300" : "text-white/45"}`}><Flag size={13} /> {quizReview.includes(quizQuestion) ? "Marked for review" : "Mark for Review"}</button></div>
            <h3 className="mt-6 text-lg font-bold leading-relaxed">{question.question}</h3>
            <div className="mt-5 space-y-2">{question.options.map((option, index) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition ${quizAnswers[quizQuestion] === option ? "border-[#2bffff]/35 bg-[#2bffff]/[.07]" : "border-white/[.08] hover:bg-white/[.03]"}`}><input type="radio" name={`question-${quizQuestion}`} checked={quizAnswers[quizQuestion] === option} onChange={() => setQuizAnswers((current) => ({ ...current, [quizQuestion]: option }))} className="accent-[#2bffff]" /><span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/[.05] text-[10px] font-bold text-white/50">{String.fromCharCode(65 + index)}</span>{option}</label>)}</div>
            <div className="mt-6 flex justify-between border-t border-white/[.08] pt-4"><ActionButton secondary onClick={() => setQuizQuestion((index) => Math.max(0, index - 1))} disabled={quizQuestion === 0}><ChevronLeft size={14} /> Previous Question</ActionButton>{quizQuestion < quizQuestions.length - 1 ? <ActionButton onClick={() => setQuizQuestion((index) => index + 1)}>Next Question <ChevronRight size={14} /></ActionButton> : <ActionButton onClick={() => setModal("submit-quiz")}>Submit Quiz <Check size={14} /></ActionButton>}</div>
          </Panel>
          <Panel>
            <h3 className="text-xs font-bold">Question navigator</h3><div className="mt-3 grid grid-cols-3 gap-2">{quizQuestions.map((_, index) => <button key={index} type="button" onClick={() => setQuizQuestion(index)} className={`relative grid size-10 place-items-center rounded-xl border text-[11px] font-bold ${quizQuestion === index ? "border-[#2bffff] bg-[#2bffff]/10 text-[#2bffff]" : quizAnswers[index] ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/55"}`}>{index + 1}{quizReview.includes(index) && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-300" />}</button>)}</div>
            <div className="mt-4 space-y-2 border-t border-white/[.08] pt-4 text-[9px] text-white/45"><p className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-300" /> Answered</p><p className="flex items-center gap-2"><span className="size-2 rounded-full border border-white/35" /> Unanswered</p><p className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-300" /> Marked for review</p></div>
            <button type="button" onClick={() => setModal("submit-quiz")} className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-[10px] font-bold text-white/60 hover:bg-white/[.04]">Submit Quiz</button>
          </Panel>
        </div>
      </div>
    );
  };

  const renderQuizResults = () => {
    const passed = quizScore >= 2 || passedQuizIds.includes(selectedCourse.id);
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Panel className="p-6 text-center sm:p-9">
          <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${passed ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{passed ? <CheckCircle2 size={26} /> : <CircleHelp size={26} />}</span>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Quiz results</p><h2 className="mt-2 text-2xl font-bold">{passed ? "Great work — you passed!" : "Keep practicing and try again"}</h2><p className="mt-2 text-xs text-white/45">Core Concepts Knowledge Check · {selectedCourse.title}</p>
          <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">{[["Score", `${quizScore}/${quizQuestions.length}`], ["Percentage", `${Math.round((quizScore / quizQuestions.length) * 100)}%`], ["Result", passed ? "Pass" : "Not passed"], ["Time taken", `${Math.max(1, Math.round((900 - quizSeconds) / 60))} min`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.08] p-3"><p className="text-[9px] text-white/35">{label}</p><p className="mt-1.5 text-sm font-bold">{value}</p></div>)}</div>
          <p className="mt-5 text-[10px] text-white/40">Correct answers: {quizScore} · Incorrect or unanswered: {quizQuestions.length - quizScore}. Results are a frontend prototype.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2"><ActionButton onClick={() => { setShowQuizReview(true); setScreen("quiz-results"); }}>Review Answers</ActionButton>{!passed && quizAttempts < 3 && <ActionButton secondary onClick={() => setScreen("quiz-instructions")}>Retry Quiz</ActionButton>}<ActionButton secondary onClick={() => { setScreen("course"); setCourseTab("Quizzes"); }}>Back to Course</ActionButton>{isCourseComplete(selectedCourse) && <ActionButton secondary onClick={() => setScreen("certificate")}>View Certificate</ActionButton>}</div>
        </Panel>
        {showQuizReview && <Panel><div className="flex items-center justify-between"><h3 className="font-bold">Answer review</h3><button type="button" onClick={() => setShowQuizReview(false)} aria-label="Close answer review" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div><div className="mt-4 space-y-3">{quizQuestions.map((item, index) => <div key={index} className="rounded-xl border border-white/[.07] p-3"><p className="text-[11px] font-bold">{index + 1}. {item.question}</p><p className="mt-2 text-[10px] text-white/45">Your answer: {quizAnswers[index] ?? "Not answered"}</p><p className="mt-1 text-[10px] text-emerald-300">Correct answer: {item.answer}</p></div>)}</div></Panel>}
      </div>
    );
  };

  const renderAnnouncements = () => {
    const unreadCount = sampleAnnouncements.filter((announcement) => !readAnnouncementIds.includes(announcement.id)).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><div><h3 className="font-bold">Course announcements</h3><p className="mt-1 text-[10px] text-white/40">Updates and notes from your instructor.</p></div>{unreadCount > 0 && <Badge tone="cyan">{unreadCount} unread</Badge>}</div>
        <div className="space-y-3">{sampleAnnouncements.map((announcement) => {
          const read = readAnnouncementIds.includes(announcement.id);
          return <button key={announcement.id} type="button" onClick={() => openAnnouncement(announcement.id)} className="flex w-full items-start gap-3 rounded-[20px] border border-white/10 bg-white/[.02] p-4 text-left hover:border-[#2bffff]/25 hover:bg-white/[.035]"><Avatar name={announcement.instructor} initials={announcement.initials} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-xs font-bold">{announcement.title}{!read && <span className="size-1.5 rounded-full bg-[#2bffff]" />}</span><span className="mt-1 block text-[10px] text-white/45">{announcement.instructor} · {announcement.date}</span><span className="mt-2 line-clamp-2 block text-[10px] leading-relaxed text-white/50">{announcement.body}</span></span><ChevronRight size={15} className="mt-1 text-white/40" /></button>;
        })}</div>
      </div>
    );
  };

  const renderDiscussions = () => {
    const filteredDiscussions = discussions.filter((discussion) => `${discussion.title} ${discussion.body} ${discussion.author}`.toLowerCase().includes(discussionSearch.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-bold">Course discussions</h3><p className="mt-1 text-[10px] text-white/40">Ask questions, share ideas, and learn with your cohort.</p></div><ActionButton onClick={() => setModal("create-discussion")}><Plus size={14} /> Create Discussion</ActionButton></div>
        <label className="relative block"><Search size={14} className="absolute left-3 top-3 text-white/35" /><input value={discussionSearch} onChange={(event) => setDiscussionSearch(event.target.value)} placeholder="Search discussions..." className="w-full rounded-xl border border-white/10 bg-white/[.03] py-2.5 pl-9 pr-3 text-[10px] outline-none focus:border-[#2bffff]/40" /></label>
        {filteredDiscussions.length ? <div className="space-y-3">{filteredDiscussions.map((discussion) => <Panel key={discussion.id} className="p-4"><div className="flex items-start gap-3"><Avatar name={discussion.author} initials={discussion.initials} /><div className="min-w-0 flex-1"><button type="button" onClick={() => { setSelectedDiscussionId(discussion.id); setScreen("discussion"); }} className="text-left text-xs font-bold hover:text-[#2bffff]">{discussion.title}</button><p className="mt-1 text-[9px] text-white/40">{discussion.author} · 2 days ago · {discussion.module}</p><p className="mt-3 text-[10px] leading-relaxed text-white/55">{discussion.body}</p><div className="mt-3 flex gap-4"><button type="button" onClick={() => toggleLike(discussion.id)} className={`text-[9px] font-bold ${discussion.liked ? "text-[#2bffff]" : "text-white/40"}`}>♥ {discussion.likes} likes</button><button type="button" onClick={() => { setSelectedDiscussionId(discussion.id); setScreen("discussion"); }} className="text-[9px] font-bold text-white/45"><MessageSquare size={11} className="mr-1 inline" />{discussion.replies} replies</button></div></div><button type="button" onClick={() => { setSelectedDiscussionId(discussion.id); setScreen("discussion"); }} aria-label="Open discussion" className="text-white/35"><ChevronRight size={15} /></button></div></Panel>)}</div> : <Panel className="p-8 text-center"><MessageSquare size={20} className="mx-auto text-white/30" /><p className="mt-3 text-xs font-bold">No discussions found</p><p className="mt-1 text-[10px] text-white/40">Start a conversation with your course community.</p><ActionButton onClick={() => setModal("create-discussion")} className="mt-4"><Plus size={13} /> Create Discussion</ActionButton></Panel>}
      </div>
    );
  };

  const renderCourse = () => (
    <div className="space-y-5">
      <button type="button" onClick={() => setScreen("library")} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to My Courses</button>
      <Panel className="relative overflow-hidden p-0">
        <div className={`relative flex min-h-56 flex-col justify-end overflow-hidden bg-gradient-to-br ${selectedCourse.gradient} p-5 sm:min-h-64 sm:p-8`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(43,255,255,.2),transparent_35%)]" /><div className="absolute -right-10 -top-20 size-72 rounded-full border border-white/10" />
          <div className="relative flex flex-wrap items-end justify-between gap-4"><div className="max-w-3xl"><div className="flex flex-wrap gap-2"><Badge tone="cyan">{selectedCourse.category}</Badge><Badge>{selectedCourse.level}</Badge><Badge tone={statusTone(statusFor(selectedCourse))}>{statusFor(selectedCourse)}</Badge></div><h2 className="mt-4 text-2xl font-bold sm:text-3xl">{selectedCourse.title}</h2><p className="mt-2 text-xs text-white/60">{selectedCourse.type} · Enrolled {selectedCourse.enrolled} · {selectedCourse.language}</p><div className="mt-4 flex items-center gap-2"><Avatar name={selectedCourse.instructor} initials={selectedCourse.initials} /><span><span className="block text-[11px] font-bold">{selectedCourse.instructor}</span><span className="mt-0.5 block text-[9px] text-white/45">{selectedCourse.instructorRole}</span></span></div></div><div className="flex flex-wrap gap-2"><ActionButton onClick={() => statusFor(selectedCourse) === "Archived" ? restoreCourse(selectedCourse) : statusFor(selectedCourse) === "Completed" ? setCourseTab("Overview") : continueCourse(selectedCourse)}><Play size={14} fill="currentColor" /> {statusFor(selectedCourse) === "Archived" ? "Restore Course" : statusFor(selectedCourse) === "Completed" ? "Review Course" : "Continue Learning"}</ActionButton><ActionButton secondary onClick={() => setCourseTab("Curriculum")}>View Curriculum</ActionButton><div className="relative"><button type="button" onClick={() => setMoreOpen((open) => !open)} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-black/20 text-white/75"><MoreHorizontal size={17} /></button>{moreOpen && <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-white/10 bg-[#071314] p-1 shadow-xl">{["Download available resources", "View course information", "Contact instructor", "Report a course issue", ...(statusFor(selectedCourse) === "Completed" ? [] : [statusFor(selectedCourse) === "Archived" ? "Restore course" : "Archive course"])].map((option) => <button key={option} type="button" onClick={() => { setMoreOpen(false); if (option === "Archive course") setModal("archive"); else if (option === "Restore course") restoreCourse(selectedCourse); else if (option === "Download available resources") setToast("Resource download is a frontend preview."); else if (option === "View course information") setToast(`${selectedCourse.title} · ${selectedCourse.level} · ${selectedCourse.language}`); else if (option === "Contact instructor") setToast(`Message composer for ${selectedCourse.instructor} is a frontend preview.`); else setToast("Issue report form is a frontend preview."); }} className="block w-full rounded-lg px-3 py-2 text-left text-[10px] text-white/65 hover:bg-white/[.05]">{option}</button>)}</div>}</div></div></div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {[["Course progress", `${selectedProgress}%`], ["Lessons completed", `${completedLessons.filter((id) => id.startsWith(`${selectedCourse.id}-lesson-`)).length} / ${selectedCourse.lessons}`], ["Enrolment status", statusFor(selectedCourse)], ["Last accessed", selectedCourse.accessed]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.07] p-3"><p className="text-[9px] uppercase text-white/35">{label}</p><p className="mt-1.5 truncate text-[11px] font-bold">{value}</p></div>)}
        </div>
      </Panel>
      <div className="border-b border-white/10"><div className="flex gap-1 overflow-x-auto scrollbar-none">{courseTabs.map((name) => <button key={name} type="button" onClick={() => setCourseTab(name)} className={`shrink-0 border-b-2 px-3 py-3 text-[10px] font-bold ${courseTab === name ? "border-[#2bffff] text-[#2bffff]" : "border-transparent text-white/45 hover:text-white/80"}`}>{name}{name === "Announcements" && sampleAnnouncements.filter((announcement) => !readAnnouncementIds.includes(announcement.id)).length > 0 && <span className="ml-1 inline-block size-1.5 rounded-full bg-[#2bffff]" />}</button>)}</div></div>
      {courseTab === "Overview" && renderCourseOverview()}
      {courseTab === "Curriculum" && renderCurriculum()}
      {courseTab === "Resources" && renderResources()}
      {courseTab === "Assignments" && renderAssignments()}
      {courseTab === "Quizzes" && renderQuizList()}
      {courseTab === "Announcements" && renderAnnouncements()}
      {courseTab === "Discussions" && renderDiscussions()}
    </div>
  );

  const renderAnnouncement = () => (
    <div className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={() => { setScreen("course"); setCourseTab("Announcements"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Announcements</button>
      <Panel className="p-5 sm:p-8"><Badge tone="cyan">Course announcement</Badge><h2 className="mt-4 text-2xl font-bold">{selectedAnnouncement.title}</h2><div className="mt-4 flex items-center gap-3"><Avatar name={selectedAnnouncement.instructor} initials={selectedAnnouncement.initials} /><div><p className="text-[11px] font-bold">{selectedAnnouncement.instructor}</p><p className="mt-1 text-[9px] text-white/40">{selectedAnnouncement.date} · Instructor</p></div></div><p className="mt-6 text-sm leading-relaxed text-white/65">{selectedAnnouncement.body}</p><div className="mt-6 rounded-xl border border-white/[.07] p-3"><p className="text-[10px] font-bold">Attached materials</p><button type="button" onClick={() => { setCourseTab("Resources"); setScreen("course"); }} className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold text-[#2bffff]"><Paperclip size={12} /> Course resource pack <ChevronRight size={12} /></button></div><p className="mt-5 text-[9px] text-white/35">Read status: {readAnnouncementIds.includes(selectedAnnouncement.id) ? "Read" : "Unread"}</p></Panel>
    </div>
  );

  const renderDiscussionDetail = () => (
    <div className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={() => { setScreen("course"); setCourseTab("Discussions"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Discussions</button>
      <Panel className="p-5"><div className="flex items-start gap-3"><Avatar name={selectedDiscussion.author} initials={selectedDiscussion.initials} /><div className="flex-1"><h2 className="text-lg font-bold">{selectedDiscussion.title}</h2><p className="mt-1 text-[9px] text-white/40">{selectedDiscussion.author} · 2 days ago · {selectedDiscussion.module}</p></div></div><p className="mt-5 text-xs leading-relaxed text-white/60">{selectedDiscussion.body}</p><div className="mt-4 flex gap-4"><button type="button" onClick={() => toggleLike(selectedDiscussion.id)} className={`text-[10px] font-bold ${selectedDiscussion.liked ? "text-[#2bffff]" : "text-white/45"}`}>♥ {selectedDiscussion.likes} likes</button><span className="text-[10px] text-white/40">{selectedDiscussion.replies} replies</span></div></Panel>
      <Panel><h3 className="font-bold">Replies</h3><div className="mt-4 space-y-3"><div className="flex gap-3"><Avatar name="Vikram Joshi" initials="VJ" size="size-8" /><div className="flex-1 rounded-xl bg-white/[.03] p-3"><div className="flex justify-between"><p className="text-[10px] font-bold">Vikram Joshi <Badge tone="cyan">Instructor</Badge></p><span className="text-[9px] text-white/35">Yesterday</span></div><p className="mt-2 text-[10px] leading-relaxed text-white/55">Start with the component that owns the state. Lift it only when another part of the interface needs to coordinate with it.</p></div></div><div className="flex gap-3"><Avatar name="Priya Sharma" initials="PS" size="size-8" /><div className="flex-1 rounded-xl bg-white/[.03] p-3"><p className="text-[10px] font-bold">Priya Sharma</p><p className="mt-2 text-[10px] leading-relaxed text-white/55">That helped clarify it for me. Thanks for sharing!</p></div></div></div>
        <form onSubmit={replyToDiscussion} className="mt-5 border-t border-white/[.08] pt-4"><label htmlFor="discussion-reply" className="text-[11px] font-bold">Post a reply</label><textarea id="discussion-reply" value={discussionReply} onChange={(event) => setDiscussionReply(event.target.value)} rows={3} placeholder="Share a helpful response..." className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs outline-none focus:border-[#2bffff]/40" /><div className="mt-2 flex justify-end"><ActionButton disabled={!discussionReply.trim()} onClick={() => { if (discussionReply.trim()) { setDiscussions((current) => current.map((item) => item.id === selectedDiscussionId ? { ...item, replies: item.replies + 1 } : item)); setDiscussionReply(""); setToast("Your reply has been posted."); } }}>Post Reply <Send size={13} /></ActionButton></div></form>
      </Panel>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]">Learning analytics</p><h2 className="mt-1 text-2xl font-bold">Course progress</h2></div><button type="button" onClick={() => setScreen("course")} className="inline-flex items-center gap-2 text-xs font-bold text-white/50"><ArrowLeft size={14} /> Back to Course</button></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Overall progress", `${selectedProgress}%`, Target], ["Study time", "8h 35m", Clock3], ["Quiz performance", passedQuizIds.includes(selectedCourse.id) ? "86%" : "Not graded", CircleHelp], ["Assignment status", assignments.find((assignment) => assignment.id === "final")?.status ?? "Pending", FileText]].map(([label, value, Icon]) => <Panel key={label as string} className="p-4"><Icon size={16} className="text-[#2bffff]" /><p className="mt-3 text-xl font-bold">{value as string}</p><p className="mt-1 text-[10px] text-white/40">{label as string}</p></Panel>)}</div>
      <div className="grid gap-5 lg:grid-cols-2"><Panel><h3 className="font-bold">Module completion</h3><div className="mt-4 space-y-4">{modules.map((module) => { const complete = module.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length; const value = Math.round((complete / module.lessons.length) * 100); return <div key={module.id}><div className="flex justify-between text-[10px]"><span>{module.title}</span><span className="text-white/45">{value}%</span></div><div className="mt-2 h-1.5 rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-[#2bffff]" style={{ width: `${value}%` }} /></div></div>; })}</div></Panel><Panel><h3 className="font-bold">Weekly study time</h3><p className="mt-1 text-[10px] text-white/40">Hours spent learning this week</p><div className="mt-6 flex h-36 items-end gap-3 border-b border-white/10 pb-2">{[1.2, 2.4, 1.6, 3.2, 2.1, 3.8, 1.4].map((hours, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><span className="text-[8px] text-white/35">{hours}h</span><div className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-[#087f7f] to-[#2bffff]" style={{ height: `${hours / 4 * 100}%` }} /><span className="text-[8px] text-white/35">{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div></Panel></div>
      <Panel><h3 className="font-bold">Learning activity</h3><div className="mt-4 space-y-3">{activity.map((item, index) => <div key={`${item}-${index}`} className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-[#2bffff]" /><div><p className="text-[11px]">{item}</p><p className="mt-1 text-[9px] text-white/35">{index === 0 ? "Today" : `${index + 1} days ago`}</p></div></div>)}</div></Panel>
    </div>
  );

  const renderPlayer = () => {
    if (!currentLesson) return null;
    const lessonComplete = completedLessons.includes(currentLesson.id);
    const lessonNotes = notes.filter((note) => note.courseId === selectedCourse.id && note.lessonId === currentLesson.id);
    return (
      <div className={`space-y-4 ${fullscreen ? "fixed inset-0 z-[70] overflow-y-auto bg-[#020707] p-3 sm:p-5" : ""}`}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#2bffff] text-black"><Sparkles size={17} /></span><div><p className="text-[11px] font-bold">Learn<span className="text-[#2bffff]">Isphere</span></p><p className="mt-1 max-w-60 truncate text-[9px] text-white/40">{selectedCourse.title}</p></div></div>
          <div className="hidden min-w-36 flex-1 items-center gap-2 sm:flex"><span className="text-[9px] text-white/40">Course progress</span><div className="h-1.5 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#2bffff]" style={{ width: `${selectedProgress}%` }} /></div><span className="text-[9px] font-bold text-[#2bffff]">{selectedProgress}%</span></div>
          <div className="flex items-center gap-2"><button type="button" onClick={() => setScreen("course")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold text-white/65"><ArrowLeft size={13} /> Back to Course</button><Avatar name="Aman Verma" initials="AV" size="size-8" /></div>
        </header>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <Panel className="p-3 sm:p-4">
              <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#082c2d] via-[#111924] to-[#271d3d]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(43,255,255,.18),transparent_40%)]" /><div className="absolute -right-10 -top-20 size-64 rounded-full border border-white/10" /><div className="absolute -right-2 top-8 size-40 rounded-full border border-[#2bffff]/20" />
                {pictureInPicture && <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-[#2bffff]/20 bg-black/70 p-2 text-[9px] text-[#2bffff]">Picture-in-picture preview</div>}
                <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause lesson" : "Play lesson"} className="relative grid size-14 place-items-center rounded-full border border-[#2bffff]/40 bg-black/35 text-[#2bffff] shadow-[0_0_30px_rgba(43,255,255,.14)]">{playing ? <Pause size={21} /> : <Play size={21} fill="currentColor" />}</button>
                <div className="absolute bottom-3 left-3 flex items-center gap-2"><Badge tone={lessonComplete ? "green" : playing ? "cyan" : "neutral"}>{lessonComplete ? "Completed" : playing ? "Playing" : "Paused"}</Badge><span className="text-[9px] text-white/50">Video preview · streaming is not connected</span></div>
              </div>
              <div className="mt-3 h-1.5 cursor-pointer rounded-full bg-white/10" onClick={() => setToast("Playback position updated in the preview.")}><div className={`h-full rounded-full bg-[#2bffff] transition-all ${playing ? "w-2/5" : "w-1/4"}`} /></div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause lesson" : "Play lesson"} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/70">{playing ? <Pause size={14} /> : <Play size={14} />}</button><span className="text-[9px] text-white/40">{playing ? "03:18" : "00:00"} / {currentLesson.duration}</span><button type="button" onClick={() => setMuted((current) => !current)} aria-label={muted ? "Unmute player" : "Mute player"} className="grid size-8 place-items-center rounded-lg text-white/50">{muted ? <VolumeX size={14} /> : <Volume2 size={14} />}</button></div>
                <div className="flex items-center gap-1"><select aria-label="Playback speed" value={playbackSpeed} onChange={(event) => setPlaybackSpeed(event.target.value)} className="rounded-lg border border-white/10 bg-[#071314] px-2 py-1.5 text-[9px] text-white/60"><option>0.75×</option><option>1×</option><option>1.25×</option><option>1.5×</option><option>2×</option></select><button type="button" onClick={() => setCaptions((current) => !current)} className={`rounded-lg border px-2 py-1.5 text-[9px] font-bold ${captions ? "border-[#2bffff]/30 text-[#2bffff]" : "border-white/10 text-white/50"}`}>CC</button><button type="button" onClick={() => setPlayerSettingsOpen((current) => !current)} aria-label="Player settings" className="grid size-8 place-items-center rounded-lg text-white/50"><Settings2 size={14} /></button><button type="button" onClick={() => setPictureInPicture((current) => !current)} aria-label="Picture in picture" className={`grid size-8 place-items-center rounded-lg ${pictureInPicture ? "text-[#2bffff]" : "text-white/50"}`}><Layers size={14} /></button><button type="button" onClick={() => setFullscreen((current) => !current)} aria-label={fullscreen ? "Exit full screen" : "Full screen"} className="grid size-8 place-items-center rounded-lg text-white/50"><ExternalLink size={14} /></button></div>
              </div>
              {playerSettingsOpen && <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl border border-white/[.08] p-3 text-[9px] text-white/50"><span>Video quality <b className="ml-2 text-white/80">Auto · 1080p</b></span><span>Subtitles <b className="ml-2 text-white/80">{captions ? "English on" : "Off"}</b></span><button type="button" onClick={() => setPlayerSettingsOpen(false)} className="text-[#2bffff]">Done</button></div>}
            </Panel>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold text-[#2bffff]">{modules.find((module) => module.lessons.some((lesson) => lesson.id === currentLesson.id))?.title}</p><h2 className="mt-1 text-xl font-bold">{currentLesson.title}</h2><p className="mt-1 text-[10px] text-white/40">{currentLesson.type} · {currentLesson.duration}</p></div><Badge tone={lessonComplete ? "green" : "cyan"}>{lessonComplete ? "Lesson complete" : "In progress"}</Badge></div>
            <div className="border-b border-white/10"><div className="flex gap-1 overflow-x-auto scrollbar-none">{(["Overview", "Notes", "Resources", "Discussion", "Transcript"] as const).map((name) => <button key={name} type="button" onClick={() => setPlayerTab(name)} className={`shrink-0 border-b-2 px-3 py-2.5 text-[10px] font-bold ${playerTab === name ? "border-[#2bffff] text-[#2bffff]" : "border-transparent text-white/45"}`}>{name}</button>)}</div></div>
            {playerTab === "Overview" && <Panel><h3 className="font-bold">Lesson overview</h3><p className="mt-2 text-xs leading-relaxed text-white/50">{currentLesson.description}</p><div className="mt-4 flex items-center gap-3 border-t border-white/[.07] pt-3"><Avatar name={selectedCourse.instructor} initials={selectedCourse.initials} size="size-8" /><div><p className="text-[10px] font-bold">{selectedCourse.instructor}</p><p className="mt-1 text-[9px] text-white/40">{selectedCourse.instructorRole}</p></div></div><div className="mt-4 rounded-xl border border-white/[.07] p-3"><h4 className="text-[10px] font-bold">Key takeaways</h4><p className="mt-1 text-[10px] leading-relaxed text-white/45">Connect the concepts in this lesson to your project, note questions to revisit, and use the attached resources for extra practice.</p></div></Panel>}
            {playerTab === "Notes" && <Panel><div className="flex items-center justify-between"><div><h3 className="font-bold">Your lesson notes</h3><p className="mt-1 text-[9px] text-white/40">Private notes linked to {currentLesson.title}</p></div><ActionButton onClick={() => startNote()}><Plus size={13} /> Add Note</ActionButton></div>{lessonNotes.length ? <div className="mt-4 space-y-2">{lessonNotes.map((note) => <article key={note.id} className="rounded-xl border border-white/[.07] p-3"><div className="flex items-start justify-between gap-2"><div><h4 className="text-[11px] font-bold">{note.title}</h4><p className="mt-1 text-[9px] text-white/35">{note.date} · This lesson</p></div><div className="flex gap-1"><button type="button" onClick={() => startNote(note)} aria-label="Edit note" className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/50"><Pencil size={12} /></button><button type="button" onClick={() => { setEditingNoteId(note.id); setNotesModal("delete"); }} aria-label="Delete note" className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/50"><Trash2 size={12} /></button></div></div><p className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-white/55">{note.body}</p></article>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-center"><NotebookPen size={20} className="mx-auto text-white/35" /><p className="mt-2 text-xs font-bold">No notes for this lesson yet</p><p className="mt-1 text-[9px] text-white/40">Capture an idea or question while you learn.</p><ActionButton onClick={() => startNote()} className="mt-3"><Plus size={13} /> Add Note</ActionButton></div>}</Panel>}
            {playerTab === "Resources" && <div className="space-y-2">{courseResources.slice(0, 3).map((resource) => <Panel key={resource.id} className="flex items-center gap-3 p-3"><FileText size={17} className="text-[#2bffff]" /><div className="flex-1"><p className="text-[10px] font-bold">{resource.name}</p><p className="mt-1 text-[9px] text-white/40">{resource.type} · {resource.size}</p></div><button type="button" onClick={() => openResource(resource.id, true)} className="text-[9px] font-bold text-[#2bffff]">Preview</button><button type="button" onClick={() => openResource(resource.id)} aria-label={`Download ${resource.name}`} className="text-white/45"><Download size={13} /></button></Panel>)}</div>}
            {playerTab === "Discussion" && renderDiscussions()}
            {playerTab === "Transcript" && <Panel><div className="flex items-center justify-between"><h3 className="font-bold">Lesson transcript</h3><Badge>Preview</Badge></div><p className="mt-3 text-[10px] leading-relaxed text-white/50">00:00 Welcome to this lesson. In this section, we’ll build on the concepts introduced in the previous module.<br /><br />03:18 Let’s look at a practical example and consider how the pieces fit together. Pause here to try the exercise yourself.<br /><br />07:42 As you work, focus on keeping the solution clear and easy to extend.</p></Panel>}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4"><ActionButton secondary onClick={() => { const previous = allLessons[currentLessonIndex - 1]; if (previous) openLesson(previous, currentLessonIndex - 1); }} disabled={currentLessonIndex <= 0}><ChevronLeft size={14} /> Previous Lesson</ActionButton><div className="flex gap-2"><ActionButton secondary onClick={completeLesson} disabled={lessonComplete}>{lessonComplete ? <><Check size={14} /> Completed</> : "Mark as Complete"}</ActionButton><ActionButton onClick={goToNextLesson} disabled={!lessonComplete || currentLessonIndex >= allLessons.length - 1}>Next Lesson <ChevronRight size={14} /></ActionButton></div></div>
          </div>
          <aside className={`${curriculumOpen ? "block" : "hidden"} space-y-3 xl:block`}>
            <Panel className="sticky top-3 max-h-[calc(100vh-7rem)] overflow-y-auto p-3">
              <div className="mb-3 flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#2bffff]">Course curriculum</p><h3 className="mt-1 text-[11px] font-bold">{Math.round(selectedProgress)}% complete</h3></div><button type="button" onClick={() => setCurriculumOpen(false)} className="grid size-8 place-items-center rounded-lg border border-white/10 xl:hidden" aria-label="Collapse curriculum"><X size={13} /></button></div>
              <div className="mb-3 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#2bffff]" style={{ width: `${selectedProgress}%` }} /></div>
              <div className="space-y-2">{modules.map((module) => <div key={module.id} className="rounded-xl border border-white/[.06]"><button type="button" onClick={() => toggleModule(module.id)} className="flex w-full items-center gap-2 p-2 text-left"><span className="min-w-0 flex-1 truncate text-[9px] font-bold">{module.title}</span><span className="text-[8px] text-white/35">{module.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length}/{module.lessons.length}</span>{expandedModules.includes(module.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>{expandedModules.includes(module.id) && <div className="space-y-0.5 px-1 pb-1">{module.lessons.map((lesson) => { const index = allLessons.findIndex((item) => item.id === lesson.id); const complete = completedLessons.includes(lesson.id); const locked = !complete && index > firstIncomplete; return <button key={lesson.id} type="button" onClick={() => openLesson(lesson, index)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${currentLesson.id === lesson.id ? "bg-[#2bffff]/10 text-[#2bffff]" : "text-white/55 hover:bg-white/[.04]"}`}><span className="shrink-0">{complete ? <CheckCircle2 size={12} className="text-emerald-300" /> : locked ? <LockKeyhole size={12} className="text-white/30" /> : lessonIcon(lesson.type)}</span><span className="min-w-0 flex-1 truncate text-[9px]">{lesson.title}</span></button>; })}</div>}</div>)}</div>
            </Panel>
          </aside>
        </div>
      </div>
    );
  };

  const renderCompletion = () => (
    <div className="mx-auto max-w-4xl space-y-5">
      <Panel className="relative overflow-hidden p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(43,255,255,.14),transparent_50%)]" /><div className="relative">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#2bffff]/20 bg-[#2bffff]/10 text-[#2bffff]"><Award size={28} /></span>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#2bffff]">Learning milestone achieved</p><h2 className="mt-2 text-3xl font-bold">Congratulations!</h2><p className="mx-auto mt-2 max-w-xl text-sm text-white/50">You have completed <strong className="text-white">{selectedCourse.title}</strong>. Your dedication and hard work have paid off.</p>
          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">{[["Completed", "Today"], ["Study time", "14h 20m"], ["Lessons", `${selectedCourse.lessons}/${selectedCourse.lessons}`], ["Quiz score", `${Math.round(quizScore / quizQuestions.length * 100)}%`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.08] bg-white/[.02] p-3"><p className="text-[9px] text-white/35">{label}</p><p className="mt-1.5 text-sm font-bold">{value}</p></div>)}</div>
          <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#2bffff]/20 bg-gradient-to-br from-[#092d2e] to-[#0b1718] p-5 text-left"><div className="flex items-center gap-3"><Award size={24} className="text-[#2bffff]" /><div><p className="text-[9px] uppercase tracking-wider text-[#2bffff]">Certificate of completion</p><p className="mt-1 font-bold">{selectedCourse.title}</p></div></div><p className="mt-4 border-t border-white/10 pt-3 text-[10px] text-white/45">Awarded to Aman Verma · LearnIsphere · Completed today</p></div>
          <div className="mt-6 flex flex-wrap justify-center gap-2"><ActionButton onClick={() => setScreen("certificate")}><Award size={14} /> View Certificate</ActionButton><ActionButton secondary onClick={() => setToast("Certificate download is a frontend preview; no file is created.")}><Download size={14} /> Download Certificate</ActionButton><ActionButton secondary onClick={() => setModal("share")}><Share2 size={14} /> Share Achievement</ActionButton><ActionButton secondary onClick={() => setScreen("library")}><ArrowLeft size={14} /> Return to My Courses</ActionButton></div>
        </div>
      </Panel>
    </div>
  );

  const renderCertificate = () => (
    <div className="mx-auto max-w-4xl space-y-5">
      <button type="button" onClick={() => setScreen("course")} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Course</button>
      {isCourseComplete(selectedCourse) ? <Panel className="p-5 sm:p-8"><div className="mx-auto max-w-2xl border border-[#2bffff]/30 bg-gradient-to-br from-[#082526] via-[#0b1718] to-[#10282b] p-5 text-center sm:p-10"><div className="mx-auto grid size-14 place-items-center rounded-full border border-[#2bffff]/30 text-[#2bffff]"><Award size={26} /></div><p className="mt-5 text-[9px] font-bold uppercase tracking-[.28em] text-[#2bffff]">LearnIsphere · Certificate of Completion</p><h2 className="mt-5 text-2xl font-bold sm:text-3xl">This is to certify that</h2><p className="mt-3 text-xl font-bold text-[#2bffff]">Aman Verma</p><p className="mt-3 text-xs text-white/55">has successfully completed</p><h3 className="mt-2 text-xl font-bold">{selectedCourse.title}</h3><div className="mt-8 flex items-end justify-between border-t border-white/10 pt-4 text-left"><div><p className="text-[9px] text-white/35">Date of completion</p><p className="mt-1 text-[10px] font-semibold">November 14, 2026</p></div><div className="text-right"><p className="font-serif text-lg italic text-[#2bffff]">LearnIsphere</p><p className="mt-1 text-[9px] text-white/35">Learning Director</p></div></div></div><div className="mt-5 flex flex-wrap justify-center gap-2"><ActionButton onClick={() => setToast("Certificate download is a frontend preview; no file is created.")}><Download size={14} /> Download Certificate</ActionButton><ActionButton secondary onClick={() => setModal("share")}><Share2 size={14} /> Share Achievement</ActionButton><ActionButton secondary onClick={() => setScreen("library")}><ArrowLeft size={14} /> Return to My Courses</ActionButton></div></Panel> : <Panel className="p-8 text-center"><LockKeyhole size={24} className="mx-auto text-amber-300" /><h2 className="mt-3 font-bold">Certificate not available yet</h2><p className="mt-2 text-xs text-white/45">Complete all lessons and required assessments before earning this certificate.</p><ActionButton onClick={() => setScreen("course")} className="mt-4">Back to Course</ActionButton></Panel>}
    </div>
  );

  const renderResourcePreview = () => {
    const resource = courseResources.find((item) => item.id === selectedResourceId) ?? courseResources[0];
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <button type="button" onClick={() => { setScreen("course"); setCourseTab("Resources"); }} className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#2bffff]"><ArrowLeft size={14} /> Back to Resources</button>
        <Panel className="overflow-hidden p-0"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4"><div className="flex items-center gap-3"><FileText size={19} className="text-[#2bffff]" /><div><h2 className="text-sm font-bold">{resource.name}</h2><p className="mt-1 text-[9px] text-white/40">{resource.type} · {resource.size} · {resource.lesson}</p></div></div><ActionButton secondary onClick={() => setToast("File download is not connected in this preview.")}><Download size={13} /> Download</ActionButton></div><div className="grid min-h-[55vh] place-items-center bg-[#080f10] p-6"><div className="w-full max-w-xl rounded-xl border border-white/10 bg-white p-8 text-slate-800 shadow-2xl"><div className="flex items-center justify-between border-b pb-3"><div className="font-bold text-slate-900">LEARNISPHERE</div><span className="text-[9px] text-slate-400">{resource.type} preview</span></div><h3 className="mt-8 text-xl font-bold">{resource.name.replace(/\.[^.]+$/, "")}</h3><p className="mt-3 text-xs leading-relaxed text-slate-500">A preview of the learning material associated with {selectedCourse.title}. The actual document is not loaded in this frontend prototype.</p><div className="mt-8 space-y-3">{["Key concept overview", "Practical examples and guided steps", "Further reading and reflection"].map((item) => <div key={item} className="h-10 rounded-lg bg-slate-100 p-3 text-[10px] font-semibold text-slate-500">{item}</div>)}</div><div className="mt-8 h-2 rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-teal-500" /></div></div></div></Panel>
      </div>
    );
  };

  const renderSubmission = () => (
    <div className="mx-auto max-w-3xl space-y-5">
      <Panel className="p-6 text-center sm:p-9"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={26} /></span><p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Submission successful</p><h2 className="mt-2 text-2xl font-bold">Your work is in!</h2><p className="mt-2 text-xs text-white/45">{currentAssignment.title} · {selectedCourse.title}</p><div className="mx-auto mt-5 max-w-md rounded-xl border border-white/[.08] p-4 text-left"><div className="flex justify-between text-[10px]"><span className="text-white/40">Submitted</span><span className="font-semibold">Just now</span></div><div className="mt-3 flex justify-between text-[10px]"><span className="text-white/40">Status</span><Badge tone="cyan">Submitted</Badge></div><div className="mt-3 text-[10px] text-white/45">Files: {uploadedFiles.length ? uploadedFiles.join(", ") : "Text submission"}</div></div><p className="mt-4 text-[9px] text-white/35">This confirmation is a frontend prototype. Submission data is not sent to an instructor.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><ActionButton onClick={() => { setScreen("course"); setCourseTab("Assignments"); }}>Return to Assignments</ActionButton><ActionButton secondary onClick={() => setScreen("course")}>Course Overview</ActionButton>{isCourseComplete(selectedCourse) && <ActionButton secondary onClick={() => setScreen("completion")}>View Course Completion</ActionButton>}</div></Panel>
    </div>
  );

  let content: ReactNode = null;
  if (screen === "library") content = renderLibrary();
  else if (screen === "course") content = renderCourse();
  else if (screen === "player") content = renderPlayer();
  else if (screen === "assignment") content = renderAssignmentDetail();
  else if (screen === "submission") content = renderSubmission();
  else if (screen === "quiz-instructions") content = renderQuizInstructions();
  else if (screen === "quiz") content = renderQuiz();
  else if (screen === "quiz-results") content = renderQuizResults();
  else if (screen === "announcement") content = renderAnnouncement();
  else if (screen === "discussion") content = renderDiscussionDetail();
  else if (screen === "completion") content = renderCompletion();
  else if (screen === "certificate") content = renderCertificate();
  else if (screen === "resource-preview") content = renderResourcePreview();
  else if (screen === "progress") content = renderProgress();

  const notifications = [
    { title: "New lesson available", desc: "Advanced Techniques is ready to study.", tab: "Curriculum" as CourseTab },
    { title: "Instructor added a resource", desc: "A new reference file was added to the course.", tab: "Resources" as CourseTab },
    { title: "Assignment deadline approaching", desc: "Your course capstone is due soon.", tab: "Assignments" as CourseTab },
    { title: "Quiz available", desc: "Test your knowledge of core concepts.", tab: "Quizzes" as CourseTab },
    { title: "Assignment graded", desc: "Instructor feedback is available for review.", tab: "Assignments" as CourseTab },
    { title: "Course module completed", desc: "Your learning progress has been updated.", tab: "Overview" as CourseTab },
    { title: "New course announcement", desc: "Your instructor shared a course update.", tab: "Announcements" as CourseTab },
    { title: "Certificate earned", desc: "View your completed course certificate.", tab: "Overview" as CourseTab },
  ];

  return (
    <div className={`page-enter space-y-5 ${fullscreen && screen === "player" ? "fixed inset-0 z-[70] overflow-y-auto bg-[#020707] p-3 sm:p-5" : ""}`}>
      {content}
      {notesModal && notesModal !== "delete" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="note-dialog-title" className="w-full max-w-lg rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 id="note-dialog-title" className="text-lg font-bold">{notesModal === "add" ? "Add a personal note" : "Edit note"}</h2><p className="mt-1 text-[10px] text-white/45">Saved privately with {currentLesson.title}.</p></div><button type="button" onClick={() => setNotesModal(null)} aria-label="Close note editor" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div>
            <label className="mt-5 block text-[10px] font-bold">Note title<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Give your note a title" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-xs outline-none focus:border-[#2bffff]/40" /></label>
            <label className="mt-4 block text-[10px] font-bold">Note content<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} rows={5} placeholder="Write down a key idea, question or reminder..." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs outline-none focus:border-[#2bffff]/40" /></label>
            <p className="mt-2 text-[9px] text-white/35">Lesson association · {currentLesson.title}</p>
            <div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setNotesModal(null)}>Cancel</ActionButton><ActionButton onClick={saveNote}>{notesModal === "add" ? "Save Note" : "Update Note"}</ActionButton></div>
          </div>
        </div>
      )}
      {notesModal === "delete" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-note-title" className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#061011] p-5 shadow-2xl"><h2 id="delete-note-title" className="text-lg font-bold">Delete this note?</h2><p className="mt-2 text-xs text-white/45">This removes the note from this lesson in the current preview.</p><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setNotesModal(null)}>Cancel</ActionButton><button type="button" onClick={() => { setNotes((current) => current.filter((note) => note.id !== editingNoteId)); setNotesModal(null); setToast("Note deleted."); }} className="rounded-xl bg-red-400/15 px-4 py-2.5 text-xs font-bold text-red-200">Delete Note</button></div></div>
        </div>
      )}
      {modal === "submit-assignment" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="submit-assignment-title" className="w-full max-w-md rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="submit-assignment-title" className="text-lg font-bold">Submit assignment?</h2><p className="mt-1 text-[10px] text-white/45">Review your work before sending it to your instructor.</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close submission confirmation" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div><div className="mt-4 rounded-xl border border-white/[.08] p-3"><p className="text-xs font-bold">{currentAssignment.title}</p><p className="mt-1 text-[10px] text-white/40">{uploadedFiles.length} file(s) attached · {assignmentAnswer.trim() ? "Text answer included" : "No text answer"}</p></div><p className="mt-3 text-[9px] text-white/35">This prototype will show a confirmation but will not upload or send your work.</p><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Review Work</ActionButton><ActionButton onClick={submitAssignment}>Confirm Submission <Check size={14} /></ActionButton></div></div>
        </div>
      )}
      {modal === "submit-quiz" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="submit-quiz-title" className="w-full max-w-sm rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl"><h2 id="submit-quiz-title" className="text-lg font-bold">Submit this quiz?</h2><p className="mt-2 text-xs leading-relaxed text-white/45">{quizQuestions.length - Object.keys(quizAnswers).length} question(s) are unanswered. You can still submit and review your results afterward.</p><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Continue Quiz</ActionButton><ActionButton onClick={finishQuiz}>Submit Quiz</ActionButton></div></div>
        </div>
      )}
      {modal === "create-discussion" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <form onSubmit={createDiscussion} className="w-full max-w-lg rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Start a discussion</h2><p className="mt-1 text-[10px] text-white/45">Share a question or idea with your course community.</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close discussion form" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div><label className="mt-5 block text-[10px] font-bold">Discussion title<input required name="title" placeholder="What would you like to discuss?" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-xs outline-none focus:border-[#2bffff]/40" /></label><label className="mt-4 block text-[10px] font-bold">Related module<select name="module" className="mt-2 w-full rounded-xl border border-white/10 bg-[#071314] px-3 py-2.5 text-xs text-white/65">{modules.map((module) => <option key={module.id}>{module.title}</option>)}</select></label><label className="mt-4 block text-[10px] font-bold">Description<textarea required name="body" rows={4} placeholder="Add context so your classmates can help..." className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs outline-none focus:border-[#2bffff]/40" /></label><label className="mt-3 flex cursor-pointer items-center gap-2 text-[9px] text-white/45"><Paperclip size={12} /> Attach a file<input type="file" className="sr-only" onChange={() => setToast("Attachment selected for this prototype.")} /></label><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Cancel</ActionButton><button type="submit" className="rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black">Post Discussion</button></div></form>
        </div>
      )}
      {modal === "more-options" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="course-options-title" className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#061011] p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="course-options-title" className="text-lg font-bold">Course options</h2><p className="mt-1 text-[10px] text-white/45">{selectedCourse.title}</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close course options" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div><div className="mt-4 space-y-2">{[["Download available resources", Download], ["View course information", BookOpen], ["Contact instructor", Mail], ["Report a course issue", CircleHelp]].map(([label, Icon]) => <button key={label as string} type="button" onClick={() => { setModal(null); if (label === "Download available resources") { setScreen("course"); setCourseTab("Resources"); } else if (label === "View course information") { setScreen("course"); setCourseTab("Overview"); } else setToast(label === "Contact instructor" ? `Message composer for ${selectedCourse.instructor} is a frontend preview.` : "Course issue report is a frontend preview."); }} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] p-3 text-left text-[10px] font-semibold text-white/65 hover:bg-white/[.04]"><Icon size={14} className="text-[#2bffff]" />{label as string}<ChevronRight size={13} className="ml-auto" /></button>)}{statusFor(selectedCourse) !== "Completed" && <button type="button" onClick={() => statusFor(selectedCourse) === "Archived" ? restoreCourse(selectedCourse, true) : setModal("archive")} className="flex w-full items-center gap-3 rounded-xl border border-amber-400/10 p-3 text-left text-[10px] font-semibold text-amber-200 hover:bg-amber-400/[.05]"><Bookmark size={14} /> {statusFor(selectedCourse) === "Archived" ? "Restore course" : "Archive course"} <ChevronRight size={13} className="ml-auto" /></button>}</div></div>
        </div>
      )}
      {modal === "archive" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="archive-course-title" className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#061011] p-5 shadow-2xl"><h2 id="archive-course-title" className="text-lg font-bold">Archive this course?</h2><p className="mt-2 text-xs leading-relaxed text-white/45">Your course progress will be kept. You can find this course in the Archived tab and restore it later.</p><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Cancel</ActionButton><button type="button" onClick={archiveCourse} className="rounded-xl bg-amber-400/15 px-4 py-2.5 text-xs font-bold text-amber-100">Archive Course</button></div></div>
        </div>
      )}
      {modal === "notifications" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="course-notifications-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="course-notifications-title" className="text-lg font-bold">Learning notifications</h2><p className="mt-1 text-[10px] text-white/45">Select a notification to open its course section.</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close notifications" className="grid size-8 place-items-center rounded-lg border border-white/10"><X size={14} /></button></div><div className="mt-4 space-y-2">{notifications.map((item, index) => <button key={item.title} type="button" onClick={() => { setSelectedCourseId(index === 7 ? "sap" : "react"); setCourseTab(item.tab); setModal(null); setScreen(index === 7 ? "certificate" : "course"); }} className="flex w-full items-start gap-3 rounded-xl border border-white/[.07] p-3 text-left hover:bg-white/[.03]"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2bffff]/10 text-[#2bffff]">{index === 7 ? <Award size={14} /> : <Bell size={14} />}</span><span className="flex-1"><span className="block text-[10px] font-bold">{item.title}</span><span className="mt-1 block text-[9px] text-white/40">{item.desc}</span><span className="mt-1 block text-[8px] text-white/30">{index === 0 ? "Today" : `${index}h ago`}</span></span><ChevronRight size={13} className="mt-1 text-white/35" /></button>)}</div></div>
        </div>
      )}
      {modal === "share" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="share-title" className="w-full max-w-sm rounded-[24px] border border-[#2bffff]/15 bg-[#061011] p-5 shadow-2xl"><h2 id="share-title" className="text-lg font-bold">Share your achievement</h2><p className="mt-2 text-xs text-white/45">Celebrate completing {selectedCourse.title} with your learning community.</p><div className="mt-4 rounded-xl border border-white/[.08] p-3"><p className="text-[9px] text-white/35">Shareable preview link</p><p className="mt-1 truncate text-[10px] font-semibold">learnisphere.example/certificate/{selectedCourse.id}</p></div><div className="mt-5 flex justify-end gap-2"><ActionButton secondary onClick={() => setModal(null)}>Close</ActionButton><ActionButton onClick={() => { setModal(null); setToast("Achievement link copied in the prototype."); }}>Copy Link</ActionButton></div></div>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-20 right-4 z-[100] flex max-w-sm items-center gap-2 rounded-xl border border-[#2bffff]/20 bg-[#061011] px-4 py-3 text-xs font-semibold shadow-2xl"><CheckCircle2 size={15} className="shrink-0 text-[#2bffff]" />{toast}</div>}
    </div>
  );
}

function LayoutIcon() {
  return <LayoutDashboard size={14} />;
}

