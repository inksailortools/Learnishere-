"use client";

import { FormEvent, useEffect, useState } from "react";

export type CommerceSection = "Courses" | "Coupons & Discounts" | "Payments & Revenue" | "Enrolments";
export function isCommerceSection(value: string): value is CommerceSection {
  return ["Courses", "Coupons & Discounts", "Payments & Revenue", "Enrolments"].includes(value);
}
type CourseRecord = {
  id: number;
  slug: string;
  title: string;
  category: string;
  qualification: string;
  description: string;
  overview: string;
  duration: string;
  difficulty: string;
  currency: string;
  selling_price: string | null;
  list_price: string | null;
  promotional_price: string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  published: boolean;
  available: boolean;
  purchase_eligible: boolean;
  modules: ModuleRecord[];
};
type ModuleRecord = {
  id: number;
  title: string;
  description: string;
  lessons: LessonRecord[];
};
type LessonRecord = {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: string;
  is_preview: boolean;
  published: boolean;
  preview_content: string;
  preview_resource_url: string;
  protected_resource_url: string;
};
type LessonDraft = Omit<LessonRecord, "id">;
type CommerceOrder = {
  id: string;
  status: string;
  currency: string;
  total_amount: string;
  refunded_amount: string;
  created_at: string;
  student: { email: string; full_name: string };
  items: { title: string; unit_price: string }[];
};
type CouponRecord = {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  currency: string;
  is_active: boolean;
  expires_at: string | null;
};
type EnrollmentRecord = {
  id: number;
  student_email: string;
  student_name: string;
  course_title: string;
  active: boolean;
  enrolled_at: string;
};
const emptyLessonDraft: LessonDraft = {
  title: "",
  description: "",
  type: "video",
  duration: "",
  is_preview: false,
  published: false,
  preview_content: "",
  preview_resource_url: "",
  protected_resource_url: "",
};

