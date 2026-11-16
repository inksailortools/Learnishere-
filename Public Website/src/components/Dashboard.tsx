import { motion } from "motion/react";
import { courses } from "../data";

const activity = [
  ["Responsive layout", "Lesson completed", "Today"],
  ["JavaScript foundations", "Quiz score · 86%", "Yesterday"],
  ["Portfolio brief", "Project opened", "2 days ago"],
];

export function Dashboard({ navigate }: { navigate: (to: string) => void }) {
  const course = courses.find((item) => item.slug === "modern-web-development")!;
  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <button className="dashboard-brand" onClick={() => navigate("/")}>
          <span>L</span>
          LearnIsphere
        </button>
        <nav aria-label="Student dashboard">
          {["Overview", "My learning", "Projects", "Certificates", "Learning activity"].map(
            (item, index) => (
              <button className={index === 0 ? "active" : ""} key={item}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {item}
              </button>
            ),
          )}
        </nav>
        <div className="dashboard-profile">
          <span>AJ</span>
          <div>
            <strong>Alex Johnson</strong>
            <small>Demo learner</small>
          </div>
        </div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="eyebrow">Monday · Learning week 08</span>
            <h1>Good morning, Alex.</h1>
            <p>Small steps become serious momentum. Here’s where you left off.</p>
          </div>
          <button onClick={() => navigate("/")}>Exit demo</button>
        </header>

        <div className="dashboard-stat-grid">
          {[
            ["64", "%", "Overall progress", 64],
            ["08", "days", "Learning streak", 80],
            ["12", "hrs", "Time invested", 52],
            ["03", "", "Projects completed", 72],
          ].map(([value, unit, label, progress], index) => (
            <motion.article
              key={String(label)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index }}
            >
              <div
                className="stat-ring"
                style={{ "--progress": `${progress}` } as React.CSSProperties}
              >
                <span />
              </div>
              <div>
                <strong>
                  {value}
                  <small>{unit}</small>
                </strong>
                <p>{label}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="dashboard-content-grid">
          <motion.article
            className="continue-learning-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="panel-label">
              <span>Continue learning</span>
              <small>64% complete</small>
            </div>
            <div className="continue-dashboard-card">
              <img src={course.image} alt="" />
              <div>
                <span>{course.category}</span>
                <h2>{course.title}</h2>
                <p>Module 3 · JavaScript foundations</p>
                <div className="dashboard-progress">
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: "64%" }}
                    transition={{ delay: 0.5, duration: 1.1 }}
                  />
                </div>
                <button onClick={() => navigate(`/course/${course.slug}`)}>
                  Continue lesson <b>→</b>
                </button>
              </div>
            </div>
          </motion.article>

          <motion.article
            className="weekly-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <div className="panel-label">
              <span>Weekly focus</span>
              <small>6h 24m</small>
            </div>
            <div className="dashboard-chart">
              {[38, 62, 46, 84, 72, 95, 55].map((height, index) => (
                <div key={index}>
                  <motion.i
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.45 + index * 0.06 }}
                  />
                  <span>{"MTWTFSS"[index]}</span>
                </div>
              ))}
            </div>
          </motion.article>
        </div>

        <div className="dashboard-lower-grid">
          <article className="activity-panel">
            <div className="panel-label">
              <span>Recent activity</span>
              <small>This week</small>
            </div>
            {activity.map(([title, description, time]) => (
              <div className="activity-row" key={title}>
                <span />
                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>
                <time>{time}</time>
              </div>
            ))}
          </article>
          <article className="milestone-panel">
            <span className="eyebrow">Next milestone</span>
            <div className="milestone-orbit">
              <span>72%</span>
            </div>
            <h3>JavaScript project</h3>
            <p>Complete two more lessons to unlock your guided project brief.</p>
          </article>
        </div>
        <p className="dashboard-disclaimer">
          Demonstration dashboard using sample learning data. No account or progress is stored.
        </p>
      </section>
    </main>
  );
}
