import { FormEvent, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Experience, Magnetic } from "./components/Experience";
import { categories, faqs, instructors, shortCourseNames } from "./data";
import { AuthPage } from "./components/AuthPage";
import { Icon } from "./components/SiteIcon";
import { CartPage, CheckoutPage, CourseDetailPage } from "./components/CommercePages";
import {
  commerceApi,
  formatCoursePrice,
  readCart,
  type CommerceCourse,
} from "./lib/commerce";

const LearningUniverse = lazy(() => import("./components/LearningUniverse"));
type Page =
  | { name: "home" }
  | { name: "courses" }
  | { name: "course"; slug: string }
  | { name: "category"; slug: string }
  | { name: "short-courses" }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "programmes" }
  | { name: "about" }
  | { name: "resources" }
  | { name: "contact" }
  | { name: "login" }
  | { name: "register" }
  | { name: "forgot-password" }
  | { name: "verify-email" }
  | { name: "reset-password" };

function parsePath(): Page {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { name: "home" };
  if (path === "/courses") return { name: "courses" };
  if (path === "/short-courses") return { name: "short-courses" };
  if (path === "/cart") return { name: "cart" };
  if (path === "/checkout") return { name: "checkout" };
  if (path === "/programmes") return { name: "programmes" };
  if (path === "/about") return { name: "about" };
  if (path === "/resources") return { name: "resources" };
  if (path === "/contact") return { name: "contact" };
  if (path === "/login") return { name: "login" };
  if (path === "/register") return { name: "register" };
  if (path === "/forgot-password") return { name: "forgot-password" };
  if (path === "/verify-email") return { name: "verify-email" };
  if (path === "/reset-password") return { name: "reset-password" };
  if (path.startsWith("/course/")) return { name: "course", slug: path.split("/")[2] };
  if (path.startsWith("/courses/")) return { name: "category", slug: path.split("/")[2] };
  return { name: "home" };
}

