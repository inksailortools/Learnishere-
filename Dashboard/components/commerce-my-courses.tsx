"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, CirclePlay, ExternalLink, GraduationCap, LoaderCircle } from "lucide-react";

type Lesson = {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: string;
  is_preview: boolean;
  preview_available: boolean;
};
type CourseModule = {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
};
type EnrolledCourse = {
  id: number;
  slug: string;
  title: string;
  category: string;
  qualification: string;
  description: string;
  image: string;
  duration: string;
  difficulty: string;
  enrollment_id: number;
  enrolled_at: string;
  instructor: { name: string; bio: string; image: string };
  modules: CourseModule[];
};
type LessonResource = {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: string;
  resource_url: string;
  available: boolean;
};

async function loadMyCourses() {
  const response = await fetch("/api/enrollments/my-courses/", {
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as {
    results?: EnrolledCourse[];
    detail?: string;
  };
  if (!response.ok) throw new Error(data.detail || "Your enrolled courses could not be loaded.");
  if (!Array.isArray(data.results)) throw new Error("The course service returned invalid data.");
  return data.results;
}

export default function CommerceMyCourses() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<EnrolledCourse | null>(null);
  const [lesson, setLesson] = useState<LessonResource | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState("");

  useEffect(() => {
    let active = true;
    loadMyCourses().then(
      (results) => {
        if (active) {
          setCourses(results);
          setSelected(results[0] ?? null);
        }
      },
      (reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Your courses could not be loaded.");
      },
    ).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const openLesson = async (course: EnrolledCourse, item: Lesson) => {
    setLesson(null);
    setLessonError("");
    setLessonLoading(true);
    try {
      const response = await fetch(
        `/api/enrollments/my-courses/${course.enrollment_id}/lessons/${item.id}/`,
        { credentials: "same-origin" },
      );
      const data = (await response.json().catch(() => ({}))) as {
        lesson?: LessonResource;
        detail?: string;
      };
      if (!response.ok || !data.lesson) {
        throw new Error(data.detail || "This lesson could not be opened.");
      }
      setLesson(data.lesson);
    } catch (reason) {
      setLessonError(reason instanceof Error ? reason.message : "This lesson could not be opened.");
    } finally {
      setLessonLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="glass-card rounded-2xl border border-white/10 p-8 text-center">
        <LoaderCircle className="mx-auto animate-spin text-[#2bffff]" size={22} />
        <p className="mt-3 text-sm text-white/55">Loading your verified enrolments…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-card rounded-2xl border border-red-400/20 p-6" role="alert">
        <h2 className="text-lg font-bold">Courses could not be loaded</h2>
        <p className="mt-2 text-sm text-white/55">{error}</p>
        <button className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold" onClick={() => window.location.reload()}>
          Try again
        </button>
      </section>
    );
  }

  if (!courses.length) {
    return (
      <section className="glass-card rounded-2xl border border-white/10 p-8 text-center">
        <GraduationCap className="mx-auto text-[#2bffff]" size={28} />
        <h2 className="mt-4 text-xl font-bold">No purchased courses yet</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">
          Courses appear here after Django verifies a successful payment. Orders and browser success messages never grant course access by themselves.
        </p>
        <a className="mt-5 inline-flex rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black" href="/courses">
          Browse courses
        </a>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2bffff]/70">Student learning space</p>
        <h2 className="mt-2 text-3xl font-bold">My Courses</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">Only verified, active enrolments from your account are shown here.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
        <div className="space-y-4">
          {courses.map((course) => (
            <article className="glass-card overflow-hidden rounded-2xl border border-white/10" key={course.enrollment_id}>
              <button
                type="button"
                onClick={() => { setSelected(course); setLesson(null); setLessonError(""); }}
                className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
              >
                {course.image ? (
                  <img className="h-16 w-24 rounded-xl object-cover" src={course.image} alt="" />
                ) : (
                  <span className="grid h-16 w-24 place-items-center rounded-xl bg-[#2bffff]/10 text-[#2bffff]"><BookOpen size={22} /></span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-[#2bffff]/70">{course.category} · {course.qualification}</span>
                  <span className="mt-1 block truncate text-sm font-bold">{course.title}</span>
                  <span className="mt-1 block text-[10px] text-white/40">
                    Enrolled {new Date(course.enrolled_at).toLocaleDateString()} · {course.modules.length} modules
                  </span>
                </span>
                <ChevronDown size={16} className={selected?.enrollment_id === course.enrollment_id ? "rotate-180 text-[#2bffff]" : "text-white/40"} />
              </button>
              {selected?.enrollment_id === course.enrollment_id && (
                <div className="border-t border-white/[.08] px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-sm leading-6 text-white/55">{course.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/45">
                    {course.duration && <span>{course.duration}</span>}
                    {course.difficulty && <span>{course.difficulty}</span>}
                    {course.instructor?.name && <span>Instructor: {course.instructor.name}</span>}
                  </div>
                  <div className="mt-5 space-y-3">
                    {course.modules.length ? course.modules.map((module, index) => (
                      <details className="rounded-xl border border-white/[.08] bg-black/10" key={module.id}>
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                          <span className="text-[10px] font-bold text-[#2bffff]/70">{String(index + 1).padStart(2, "0")}</span>
                          <span className="flex-1 text-xs font-bold">{module.title}</span>
                          <span className="text-[9px] text-white/35">{module.lessons.length} lessons</span>
                        </summary>
                        <div className="border-t border-white/[.06] px-4 py-2">
                          {module.description && <p className="py-2 text-[10px] leading-5 text-white/45">{module.description}</p>}
                          {module.lessons.map((item) => (
                            <button
                              className="flex w-full items-center gap-3 border-t border-white/[.05] py-3 text-left first:border-0"
                              key={item.id}
                              onClick={() => void openLesson(course, item)}
                            >
                              <CirclePlay size={15} className={item.is_preview ? "text-[#2bffff]" : "text-white/35"} />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[11px] font-semibold">{item.title}</span>
                                <span className="mt-1 block text-[9px] text-white/35">{item.type} {item.duration && `· ${item.duration}`}</span>
                              </span>
                              {item.is_preview && <span className="text-[9px] text-[#2bffff]">Preview</span>}
                            </button>
                          ))}
                          {!module.lessons.length && <p className="py-3 text-[10px] text-white/40">Lessons are being prepared for this module.</p>}
                        </div>
                      </details>
                    )) : (
                      <p className="rounded-xl border border-white/[.08] p-4 text-xs text-white/45">The course team has not published lessons yet.</p>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
        <aside className="glass-card h-fit rounded-2xl border border-white/10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2bffff]/70">Lesson access</p>
          {lessonLoading ? (
            <p className="mt-4 text-xs text-white/50">Checking your course access…</p>
          ) : lessonError ? (
            <p className="mt-4 text-xs text-red-200" role="alert">{lessonError}</p>
          ) : lesson ? (
            <>
              <h3 className="mt-3 text-base font-bold">{lesson.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/50">{lesson.description}</p>
              {lesson.available && lesson.resource_url ? (
                lesson.type === "video" ? (
                  <video className="mt-4 w-full rounded-xl bg-black" controls preload="metadata" src={lesson.resource_url}>
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <a className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#2bffff]" href={lesson.resource_url} target="_blank" rel="noreferrer">
                    Open lesson resource <ExternalLink size={13} />
                  </a>
                )
              ) : (
                <p className="mt-4 rounded-xl border border-white/[.08] p-3 text-[10px] leading-5 text-white/45">
                  This lesson is part of your enrolment, but its protected learning resource has not been configured yet.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs leading-5 text-white/45">Select a lesson to check access. The server verifies your active enrolment before returning any protected resource.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