async function csrfToken() {
  const response = await fetch("/api/auth/csrf/", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Unable to start a secure session.");
  const data = (await response.json()) as { csrfToken?: string };
  if (!data.csrfToken) throw new Error("Unable to start a secure session.");
  return data.csrfToken;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) {
    if (!(typeof FormData !== "undefined" && init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("X-CSRFToken", await csrfToken());
  }
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as T & { detail?: string };
  if (!response.ok) throw new Error(data.detail || "The request could not be completed.");
  return data;
}

const cardClass = "glass-card rounded-2xl border border-white/10 p-4 sm:p-5";
const fieldClass = "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-[#2bffff]/50";
const buttonClass = "rounded-xl bg-[#2bffff] px-4 py-2.5 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButtonClass = "rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/70 hover:bg-white/[.05]";

function localDateTime(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function Status({ children }: { children: string }) {
  return <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[10px] font-bold text-white/65">{children}</span>;
}

export default function CommerceManager({ section }: { section: CommerceSection }) {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [orders, setOrders] = useState<CommerceOrder[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [query, setQuery] = useState("");
  const [newCourse, setNewCourse] = useState({ title: "", slug: "", category: "", qualification: "Certification", description: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percent", discount_value: "", max_uses: "" });
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});
  const [newModules, setNewModules] = useState<Record<number, string>>({});
  const [newLessons, setNewLessons] = useState<Record<number, LessonDraft>>({});
  const [lessonDrafts, setLessonDrafts] = useState<Record<number, LessonDraft>>({});
  const [editingLessons, setEditingLessons] = useState<Record<number, boolean>>({});

  const load = () => {
    setLoading(true);
    setError("");
    const request =
      section === "Courses"
        ? api<{ results: CourseRecord[] }>("admin/courses/")
        : section === "Coupons & Discounts"
          ? api<{ results: CouponRecord[] }>("admin/coupons/")
          : section === "Payments & Revenue"
            ? api<{ results: CommerceOrder[] }>("admin/orders/")
            : api<{ results: EnrollmentRecord[] }>("admin/enrollments/");
    request.then((data) => {
      if (section === "Courses") setCourses(data.results as CourseRecord[]);
      else if (section === "Coupons & Discounts") setCoupons(data.results as CouponRecord[]);
      else if (section === "Payments & Revenue") setOrders(data.results as CommerceOrder[]);
      else setEnrollments(data.results as EnrollmentRecord[]);
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "The commerce data could not be loaded.");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [section]);

  const updateCourse = (id: number, patch: Partial<CourseRecord>) => {
    setCourses((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const saveCourse = async (course: CourseRecord) => {
    setSavingId(course.id);
    setError("");
    setNotice("");
    try {
      const payload = {
        category: course.category,
        qualification: course.qualification,
        description: course.description,
        overview: course.overview,
        duration: course.duration,
        difficulty: course.difficulty,
        currency: course.currency,
        selling_price: course.selling_price || null,
        list_price: course.list_price || null,
        promotional_price: course.promotional_price || null,
        promotion_starts_at: course.promotion_starts_at ? new Date(course.promotion_starts_at).toISOString() : null,
        promotion_ends_at: course.promotion_ends_at ? new Date(course.promotion_ends_at).toISOString() : null,
        published: course.published,
        available: course.available,
        purchase_eligible: course.purchase_eligible,
      };
      const result = await api<{ course: CourseRecord }>(`admin/courses/${course.id}/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      updateCourse(course.id, result.course);
      setNotice(`${course.title} pricing and availability saved.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Course changes could not be saved.");
    } finally {
      setSavingId(null);
    }
  };

  const createCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingId("create-course");
    setError("");
    setNotice("");
    try {
      const result = await api<{ course: CourseRecord }>("admin/courses/create/", {
        method: "POST",
        body: JSON.stringify({ ...newCourse, published: false, available: true, purchase_eligible: true, currency: "INR" }),
      });
      setCourses((items) => [...items, result.course]);
      setNewCourse({ title: "", slug: "", category: "", qualification: "Certification", description: "" });
      setNotice("Course created as unpublished. Configure a price before enabling checkout.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Course could not be created.");
    } finally {
      setSavingId(null);
    }
  };

  const createModule = async (course: CourseRecord) => {
    const title = newModules[course.id]?.trim();
    if (!title) return;
    setSavingId(`module-${course.id}`);
    setError("");
    try {
      const result = await api<{ module: ModuleRecord }>(`admin/courses/${course.id}/modules/`, {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setCourses((items) => items.map((item) => item.id === course.id ? { ...item, modules: [...item.modules, result.module] } : item));
      setNewModules((items) => ({ ...items, [course.id]: "" }));
      setNotice(`Module added to ${course.title}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Module could not be added.");
    } finally {
      setSavingId(null);
    }
  };

  const createLesson = async (courseId: number, module: ModuleRecord) => {
    const lesson = newLessons[module.id];
    if (!lesson?.title.trim()) return;
    setSavingId(`lesson-${module.id}`);
    setError("");
    try {
      const result = await api<{ lesson: LessonRecord }>(`admin/modules/${module.id}/lessons/`, {
        method: "POST",
        body: JSON.stringify(lesson),
      });
      setCourses((items) => items.map((course) => course.id !== courseId ? course : {
        ...course,
        modules: course.modules.map((item) => item.id === module.id ? { ...item, lessons: [...item.lessons, result.lesson] } : item),
      }));
      setNewLessons((items) => ({ ...items, [module.id]: emptyLessonDraft }));
      setNotice(`Lesson added to ${module.title}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson could not be added.");
    } finally {
      setSavingId(null);
    }
  };

  const updateLessonDraft = (id: number, patch: Partial<LessonDraft>) => {
    setNewLessons((items) => ({ ...items, [id]: { ...emptyLessonDraft, ...items[id], ...patch } }));
  };

  const saveLesson = async (courseId: number, moduleId: number, lessonId: number) => {
    const draft = lessonDrafts[lessonId];
    if (!draft) return;
    setSavingId(`edit-lesson-${lessonId}`);
    setError("");
    try {
      const result = await api<{ lesson: LessonRecord }>(`admin/lessons/${lessonId}/`, {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setCourses((items) => items.map((course) => course.id !== courseId ? course : {
        ...course,
        modules: course.modules.map((module) => module.id !== moduleId ? module : {
          ...module,
          lessons: module.lessons.map((lesson) => lesson.id === lessonId ? result.lesson : lesson),
        }),
      }));
      setEditingLessons((items) => ({ ...items, [lessonId]: false }));
      setNotice("Lesson changes saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lesson changes could not be saved.");
    } finally {
      setSavingId(null);
    }
  };

  const createCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingId("create-coupon");
    setError("");
    setNotice("");
    try {
      await api("admin/coupons/", {
        method: "POST",
        body: JSON.stringify({
          ...newCoupon,
          discount_value: newCoupon.discount_value,
          max_uses: newCoupon.max_uses ? Number(newCoupon.max_uses) : null,
          currency: "INR",
          is_active: true,
        }),
      });
      setNewCoupon({ code: "", discount_type: "percent", discount_value: "", max_uses: "" });
      setNotice("Coupon created.");
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Coupon could not be created.");
    } finally {
      setSavingId(null);
    }
  };

  const refund = async (order: CommerceOrder) => {
    setSavingId(order.id);
    setError("");
    setNotice("");
    try {
      const amount = refundAmounts[order.id] || "";
      const result = await api<{ status: string }>(`admin/orders/${order.id}/refunds/`, {
        method: "POST",
        body: JSON.stringify({ amount: amount || null }),
      });
      setNotice(`Refund request ${result.status}. Final status is confirmed by Razorpay.`);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Refund could not be requested.");
    } finally {
      setSavingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(query.toLowerCase()));
  const title =
    section === "Courses" ? "Course pricing & availability"
      : section === "Coupons & Discounts" ? "Coupons & discounts"
        : section === "Payments & Revenue" ? "Orders, payments & refunds"
          : "Student enrolments";

  return (
    <div className="page-enter space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2bffff]/70">Commerce management</p>
          <h2 className="mt-2 text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-white/45">Changes are validated and stored by Django. The browser never sets payment totals.</p>
        </div>
        <button className={secondaryButtonClass} onClick={load} disabled={loading}>Refresh</button>
      </header>
      {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200" role="alert">{error}</p>}
      {notice && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-200" role="status">{notice}</p>}
      {loading ? <div className={cardClass}><p className="text-sm text-white/55">Loading commerce data…</p></div> : null}

      {section === "Courses" && !loading && (
        <div className="space-y-4">
          <form onSubmit={createCourse} className={`${cardClass} grid gap-3 md:grid-cols-2`}>
            <div className="md:col-span-2"><h3 className="font-bold">Add a course</h3><p className="mt-1 text-xs text-white/45">New courses start unpublished and have no price until configured.</p></div>
            <input className={fieldClass} placeholder="Course title" required value={newCourse.title} onChange={(event) => setNewCourse({ ...newCourse, title: event.target.value })} />
            <input className={fieldClass} placeholder="URL slug" required value={newCourse.slug} onChange={(event) => setNewCourse({ ...newCourse, slug: event.target.value })} />
            <input className={fieldClass} placeholder="Category" required value={newCourse.category} onChange={(event) => setNewCourse({ ...newCourse, category: event.target.value })} />
            <select className={fieldClass} value={newCourse.qualification} onChange={(event) => setNewCourse({ ...newCourse, qualification: event.target.value })}>
              {["Certification", "Diploma", "Master's", "Short course", "Module"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <textarea className={`${fieldClass} md:col-span-2`} placeholder="Short course description" required rows={2} value={newCourse.description} onChange={(event) => setNewCourse({ ...newCourse, description: event.target.value })} />
            <button className={buttonClass} disabled={savingId === "create-course"}>{savingId === "create-course" ? "Creating…" : "Create course"}</button>
          </form>

          <div className="relative">
            <input className={fieldClass} placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredCourses.map((course) => (
              <article className={cardClass} key={course.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-bold">{course.title}</h3><p className="mt-1 text-[11px] text-white/45">{course.slug} · {course.category}</p></div>
                  <Status>{course.published ? "Published" : "Unpublished"}</Status>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-[10px] text-white/55">Selling price ({course.currency})
                    <input className={`${fieldClass} mt-1`} type="number" min="0.01" step="0.01" value={course.selling_price ?? ""} placeholder="Unavailable" onChange={(event) => updateCourse(course.id, { selling_price: event.target.value || null })} />
                  </label>
                  <label className="text-[10px] text-white/55">Original/list price
                    <input className={`${fieldClass} mt-1`} type="number" min="0.01" step="0.01" value={course.list_price ?? ""} placeholder="Optional" onChange={(event) => updateCourse(course.id, { list_price: event.target.value || null })} />
                  </label>
                  <label className="text-[10px] text-white/55">Promotional price
                    <input className={`${fieldClass} mt-1`} type="number" min="0.01" step="0.01" value={course.promotional_price ?? ""} placeholder="Optional" onChange={(event) => updateCourse(course.id, { promotional_price: event.target.value || null })} />
                  </label>
                  <label className="text-[10px] text-white/55">Qualification
                    <select className={`${fieldClass} mt-1`} value={course.qualification} onChange={(event) => updateCourse(course.id, { qualification: event.target.value })}>
                      {["Certification", "Diploma", "Master's", "Short course", "Module"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] text-white/55">Promotion starts (optional)
                    <input className={`${fieldClass} mt-1`} type="datetime-local" value={localDateTime(course.promotion_starts_at)} onChange={(event) => updateCourse(course.id, { promotion_starts_at: event.target.value || null })} />
                  </label>
                  <label className="text-[10px] text-white/55">Promotion ends (optional)
                    <input className={`${fieldClass} mt-1`} type="datetime-local" value={localDateTime(course.promotion_ends_at)} onChange={(event) => updateCourse(course.id, { promotion_ends_at: event.target.value || null })} />
                  </label>
                </div>
                <label className="mt-3 block text-[10px] text-white/55">Course description
                  <textarea className={`${fieldClass} mt-1`} rows={3} value={course.description} onChange={(event) => updateCourse(course.id, { description: event.target.value })} />
                </label>
                <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-white/65">
                  {([
                    ["published", "Published"],
                    ["available", "Available for enrolment"],
                    ["purchase_eligible", "Purchasable"],
                  ] as const).map(([field, label]) => (
                    <label className="flex items-center gap-2" key={field}>
                      <input type="checkbox" checked={course[field]} onChange={(event) => updateCourse(course.id, { [field]: event.target.checked })} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[.08] pt-4">
                  <span className="text-[10px] text-white/40">{course.selling_price ? "Price configured" : "Price currently unavailable"}</span>
                  <button className={buttonClass} disabled={savingId === course.id} onClick={() => void saveCourse(course)}>{savingId === course.id ? "Saving…" : "Save course"}</button>
                </div>
                <details className="mt-4 border-t border-white/[.08] pt-4">
                  <summary className="cursor-pointer text-xs font-bold">Curriculum · {course.modules.length} modules</summary>
                  <div className="mt-3 space-y-3">
                    {course.modules.map((module) => (
                      <section className="rounded-xl border border-white/[.08] p-3" key={module.id}>
                        <h4 className="text-xs font-bold">{module.title}</h4>
                        <p className="mt-1 text-[10px] text-white/40">{module.lessons.length} lessons</p>
                        {module.lessons.map((lesson) => (
                          <div className="mt-2 border-t border-white/[.06] pt-2" key={lesson.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                              <span>{lesson.title} · {lesson.type} {lesson.duration && `· ${lesson.duration}`}</span>
                              <span className="text-white/45">{lesson.published ? "Published" : "Draft"} {lesson.is_preview ? "· Preview" : ""}</span>
                              <button className={secondaryButtonClass} onClick={() => {
                                setLessonDrafts((items) => ({ ...items, [lesson.id]: {
                                  title: lesson.title,
                                  description: lesson.description,
                                  type: lesson.type,
                                  duration: lesson.duration,
                                  is_preview: lesson.is_preview,
                                  published: lesson.published,
                                  preview_content: lesson.preview_content,
                                  preview_resource_url: lesson.preview_resource_url,
                                  protected_resource_url: lesson.protected_resource_url,
                                } }));
                                setEditingLessons((items) => ({ ...items, [lesson.id]: !items[lesson.id] }));
                              }}>{editingLessons[lesson.id] ? "Close editor" : "Edit lesson"}</button>
                            </div>
                            {editingLessons[lesson.id] && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <input className={fieldClass} placeholder="Lesson title" value={lessonDrafts[lesson.id]?.title || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], title: event.target.value } }))} />
                                <select className={fieldClass} value={lessonDrafts[lesson.id]?.type || "video"} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], type: event.target.value } }))}>
                                  {["video", "reading", "resource", "quiz", "assignment"].map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <input className={fieldClass} placeholder="Duration (optional)" value={lessonDrafts[lesson.id]?.duration || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], duration: event.target.value } }))} />
                                <input className={fieldClass} placeholder="Protected resource URL (not shown publicly)" value={lessonDrafts[lesson.id]?.protected_resource_url || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], protected_resource_url: event.target.value } }))} />
                                <textarea className={`${fieldClass} sm:col-span-2`} rows={2} placeholder="Lesson description" value={lessonDrafts[lesson.id]?.description || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], description: event.target.value } }))} />
                                <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={lessonDrafts[lesson.id]?.is_preview || false} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], is_preview: event.target.checked } }))} />Public preview</label>
                                <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={lessonDrafts[lesson.id]?.published || false} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], published: event.target.checked } }))} />Published lesson</label>
                                {lessonDrafts[lesson.id]?.is_preview && <>
                                  <textarea className={`${fieldClass} sm:col-span-2`} rows={2} placeholder="Preview text (optional)" value={lessonDrafts[lesson.id]?.preview_content || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], preview_content: event.target.value } }))} />
                                  <input className={`${fieldClass} sm:col-span-2`} placeholder="Preview media URL (public preview only)" value={lessonDrafts[lesson.id]?.preview_resource_url || ""} onChange={(event) => setLessonDrafts((items) => ({ ...items, [lesson.id]: { ...lessonDrafts[lesson.id], preview_resource_url: event.target.value } }))} />
                                </>}
                                <div className="flex gap-2 sm:col-span-2">
                                  <button className={buttonClass} disabled={savingId === `edit-lesson-${lesson.id}`} onClick={() => void saveLesson(course.id, module.id, lesson.id)}>{savingId === `edit-lesson-${lesson.id}` ? "Saving…" : "Save lesson"}</button>
                                  <button className={secondaryButtonClass} onClick={() => setEditingLessons((items) => ({ ...items, [lesson.id]: false }))}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="mt-3 grid gap-2 border-t border-white/[.06] pt-3 sm:grid-cols-2">
                          <input className={fieldClass} placeholder="New lesson title" value={newLessons[module.id]?.title || ""} onChange={(event) => updateLessonDraft(module.id, { title: event.target.value })} />
                          <select className={fieldClass} value={newLessons[module.id]?.type || "video"} onChange={(event) => updateLessonDraft(module.id, { type: event.target.value })}>
                            {["video", "reading", "resource", "quiz", "assignment"].map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                          <input className={fieldClass} placeholder="Duration (optional)" value={newLessons[module.id]?.duration || ""} onChange={(event) => updateLessonDraft(module.id, { duration: event.target.value })} />
                          <input className={fieldClass} placeholder="Protected resource URL (not shown publicly)" value={newLessons[module.id]?.protected_resource_url || ""} onChange={(event) => updateLessonDraft(module.id, { protected_resource_url: event.target.value })} />
                          <textarea className={`${fieldClass} sm:col-span-2`} rows={2} placeholder="Lesson description" value={newLessons[module.id]?.description || ""} onChange={(event) => updateLessonDraft(module.id, { description: event.target.value })} />
                          <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={newLessons[module.id]?.is_preview || false} onChange={(event) => updateLessonDraft(module.id, { is_preview: event.target.checked })} />Public preview</label>
                          <label className="flex items-center gap-2 text-[10px] text-white/60"><input type="checkbox" checked={newLessons[module.id]?.published || false} onChange={(event) => updateLessonDraft(module.id, { published: event.target.checked })} />Published lesson</label>
                          {newLessons[module.id]?.is_preview && <>
                            <textarea className={`${fieldClass} sm:col-span-2`} rows={2} placeholder="Preview text (optional)" value={newLessons[module.id]?.preview_content || ""} onChange={(event) => updateLessonDraft(module.id, { preview_content: event.target.value })} />
                            <input className={`${fieldClass} sm:col-span-2`} placeholder="Preview media URL (public preview only)" value={newLessons[module.id]?.preview_resource_url || ""} onChange={(event) => updateLessonDraft(module.id, { preview_resource_url: event.target.value })} />
                          </>}
                          <button className={`${buttonClass} sm:col-span-2`} disabled={savingId === `lesson-${module.id}`} onClick={() => void createLesson(course.id, module)}>{savingId === `lesson-${module.id}` ? "Adding lesson…" : "Add lesson"}</button>
                        </div>
                      </section>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <input className={`${fieldClass} max-w-sm`} placeholder="New module title" value={newModules[course.id] || ""} onChange={(event) => setNewModules((items) => ({ ...items, [course.id]: event.target.value }))} />
                      <button className={secondaryButtonClass} disabled={savingId === `module-${course.id}`} onClick={() => void createModule(course)}>{savingId === `module-${course.id}` ? "Adding…" : "Add module"}</button>
                    </div>
                  </div>
                </details>
              </article>
            ))}
          </div>
        </div>
      )}

      {section === "Coupons & Discounts" && !loading && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
          <form className={`${cardClass} space-y-3`} onSubmit={createCoupon}>
            <h3 className="font-bold">Create coupon</h3>
            <input className={fieldClass} placeholder="Coupon code" required maxLength={40} value={newCoupon.code} onChange={(event) => setNewCoupon({ ...newCoupon, code: event.target.value.toUpperCase() })} />
            <select className={fieldClass} value={newCoupon.discount_type} onChange={(event) => setNewCoupon({ ...newCoupon, discount_type: event.target.value })}>
              <option value="percent">Percentage</option><option value="fixed">Fixed INR amount</option>
            </select>
            <input className={fieldClass} type="number" min="0.01" step="0.01" placeholder={newCoupon.discount_type === "percent" ? "Discount percent" : "Discount amount (INR)"} required value={newCoupon.discount_value} onChange={(event) => setNewCoupon({ ...newCoupon, discount_value: event.target.value })} />
            <input className={fieldClass} type="number" min="1" step="1" placeholder="Maximum uses (optional)" value={newCoupon.max_uses} onChange={(event) => setNewCoupon({ ...newCoupon, max_uses: event.target.value })} />
            <button className={buttonClass} disabled={savingId === "create-coupon"}>{savingId === "create-coupon" ? "Creating…" : "Create coupon"}</button>
          </form>
          <div className="space-y-3">
            {coupons.map((coupon) => <article className={`${cardClass} flex flex-wrap items-center justify-between gap-3`} key={coupon.id}>
              <div><h3 className="font-bold">{coupon.code}</h3><p className="mt-1 text-xs text-white/45">{coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `${coupon.currency} ${coupon.discount_value}`} · {coupon.currency}</p></div>
              <Status>{coupon.is_active ? "Active" : "Inactive"}</Status>
            </article>)}
            {!coupons.length && <div className={cardClass}><p className="text-sm text-white/45">No coupons configured.</p></div>}
          </div>
        </div>
      )}

      {section === "Payments & Revenue" && !loading && (
        <div className="space-y-3">
          {orders.map((order) => (
            <article className={cardClass} key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-bold">{order.student.full_name} <span className="font-normal text-white/45">· {order.student.email}</span></h3><p className="mt-1 text-[10px] text-white/40">{order.id} · {new Date(order.created_at).toLocaleString()}</p></div>
                <Status>{order.status}</Status>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.08] pt-3">
                <div><p className="text-xs font-bold">{order.items.map((item) => item.title).join(", ")}</p><p className="mt-1 text-[10px] text-white/45">Refunded {order.currency} {order.refunded_amount}</p></div>
                <strong className="text-sm">{order.currency} {order.total_amount}</strong>
              </div>
              {(order.status === "paid" || order.status === "partially_refunded") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input className={`${fieldClass} max-w-48`} type="number" min="0.01" step="0.01" placeholder="Refund amount (blank = remaining)" value={refundAmounts[order.id] || ""} onChange={(event) => setRefundAmounts((current) => ({ ...current, [order.id]: event.target.value }))} />
                  <button className={secondaryButtonClass} disabled={savingId === order.id} onClick={() => void refund(order)}>{savingId === order.id ? "Requesting…" : "Issue refund"}</button>
                </div>
              )}
            </article>
          ))}
          {!orders.length && <div className={cardClass}><p className="text-sm text-white/45">No orders yet.</p></div>}
        </div>
      )}

      {section === "Enrolments" && !loading && (
        <div className="space-y-3">
          {enrollments.map((enrollment) => <article className={`${cardClass} flex flex-wrap items-center justify-between gap-3`} key={enrollment.id}>
            <div><h3 className="font-bold">{enrollment.course_title}</h3><p className="mt-1 text-xs text-white/50">{enrollment.student_name} · {enrollment.student_email}</p></div>
            <div className="flex items-center gap-3"><Status>{enrollment.active ? "Active" : "Revoked"}</Status><span className="text-[10px] text-white/40">{new Date(enrollment.enrolled_at).toLocaleDateString()}</span></div>
          </article>)}
          {!enrollments.length && <div className={cardClass}><p className="text-sm text-white/45">No verified student enrolments yet.</p></div>}
        </div>
      )}
    </div>
  );
}