function useRouter() {
  const [page, setPage] = useState<Page>(parsePath);
  useEffect(() => {
    const update = () => setPage(parsePath());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPage(parsePath());
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  return { page, navigate };
}

function Logo({ navigate }: { navigate: (to: string) => void }) {
  return (
    <button className="logo" onClick={() => navigate("/")} aria-label="LearnIsphere home">
      <img className="brand-logo-image" src="/learnisphere-logo.png" alt="" aria-hidden="true" />
      <span>
        Learn<span>Isphere</span>
      </span>
    </button>
  );
}

function Header({
  navigate,
  theme,
  toggleTheme,
  cartCount,
}: {
  navigate: (to: string) => void;
  theme: string;
  toggleTheme: () => void;
  cartCount: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (to: string) => {
    setOpen(false);
    setMega(false);
    navigate(to);
  };
  return (
    <>
      <div className={`announcement ${scrolled ? "is-hidden" : ""}`}>
        <span>New pathways for ambitious learners worldwide.</span>
        <button onClick={() => go("/courses")}>
          Explore the catalogue <Icon name="arrow" size={15} />
        </button>
      </div>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav-shell">
          <Logo navigate={navigate} />
          <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
            <button onClick={() => go("/")}>Home</button>
            <div className="nav-dropdown">
              <button onClick={() => setMega(!mega)} aria-expanded={mega}>
                Courses <span className="chevron">⌄</span>
              </button>
              {mega && (
                <div className="mega-menu">
                  <div className="mega-intro">
                    <span className="eyebrow">Explore learning</span>
                    <h3>Find your next direction.</h3>
                    <p>Career-focused pathways built around practical capability.</p>
                    <button className="text-link" onClick={() => go("/courses")}>
                      View all courses <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <div className="mega-links">
                    {categories.slice(0, 8).map((c) => (
                      <button key={c.slug} onClick={() => go(`/courses/${c.slug}`)}>
                        <span style={{ background: c.accent }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => go("/programmes")}>Programmes</button>
            <button onClick={() => go("/short-courses")}>Short courses</button>
            <button onClick={() => go("/about")}>About</button>
            <button onClick={() => go("/resources")}>Resources</button>
            <button onClick={() => go("/contact")}>Contact</button>
          </nav>
          <div className="nav-actions">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button className="login-link" onClick={() => go("/login")}>
              Log in
            </button>
            <button className="icon-button cart-link" onClick={() => go("/cart")} aria-label={`Cart, ${cartCount} items`}>
              <Icon name="cart" size={19} />
              <span className="cart-count" aria-hidden="true">{cartCount}</span>
            </button>
            <button className="button compact" onClick={() => go("/register")}>
              Get started
            </button>
            <button
              className="icon-button menu-button"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function CourseCard({
  course,
  navigate,
  addToCart,
  buyNow,
}: {
  course: CommerceCourse;
  navigate: (to: string) => void;
  addToCart: (course: CommerceCourse) => void;
  buyNow: (course: CommerceCourse) => void;
}) {
  return (
    <motion.article
      className="course-card"
      whileHover={{ y: -7, rotateX: 1.5, rotateY: -1.5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <button
        className="course-image"
        onClick={() => navigate(`/course/${course.slug}`)}
        aria-label={`View ${course.title}`}
      >
        <img src={course.image} alt="" />
        <span className="course-type">{course.type}</span>
      </button>
      <div className="course-body">
        <span className="course-category">{course.category}</span>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span>
            <Icon name="clock" size={16} />
            {course.duration}
          </span>
          <span>
            <Icon name="level" size={16} />
            {course.level}
          </span>
        </div>
        <div className="course-footer">
          <div className="course-pricing">
            {course.price_available ? (
              <>
                <strong>{formatCoursePrice(course.price, course.currency)}</strong>
                {course.list_price && course.price && Number(course.list_price) > Number(course.price) && (
                  <span className="course-price-discount">
                    <s>{formatCoursePrice(course.list_price, course.currency)}</s>
                    <small>Save {course.discount_percent}%</small>
                  </span>
                )}
              </>
            ) : <strong className="price-unavailable">Price currently unavailable</strong>}
          </div>
          <div className="course-actions">
            <button className="button compact" disabled={!course.purchasable} onClick={() => buyNow(course)}>
              Buy Now
            </button>
            <button className="button secondary compact" disabled={!course.purchasable} onClick={() => addToCart(course)}>
              Add to Cart
            </button>
            <button className="course-details-link" onClick={() => navigate(`/course/${course.slug}`)}>
              View Details <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Hero({ navigate }: { navigate: (to: string) => void }) {
  const reducedMotion = useReducedMotion();
  const [threeReady, setThreeReady] = useState(false);
  const { scrollYProgress } = useScroll();
  const copyY = useTransform(scrollYProgress, [0, 0.16], [0, reducedMotion ? 0 : 70]);
  const visualY = useTransform(scrollYProgress, [0, 0.18], [0, reducedMotion ? 0 : -55]);

  useEffect(() => {
    if (reducedMotion || window.innerWidth < 760) return;
    if ("requestIdleCallback" in window) {
      const idle = window.requestIdleCallback(() => setThreeReady(true), { timeout: 1800 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = globalThis.setTimeout(() => setThreeReady(true), 900);
    return () => globalThis.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <section className="hero">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          style={{ y: copyY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
          >
            <span className="eyebrow-dot" />
            Your next chapter starts here
          </motion.span>
          <h1>
            <motion.span
              className="hero-line hero-line-light"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.08, duration: 0.9 }}
            >
              Don’t just learn.
            </motion.span>
            <br />
            <motion.span
              className="hero-line"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.18, duration: 0.9 }}
            >
              Build what’s next.
            </motion.span>
          </h1>
          <p>
            A clearer path from curious beginner to confident professional. Learn the fundamentals,
            put them into practice, and turn your ambition into real-world capability.
          </p>
          <div className="hero-actions">
            <Magnetic className="button" onClick={() => navigate("/courses")}>
              Explore learning paths <Icon name="arrow" />
            </Magnetic>
            <button
              className="button secondary"
              onClick={() =>
                document.querySelector("#approach")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <span className="play-icon">
                <Icon name="play" size={16} />
              </span>
              How it works
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <Icon name="globe" />
              Learn from anywhere
            </span>
            <span>
              <Icon name="book" />
              Practice-led pathways
            </span>
          </div>
        </motion.div>
        <motion.div
          className="platform-preview"
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.94, rotateY: -5 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.25, duration: 1.15 }}
        >
          {threeReady && (
            <Suspense fallback={null}>
              <LearningUniverse />
            </Suspense>
          )}
          <div className="preview-glow" />
          <div className="preview-window">
            <div className="window-top">
              <span className="mini-logo">L</span>
              <div className="window-search">Search your learning</div>
              <div className="avatar">AJ</div>
            </div>
            <div className="window-body">
              <aside>
                <span className="side-active">Overview</span>
                <span>My learning</span>
                <span>Projects</span>
                <span>Certificates</span>
                <div className="side-card">
                  <small>Weekly progress</small>
                  <strong>4 of 5</strong>
                  <div>
                    <i />
                  </div>
                </div>
              </aside>
              <main>
                <p className="preview-kicker">WELCOME BACK, ALEX</p>
                <h3>Keep building momentum.</h3>
                <div className="continue-card">
                  <div className="continue-art">
                    <span>&lt;/&gt;</span>
                  </div>
                  <div>
                    <small>CONTINUE LEARNING</small>
                    <strong>Modern Web Development</strong>
                    <p>Module 3 · JavaScript foundations</p>
                    <div className="progress">
                      <i />
                    </div>
                  </div>
                  <button>
                    <Icon name="play" size={15} />
                  </button>
                </div>
                <div className="preview-stats">
                  <div>
                    <span>Learning streak</span>
                    <strong>
                      08 <small>days</small>
                    </strong>
                  </div>
                  <div>
                    <span>Course progress</span>
                    <strong>
                      64<small>%</small>
                    </strong>
                  </div>
                  <div>
                    <span>Projects</span>
                    <strong>03</strong>
                  </div>
                </div>
                <div className="preview-bottom">
                  <div>
                    <span>Recent activity</span>
                    <p>
                      <i />
                      Responsive layout completed
                    </p>
                    <p>
                      <i />
                      Quiz score recorded
                    </p>
                  </div>
                  <div className="mini-chart">
                    <span>Weekly focus</span>
                    <div>
                      <i style={{ height: "35%" }} />
                      <i style={{ height: "55%" }} />
                      <i style={{ height: "42%" }} />
                      <i style={{ height: "80%" }} />
                      <i style={{ height: "66%" }} />
                      <i style={{ height: "92%" }} />
                      <i style={{ height: "50%" }} />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="float-card">
            <span>
              <Icon name="check" size={16} />
            </span>
            <div>
              <small>MODULE COMPLETE</small>
              <strong>Great work, Alex.</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Home({
  navigate,
  courses,
  loading,
  error,
  retry,
  addToCart,
  buyNow,
}: {
  navigate: (to: string) => void;
  courses: CommerceCourse[];
  loading: boolean;
  error: string;
  retry: () => void;
  addToCart: (course: CommerceCourse) => void;
  buyNow: (course: CommerceCourse) => void;
}) {
  return (
    <main>
      <Hero navigate={navigate} />
      <section className="section categories-section">
        <SectionHeading
          eyebrow="Explore your direction"
          title="Skills that move careers forward."
          copy="Choose a focused starting point, then build capability through structured practice."
          action={
            <button className="text-link" onClick={() => navigate("/courses")}>
              All categories <Icon name="arrow" size={17} />
            </button>
          }
        />
        <div className="category-grid">
          {categories.slice(0, 8).map((category, index) => (
            <button
              className="category-card"
              key={category.slug}
              onClick={() => navigate(`/courses/${category.slug}`)}
            >
              <span className="category-number">0{index + 1}</span>
              <span
                className="category-icon"
                style={{ "--accent": category.accent } as React.CSSProperties}
              >
                {category.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <h3>{category.name}</h3>
              <p>{category.short}</p>
              <span className="card-arrow">
                <Icon name="arrow" />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="section muted-section">
        <SectionHeading
          eyebrow="Featured programmes"
          title="Deep learning. Practical outcomes."
          copy="Structured programmes designed to help you apply new knowledge with clarity."
        />
        <div className="course-grid">
          {courses
            .filter((c) => c.featured)
            .map((c) => (
              <CourseCard key={c.slug} course={c} navigate={navigate} addToCart={addToCart} buyNow={buyNow} />
            ))}
        </div>
        {loading ? (
          <p className="catalogue-status">Loading featured courses…</p>
        ) : error ? (
          <p className="catalogue-status" role="alert">{error} <button className="text-link" onClick={retry}>Try again</button></p>
        ) : !courses.length ? (
          <p className="catalogue-status">No featured courses are currently published.</p>
        ) : null}
      </section>
      <section className="section split-feature" id="approach">
        <div className="feature-visual">
          <img
            src="https://images.unsplash.com/photo-1758270705317-3ef6142d306f?auto=format&fit=crop&w=1200&q=84"
            alt="Students collaborating around a laptop"
          />
          <div className="visual-note">
            <span>Learn by doing</span>
            <strong>Projects turn knowledge into capability.</strong>
          </div>
        </div>
        <div className="feature-copy">
          <span className="eyebrow">Why LearnIsphere</span>
          <h2>A learning journey designed around progress.</h2>
          <p>
            We connect clear teaching with guided practice, feedback and meaningful milestones—so
            you always know what you are learning and why it matters.
          </p>
          <div className="feature-list">
            {[
              [
                "01",
                "Structured pathways",
                "Move through carefully sequenced concepts without losing the bigger picture.",
              ],
              [
                "02",
                "Practical projects",
                "Apply ideas to realistic tasks that help build confidence and evidence.",
              ],
              ["03", "Visible progress", "Understand what you have completed and what comes next."],
            ].map((item) => (
              <div key={item[0]}>
                <span>{item[0]}</span>
                <div>
                  <h3>{item[1]}</h3>
                  <p>{item[2]}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="button secondary" onClick={() => navigate("/about")}>
            Our learning approach <Icon name="arrow" />
          </button>
        </div>
      </section>
      <section className="section journey-section">
        <SectionHeading
          eyebrow="How it works"
          title="From curiosity to completion."
          copy="A simple journey, supported at every meaningful step."
        />
        <div className="journey-line">
          {["Discover", "Enrol", "Learn", "Practice", "Complete", "Earn certificate"].map(
            (step, index) => (
              <div key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step}</h3>
                <p>
                  {
                    [
                      "Find a pathway that fits your goal.",
                      "Choose your course and confirm access.",
                      "Work through clear, focused lessons.",
                      "Apply skills through guided activities.",
                      "Meet the configured requirements.",
                      "Receive recognition when eligible.",
                    ][index]
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </section>
      <section className="section short-section">
        <div className="short-intro">
          <span className="eyebrow">Short courses</span>
          <h2>Focused learning for the skill you need now.</h2>
          <p>Build a specific capability through concise, practical learning.</p>
          <button className="button" onClick={() => navigate("/short-courses")}>
            Browse short courses <Icon name="arrow" />
          </button>
        </div>
        <div className="short-list">
          {shortCourseNames.map((name, index) => (
            <button key={name} onClick={() => navigate("/short-courses")}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}</strong>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>
      <section className="section instructor-section">
        <SectionHeading
          eyebrow="Meet your guides"
          title="Learn with experienced practitioners."
          copy="Sample instructor profiles shown for interface review. Final identities and credentials will be verified before publication."
        />
        <div className="instructor-grid">
          {instructors.map((person, index) => (
            <article key={person.name}>
              <div>
                <img src={person.image} alt={`Sample instructor ${person.name}`} />
                <span>Sample profile</span>
              </div>
              <small>0{index + 1}</small>
              <h3>{person.name}</h3>
              <p>{person.area}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section testimonial-section">
        <span className="eyebrow">Student perspective</span>
        <blockquote>
          “The best learning experiences make the next step feel clear—and give you the confidence
          to take it.”
        </blockquote>
        <p>
          Illustrative testimonial copy for interface preview only. Not a genuine student review.
        </p>
      </section>
      <section className="section faq-section">
        <div>
          <span className="eyebrow">Questions, answered</span>
          <h2>Everything you need to know before you begin.</h2>
          <p>Can’t find your answer? Our team can help.</p>
          <button className="text-link" onClick={() => navigate("/contact")}>
            Talk to us <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <FinalCta navigate={navigate} />
    </main>
  );
}

function CourseCatalogue({
  navigate,
  courses,
  loading,
  error,
  retry,
  addToCart,
  buyNow,
  initialCategory,
}: {
  navigate: (to: string) => void;
  courses: CommerceCourse[];
  loading: boolean;
  error: string;
  retry: () => void;
  addToCart: (course: CommerceCourse) => void;
  buyNow: (course: CommerceCourse) => void;
  initialCategory?: string;
}) {
  const categoryName = categories.find((c) => c.slug === initialCategory)?.name || "All";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categoryName);
  const [type, setType] = useState("All");
  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (category === "All" || c.category === category) &&
          (type === "All" || c.type === type) &&
          `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [courses, query, category, type],
  );
  return (
    <main className="inner-page">
      <PageHero
        eyebrow={initialCategory ? "Learning category" : "Course catalogue"}
        title={initialCategory ? categoryName : "Find the learning that fits your next move."}
        copy={
          initialCategory
            ? categories.find((c) => c.slug === initialCategory)?.short || ""
            : "Explore professional programmes, certifications, SAP modules and focused short courses."
        }
      />
      <section className="section catalogue">
        <div className="filter-bar">
          <label className="search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
            />
            <span className="sr-only">Search courses</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by programme type"
          >
            <option>All</option>
            {["Diploma", "Master's", "Certification", "Short course", "Module"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="result-row">
          <p>
            <strong>{loading ? "—" : filtered.length}</strong> learning options
          </p>
            <span>Prices are provided by LearnIsphere</span>
        </div>
        {loading ? (
            <div className="empty-state"><p>Loading courses and prices…</p></div>
        ) : error ? (
            <div className="empty-state" role="alert">
              <h3>Courses are temporarily unavailable</h3>
              <p>{error}</p>
              <button className="button secondary" onClick={retry}>Try again</button>
            </div>
        ) : filtered.length ? (
          <div className="course-grid">
            {filtered.map((c) => (
                <CourseCard key={c.slug} course={c} navigate={navigate} addToCart={addToCart} buyNow={buyNow} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No matching courses</h3>
            <p>Try a broader search or clear one of your filters.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setType("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <FinalCta navigate={navigate} />
    </main>
  );
}

function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="page-hero">
      <div className="orb orb-one" />
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  );
}

function ShortCourses({
  navigate,
  courses,
  addToCart,
  buyNow,
}: {
  navigate: (to: string) => void;
  courses: CommerceCourse[];
  addToCart: (course: CommerceCourse) => void;
  buyNow: (course: CommerceCourse) => void;
}) {
  const short = courses.filter((c) => c.type === "Short course");
  return (
    <main className="inner-page">
      <PageHero
        eyebrow="Short courses"
        title="Targeted skills. Built for momentum."
        copy="Choose an individual course and review its published price, learning outcomes and curriculum."
      />
      <section className="section">
        <div className="pill-cloud">
          {shortCourseNames.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <SectionHeading
          eyebrow="Available now"
          title="Start with one practical skill."
          copy="Prices and availability come from LearnIsphere course records. Courses without a published price cannot be purchased."
        />
        <div className="course-grid">
          {short.map((c) => (
            <CourseCard course={c} navigate={navigate} addToCart={addToCart} buyNow={buyNow} key={c.slug} />
          ))}
        </div>
      </section>
      <FinalCta navigate={navigate} />
    </main>
  );
}

function Programmes({ navigate }: { navigate: (to: string) => void }) {
  return (
    <main className="inner-page">
      <PageHero
        eyebrow="Professional programmes"
        title="Go deeper with a structured pathway."
        copy="Explore diploma, master’s-level professional training and certification pathways with programme-specific recognition details."
      />
      <section className="section programme-types">
        {[
          [
            "Diploma programmes",
            "Build broad, applied capability through an extended professional learning pathway.",
          ],
          [
            "Master's programmes",
            "Advanced professional programmes where offered. Award and recognition details are always stated individually.",
          ],
          [
            "Certification programmes",
            "Focused preparation and practical development around a defined area of practice.",
          ],
        ].map((x, i) => (
          <article key={x[0]}>
            <span>0{i + 1}</span>
            <h2>{x[0]}</h2>
            <p>{x[1]}</p>
            <button className="text-link" onClick={() => navigate("/courses")}>
              Explore programmes <Icon name="arrow" size={17} />
            </button>
          </article>
        ))}
      </section>
      <section className="section standards-panel">
        <div>
          <span className="eyebrow">Clear by design</span>
          <h2>Qualification information you can understand.</h2>
        </div>
        <div>
          {[
            "Programme type",
            "Awarding institution",
            "Recognition or accreditation",
            "Eligibility",
            "Completion requirements",
          ].map((x) => (
            <p key={x}>
              <Icon name="check" size={17} />
              {x}
            </p>
          ))}
        </div>
      </section>
      <FinalCta navigate={navigate} />
    </main>
  );
}

function ContentPage({
  kind,
  navigate,
}: {
  kind: "about" | "resources";
  navigate: (to: string) => void;
}) {
  const about = kind === "about";
  return (
    <main className="inner-page">
      <PageHero
        eyebrow={about ? "About LearnIsphere" : "Resources"}
        title={
          about ? "Learning should create forward motion." : "Ideas to support your next step."
        }
        copy={
          about
            ? "We are building a worldwide learning platform around clarity, practical application and meaningful progress."
            : "Explore sample guides for choosing a pathway, building a learning habit and applying new skills."
        }
      />
      {about ? (
        <>
          <section className="section editorial-grid">
            <div>
              <span className="eyebrow">Our purpose</span>
              <h2>Make professional learning feel clear, useful and human.</h2>
            </div>
            <div>
              <p>
                LearnIsphere is designed for people who want to build practical capability without
                losing sight of the bigger career picture.
              </p>
              <p>
                Our approach connects structured concepts, guided practice, assessments and progress
                into a learning experience that respects both ambition and real life.
              </p>
            </div>
          </section>
          <section className="section value-grid">
            {[
              ["Clarity", "Know where you are going and what each step is designed to achieve."],
              [
                "Practice",
                "Turn concepts into capability through meaningful activities and projects.",
              ],
              ["Integrity", "Describe programme recognition, outcomes and evidence responsibly."],
              [
                "Access",
                "Design a responsive, inclusive experience for learners around the world.",
              ],
            ].map((x, i) => (
              <article key={x[0]}>
                <span>0{i + 1}</span>
                <h3>{x[0]}</h3>
                <p>{x[1]}</p>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="section resource-grid">
          {[
            [
              "Choosing the right learning pathway",
              "A practical framework for connecting your current skills, goals and available time.",
              "6 min read",
            ],
            [
              "How to build a sustainable study routine",
              "Simple ways to protect focus and keep moving when life gets busy.",
              "5 min read",
            ],
            [
              "From course project to portfolio story",
              "Turn the work you complete into a clear account of your decisions and growth.",
              "8 min read",
            ],
            [
              "What to check before choosing a programme",
              "Questions to ask about outcomes, recognition, support and completion requirements.",
              "7 min read",
            ],
            [
              "A beginner’s guide to responsible AI use",
              "Use AI tools thoughtfully while protecting privacy, quality and human judgement.",
              "9 min read",
            ],
            [
              "Making feedback part of your practice",
              "A repeatable way to receive, evaluate and apply useful feedback.",
              "5 min read",
            ],
          ].map((x, i) => (
            <article key={x[0]}>
              <span>GUIDE 0{i + 1}</span>
              <h2>{x[0]}</h2>
              <p>{x[1]}</p>
              <small>{x[2]}</small>
              <button aria-label={`Open ${x[0]}`}>
                <Icon name="arrow" />
              </button>
            </article>
          ))}
        </section>
      )}
      <FinalCta navigate={navigate} />
    </main>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <main className="inner-page">
      <PageHero
        eyebrow="Contact"
        title="Let’s find the right next step."
        copy="Ask about a course, programme, team learning or the LearnIsphere experience."
      />
      <section className="section contact-grid">
        <div className="contact-copy">
          <span className="eyebrow">Talk to our team</span>
          <h2>Good questions are a great place to start.</h2>
          <p>
            This demonstration form does not send data to a server. Backend delivery and consent
            records will be connected in a later phase.
          </p>
          <div>
            <span>General enquiries</span>
            <strong>hello@learnisphere.example</strong>
          </div>
          <div>
            <span>Programme guidance</span>
            <strong>admissions@learnisphere.example</strong>
          </div>
        </div>
        {sent ? (
          <div className="form-success">
            <span>
              <Icon name="check" />
            </span>
            <h2>Thanks for your message.</h2>
            <p>
              This is a frontend demonstration, so nothing was transmitted. The completed interface
              is ready for a secure form endpoint.
            </p>
            <button className="button secondary" onClick={() => setSent(false)}>
              Send another
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <div className="field-row">
              <label>
                First name
                <input required name="firstName" />
              </label>
              <label>
                Last name
                <input required name="lastName" />
              </label>
            </div>
            <label>
              Email address
              <input required type="email" name="email" />
            </label>
            <label>
              I’m interested in
              <select name="interest">
                <option>Choosing a course</option>
                <option>Professional programmes</option>
                <option>Short courses</option>
                <option>Team learning</option>
                <option>General enquiry</option>
              </select>
            </label>
            <label>
              How can we help?
              <textarea required rows={5} name="message" />
            </label>
            <label className="check-field">
              <input type="checkbox" required />
              <span>
                I agree to be contacted about this enquiry. No marketing subscription is implied.
              </span>
            </label>
            <button className="button" type="submit">
              Send enquiry <Icon name="arrow" />
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function FinalCta({ navigate }: { navigate: (to: string) => void }) {
  return (
    <section className="final-cta">
      <div className="cta-orb" />
      <span className="eyebrow">Your next step</span>
      <h2>Build the future you can see.</h2>
      <p>Explore practical learning designed to turn curiosity into confidence.</p>
      <div>
        <button className="button light" onClick={() => navigate("/courses")}>
          Explore learning paths <Icon name="arrow" />
        </button>
        <button className="button ghost" onClick={() => navigate("/contact")}>
          Talk to our team
        </button>
      </div>
    </section>
  );
}

function Footer({ navigate }: { navigate: (to: string) => void }) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Logo navigate={navigate} />
          <p>
            Learn. Build. Grow.
            <br />
            Advance your career.
          </p>
          <span>Worldwide online learning</span>
        </div>
        <div>
          <h3>Explore</h3>
          <button onClick={() => navigate("/courses")}>All courses</button>
          <button onClick={() => navigate("/programmes")}>Professional programmes</button>
          <button onClick={() => navigate("/short-courses")}>Short courses</button>
          <button onClick={() => navigate("/courses/sap")}>SAP training</button>
        </div>
        <div>
          <h3>LearnIsphere</h3>
          <button onClick={() => navigate("/about")}>About us</button>
          <button onClick={() => navigate("/resources")}>Resources</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
          <button onClick={() => navigate("/contact")}>Support</button>
        </div>
        <div className="newsletter">
          <h3>A useful note, occasionally.</h3>
          <p>Learning ideas and new course updates. Demo signup only.</p>
          {subscribed ? (
            <strong>Preview subscribed — no data was sent.</strong>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <input
                required
                type="email"
                aria-label="Email for newsletter"
                placeholder="Email address"
              />
              <button aria-label="Subscribe">
                <Icon name="arrow" />
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} LearnIsphere. Frontend preview.</span>
        <div>
          <button>Privacy</button>
          <button>Cookies</button>
          <button>Terms</button>
          <button>Accessibility</button>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const { page, navigate } = useRouter();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  const [catalog, setCatalog] = useState<{ courses: CommerceCourse[]; loading: boolean; error: string }>({
    courses: [],
    loading: true,
    error: "",
  });
  const [catalogReload, setCatalogReload] = useState(0);
  const [cartSlugs, setCartSlugs] = useState<string[]>(readCart);
  useEffect(() => {
    let active = true;
    setCatalog({ courses: [], loading: true, error: "" });
    commerceApi.listCourses().then(
      (courses) => {
        if (active) setCatalog({ courses, loading: false, error: "" });
      },
      (reason: unknown) => {
        if (active) {
          setCatalog({
            courses: [],
            loading: false,
            error: reason instanceof Error ? reason.message : "The course service could not be reached.",
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [catalogReload]);
  useEffect(() => {
    window.localStorage.setItem("learnisphere-cart", JSON.stringify(cartSlugs));
  }, [cartSlugs]);
  const addToCart = (course: CommerceCourse) => {
    if (!course.purchasable) return;
    setCartSlugs((current) => current.includes(course.slug) ? current : [...current, course.slug]);
  };
  const buyNow = (course: CommerceCourse) => {
    if (!course.purchasable) return;
    setCartSlugs([course.slug]);
    navigate("/checkout");
  };
  const removeFromCart = (slug: string) => {
    setCartSlugs((current) => current.filter((item) => item !== slug));
  };
  const clearCart = () => setCartSlugs([]);
  const retryCatalog = () => setCatalogReload((current) => current + 1);
  const cartCount = cartSlugs.length;
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("learnisphere-theme", next);
    setTheme(next);
  };
  if (
    page.name === "login" ||
    page.name === "register" ||
    page.name === "forgot-password" ||
    page.name === "verify-email" ||
    page.name === "reset-password"
  ) {
    return <AuthPage page={page.name} navigate={navigate} />;
  }
  let content: React.ReactNode;
  const catalogProps = {
    courses: catalog.courses,
    loading: catalog.loading,
    error: catalog.error,
    retry: retryCatalog,
    addToCart,
    buyNow,
  };
  if (page.name === "home") content = <Home navigate={navigate} {...catalogProps} />;
  else if (page.name === "courses") content = <CourseCatalogue navigate={navigate} {...catalogProps} />;
  else if (page.name === "category")
    content = <CourseCatalogue navigate={navigate} {...catalogProps} initialCategory={page.slug} />;
  else if (page.name === "course") {
    const course = catalog.courses.find((c) => c.slug === page.slug);
    content = catalog.loading ? (
      <main className="inner-page"><section className="section checkout-message"><p>Loading course details and current pricing…</p></section></main>
    ) : catalog.error ? (
      <main className="inner-page"><section className="section empty-state" role="alert"><h2>Course details are unavailable</h2><p>{catalog.error}</p><button className="button secondary" onClick={retryCatalog}>Try again</button></section></main>
    ) : course ? (
      <CourseDetailPage course={course} navigate={navigate} addToCart={addToCart} buyNow={buyNow} />
    ) : (
      <main className="inner-page"><section className="section empty-state"><h2>Course not found</h2><p>This course is unpublished or no longer available.</p><button className="button" onClick={() => navigate("/courses")}>Browse courses</button></section></main>
    );
  } else if (page.name === "short-courses")
    content = <ShortCourses navigate={navigate} courses={catalog.courses} addToCart={addToCart} buyNow={buyNow} />;
  else if (page.name === "cart")
    content = <CartPage courses={catalog.courses} cartSlugs={cartSlugs} removeFromCart={removeFromCart} navigate={navigate} />;
  else if (page.name === "checkout")
    content = <CheckoutPage courses={catalog.courses} cartSlugs={cartSlugs} clearCart={clearCart} navigate={navigate} />;
  else if (page.name === "programmes") content = <Programmes navigate={navigate} />;
  else if (page.name === "about" || page.name === "resources")
    content = <ContentPage kind={page.name} navigate={navigate} />;
  else content = <Contact />;
  return (
    <Experience>
      <Header navigate={navigate} theme={theme} toggleTheme={toggleTheme} cartCount={cartCount} />
      {content}
      <Footer navigate={navigate} />
    </Experience>
  );
}
