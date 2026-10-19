import API from "./api";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import Auth from "./Auth";
import "./App.css";
import LearningPage from "./LearningPage";



function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch(`${API}/api/courses/published`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch courses.");
        }

        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message || "Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
       
<Link to="/" className="logo">
  <span className="logo-icon">🎓</span>
  <span className="logo-text">
    Edu<span>Sync</span>
  </span>
</Link>


        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <Link className="login-btn" to="/login">
            Login
          </Link>
          <Link className="signup-btn" to="/register">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">LEARN WITHOUT LIMITS</p>

          <h1>
            Build Your Future With <span>EduSync</span>
          </h1>

          <p className="hero-description">
            Learn new skills, explore expert-led courses, and take the next
            step toward your career goals with EduSync.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() =>
                document
                  .getElementById("courses")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Courses →
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </button>
          </div>

          <div className="stats">
            <div>
              <h3>Learn</h3>
              <p>At your own pace</p>
            </div>
            <div>
              <h3>Practice</h3>
              <p>Build real skills</p>
            </div>
            <div>
              <h3>Grow</h3>
              <p>Reach your goals</p>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="course-icon">🎓</div>
          <p className="card-label">YOUR LEARNING JOURNEY</p>
          <h2>Every skill takes you one step forward.</h2>

          <div className="progress-info">
            <span>Keep learning</span>
            <span>100% potential</span>
          </div>

          <div className="progress-bar">
            <div />
          </div>

          <div className="learning-footer">
            <span>📚</span>
            <div>
              <strong>Your next chapter starts here</strong>
              <p>Discover something new today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-section" id="courses">
        <p className="tagline">START LEARNING TODAY</p>
        <h2>Explore Our Courses</h2>

        <p className="section-description">
          Build practical skills with courses designed to help you move forward.
        </p>

        {loading && <p>Loading courses...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p>No published courses available yet.</p>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="course-grid">
            {courses.map((course) => (
              <article className="course-card" key={course._id}>
                <div className="course-banner blue">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "</>"
                  )}
                </div>

                <div className="course-body">
                  <span className="course-category">
                    {course.category || "General"}
                  </span>

                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <div className="course-bottom">
                    <span>
                      {course.level
                        ? course.level.charAt(0).toUpperCase() +
                          course.level.slice(1)
                        : "All levels"}
                    </span>

                    <strong>
                      ₹{Number(course.price || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <p>
                    Instructor: {course.instructor?.name || "EduSync Instructor"}
                  </p>
                 ```jsx
<button
  className="enroll-button"
  onClick={async () => {
    const token = localStorage.getItem("edusyncToken");
    const user = JSON.parse(
      localStorage.getItem("edusyncUser") || "{}"
    );

    if (!token) {
      alert("Please login first to enroll in this course.");
      return;
    }

    if (user.role !== "student") {
      alert("Please login with a student account to enroll.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/enrollments/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Enrollment failed.");
        return;
      }

      alert("Course enrolled successfully!");
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  }}
>
  Enroll Now
</button>
```
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="about-section" id="about">
        <p className="tagline">WHY EDUSYNC?</p>
        <h2>Learning that moves you forward.</h2>
        <p>
          Discover courses, track your progress, and develop skills with a
          learning experience built around your goals.
        </p>
      </section>

      <footer className="footer">
        <h2>
          EduSync<span>.</span>
        </h2>
        <p>Learn today. Grow tomorrow.</p>
        <p>© 2026 EduSync. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Dashboard({ role }) {
  const user = JSON.parse(localStorage.getItem("edusyncUser") || "null");
  const token = localStorage.getItem("edusyncToken");
  const isInstructor = role === "instructor";

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    title: "",
    description: "",
    category: "",
    price: "",
    level: "beginner",
  };

  const [form, setForm] = useState(emptyForm);

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      if (isInstructor) {
        const data = await apiRequest(
          `${API}/api/courses/my-courses`
        );

        setCourses(data.courses || data.data || []);

        try {
          const dashboardData = await apiRequest(
            `${API}/api/instructor/dashboard`
          );

          setStats(
            dashboardData.stats ||
              dashboardData.dashboard ||
              dashboardData
          );
        } catch {
          setStats(null);
        }
      } else {
       
const endpoint =
  role === "student"
    ? `${API}/api/student-dashboard`
    : `${API}/api/admin/dashboard`;


        const data = await apiRequest(endpoint);

        if (role === "student") {
          setStats(
            data.statistics ||
              data.stats ||
              data.dashboard ||
              data
          );
          setEnrolledCourses(data.enrolledCourses || []);
          setQuizAttempts(data.quizAttempts || []);
          setAssignments(data.assignments || []);
        } else {
          setStats(data.stats || data.dashboard || data);
        }
      }
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && token) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [role]);

  function logout() {
    localStorage.removeItem("edusyncToken");
    localStorage.removeItem("edusyncUser");
    window.location.href = "/";
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(course) {
    setEditingId(course._id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      price: String(course.price ?? ""),
      level: course.level || "beginner",
    });
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      const url = editingId
        ? `${API}/api/courses/update/${editingId}`
        : `${API}/api/courses/create`;

      await apiRequest(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setMessage(
        editingId
          ? "Course updated successfully!"
          : "Course created successfully!"
      );
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(
        `${API}/api/courses/delete/${course._id}`,
        { method: "DELETE" }
      );

      setMessage("Course deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to delete course.");
    }
  }

  async function handlePublish(course) {
    setError("");
    setMessage("");

    try {
      await apiRequest(
        `${API}/api/courses/publish/${course._id}`,
        { method: "PATCH" }
      );

      setMessage("Course publication status updated.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to update publication status.");
    }
  }

  if (!user || !token) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-panel">
          <h1>Login required</h1>
          <p>Please log in to view your dashboard.</p>
          <Link className="dash-button dash-primary" to="/login">
            Go to Login
          </Link>
        </section>
      </main>
    );
  }

  const publishedCount = courses.filter(
    (course) => course.isPublished
  ).length;

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <Link to="/" className="dashboard-logo">
          EduSync<span>.</span>
        </Link>

        <div className="dashboard-user">
          <div className="dashboard-avatar">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name}</strong>
            <span>{role}</span>
          </div>
          <button className="dash-button dash-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-heading">
          <div>
            <p className="dashboard-eyebrow">YOUR LEARNING SPACE</p>
            <h1>
              {isInstructor
                ? "Instructor Dashboard"
                : `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
            </h1>
            <p>
              Welcome back, {user.name}! Ready to make progress today?
            </p>
          </div>

          {isInstructor && (
            <button
              className="dash-button dash-primary"
              onClick={startCreate}
            >
              + Create Course
            </button>
          )}
        </section>

        {message && (
          <div className="dashboard-alert dashboard-success">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="dashboard-alert dashboard-error">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {isInstructor && showForm && (
          <section className="dashboard-form-panel">
            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-eyebrow">COURSE DETAILS</p>
                <h2>{editingId ? "Edit course" : "Create a new course"}</h2>
              </div>
              <button
                className="dash-button dash-outline"
                onClick={() => setShowForm(false)}
                type="button"
              >
                Cancel
              </button>
            </div>

            <form className="course-form" onSubmit={handleSubmit}>
              <label>
                Course title
                <input
                  required
                  minLength={3}
                  maxLength={120}
                  value={form.title}
                  placeholder="e.g. Complete MERN Stack Development"
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={form.description}
                  placeholder="What will students learn in this course?"
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <div className="course-form-row">
                <label>
                  Category
                  <input
                    required
                    value={form.category}
                    placeholder="e.g. Web Development"
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </label>

                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    placeholder="999"
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </label>

                <label>
                  Difficulty
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
              </div>

              <button
                className="dash-button dash-primary"
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Course"}
              </button>
            </form>
          </section>
        )}

        {loading ? (
          <section className="dashboard-loading">
            <div className="dashboard-spinner" />
            <p>Loading your dashboard...</p>
          </section>
        ) : (
          <>
            {isInstructor && (
              <>
                <section className="dashboard-stat-grid">
                  <article className="dashboard-stat-card">
                    <span className="stat-icon">📚</span>
                    <p>Total courses</p>
                    <h2>{courses.length}</h2>
                    <span className="stat-caption">Courses you manage</span>
                  </article>

                  <article className="dashboard-stat-card">
                    <span className="stat-icon">🌐</span>
                    <p>Published courses</p>
                    <h2>{publishedCount}</h2>
                    <span className="stat-caption">Visible to learners</span>
                  </article>

                  <article className="dashboard-stat-card">
                    <span className="stat-icon">📝</span>
                    <p>Draft courses</p>
                    <h2>{courses.length - publishedCount}</h2>
                    <span className="stat-caption">Still in preparation</span>
                  </article>
                </section>

                <section className="dashboard-courses-section">
                  <div className="dashboard-section-heading">
                    <div>
                      <p className="dashboard-eyebrow">YOUR CONTENT</p>
                      <h2>My Courses</h2>
                      <p>
                        Manage your courses and keep your content up to date.
                      </p>
                    </div>
                    <button
                      className="dash-button dash-primary"
                      onClick={startCreate}
                    >
                      + New Course
                    </button>
                  </div>

                  {courses.length === 0 ? (
                    <div className="dashboard-empty">
                      <div>🎓</div>
                      <h3>Your teaching journey starts here</h3>
                      <p>
                        Create your first course and share your knowledge
                        with learners.
                      </p>
                      <button
                        className="dash-button dash-primary"
                        onClick={startCreate}
                      >
                        Create your first course
                      </button>
                    </div>
                  ) : (
                    <div className="dashboard-course-grid">
                      {courses.map((course) => (
                        <article
                          className="dashboard-course-card"
                          key={course._id}
                        >
                          <div className="dashboard-course-banner">
                            <span>📘</span>
                            <span
                              className={
                                course.isPublished
                                  ? "course-status published"
                                  : "course-status draft"
                              }
                            >
                              {course.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>

                          <div className="dashboard-course-body">
                            <span className="dashboard-category">
                              {course.category || "General"}
                            </span>
                            <h3>{course.title}</h3>
                            <p className="dashboard-course-description">
                              {course.description}
                            </p>

                            <div className="dashboard-course-meta">
                              <strong>
                                ₹{Number(course.price || 0).toLocaleString("en-IN")}
                              </strong>
                              <span>
                                {(course.level || "beginner").charAt(0).toUpperCase() +
                                  (course.level || "beginner").slice(1)}
                              </span>
                            </div>

                            <div className="dashboard-course-actions">
                              <button
                                className="dash-button dash-outline"
                                onClick={() => startEdit(course)}
                              >
                                Edit
                              </button>
                              <button
                                className="dash-button dash-outline"
                                onClick={() => handlePublish(course)}
                              >
                                {course.isPublished ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                className="dash-button dash-danger"
                                onClick={() => handleDelete(course)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {role === "student" && (
              <>
                <section className="dashboard-stat-grid">
                  <article className="dashboard-stat-card">
                    <span className="stat-icon">📚</span>
                    <p>Enrolled courses</p>
                    <h2>{stats?.totalCourses ?? enrolledCourses.length}</h2>
                  </article>
                  <article className="dashboard-stat-card">
                    <span className="stat-icon">✅</span>
                    <p>Completed courses</p>
                    <h2>{stats?.completedCourses ?? 0}</h2>
                  </article>
                  <article className="dashboard-stat-card">
                    <span className="stat-icon">📝</span>
                    <p>Quiz attempts</p>
                    <h2>{stats?.totalQuizAttempts ?? quizAttempts.length}</h2>
                  </article>
                  <article className="dashboard-stat-card">
                    <span className="stat-icon">🎯</span>
                    <p>Average quiz score</p>
                    <h2>{stats?.averageQuizScore ?? 0}%</h2>
                  </article>
                </section>

                <section className="dashboard-courses-section">
                  <div className="dashboard-section-heading">
                    <div>
                      <p className="dashboard-eyebrow">KEEP LEARNING</p>
                      <h2>My Enrolled Courses</h2>
                    </div>
                  </div>

                  {enrolledCourses.length === 0 ? (
                    <div className="dashboard-empty">
                      <div>📚</div>
                      <h3>No enrolled courses yet</h3>
                      <p>Explore EduSync courses and enroll to start learning.</p>
                      <Link className="dash-button dash-primary" to="/">
                        Explore Courses
                      </Link>
                    </div>
                  ) : (
                    <div className="dashboard-course-grid">
                      {enrolledCourses.map((enrollment) => {
                        const course = enrollment.course || {};
                        return (
                          <article
                            className="dashboard-course-card"
                            key={enrollment._id}
                            
                          >
                            <div className="dashboard-course-banner">
                              <span>📘</span>
                              <span className="course-status published">
                                {enrollment.completed ? "Completed" : "In progress"}
                              </span>
                            </div>
                            <div className="dashboard-course-body">
                              <span className="dashboard-category">
                                {course.category || "General"}
                              </span>
                              <h3>{course.title || "Course"}</h3>
                              <p className="dashboard-course-description">
                                {course.description || "Continue your learning journey."}
                              </p>
                              <div className="progress-info">
                                <span>Course progress</span>
                                <strong>{enrollment.progress ?? 0}%</strong>
                              </div>
                              <div className="progress-bar">

                                <div
                                  style={{
                                    width: `${Math.min(100, Math.max(0, enrollment.progress || 0))}%`,
                                  }}
                                />
                              </div>
                              <Link
  to={`/learn/${course._id}`}
  className="dash-button dash-primary"
>
  {enrollment.completed ? "Review Course" : "Start Learning"}
</Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="dashboard-courses-section">
                  <div className="dashboard-section-heading">
                    <div>
                      <p className="dashboard-eyebrow">TEST YOUR KNOWLEDGE</p>
                      <h2>Recent Quiz Attempts</h2>
                    </div>
                  </div>

                  {quizAttempts.length === 0 ? (
                    <p className="dashboard-empty">
                      No quiz attempts available yet.
                    </p>
                  ) : (
                    <div className="dashboard-course-grid">
                      {quizAttempts.map((attempt) => (
                        <article className="dashboard-course-card" key={attempt._id}>
                          <div className="dashboard-course-body">
                            <h3>{attempt.quiz?.title || "Quiz"}</h3>
                            <p>Score: {attempt.score ?? 0}%</p>
                            <p>
                              Passing score: {attempt.quiz?.passingScore ?? "—"}%
                            </p>
                            <p>
                              Attempted:{" "}
                              {attempt.createdAt
                                ? new Date(attempt.createdAt).toLocaleDateString()
                                : "Date unavailable"}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="dashboard-courses-section">
                  <div className="dashboard-section-heading">
                    <div>
                      <p className="dashboard-eyebrow">YOUR COURSEWORK</p>
                      <h2>Assignments</h2>
                    </div>
                  </div>

                  {assignments.length === 0 ? (
                    <p className="dashboard-empty">
                      No assignment submissions available yet.
                    </p>
                  ) : (
                    <div className="dashboard-course-grid">
                      {assignments.map((assignment) => (
                        <article
                          className="dashboard-course-card"
                          key={assignment.assignmentId}
                        >
                          <div className="dashboard-course-body">
                            <h3>{assignment.title}</h3>
                            <p>Status: {assignment.status}</p>
                            <p>
                              Marks: {assignment.marks ?? "Not graded"}
                              {assignment.totalMarks != null
                                ? ` / ${assignment.totalMarks}`
                                : ""}
                            </p>
                            <p>
                              Due date:{" "}
                              {assignment.dueDate
                                ? new Date(assignment.dueDate).toLocaleDateString()
                                : "Not specified"}
                            </p>
                            {assignment.feedback && (
                              <p>Feedback: {assignment.feedback}</p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {role === "admin" && (
              <section className="dashboard-stat-grid">
                {stats &&
                  Object.entries(stats)
                    .filter(([, value]) =>
                      ["string", "number"].includes(typeof value)
                    )
                    .map(([key, value]) => (
                      <article className="dashboard-stat-card" key={key}>
                        <p>{key.replace(/([A-Z])/g, " $1")}</p>
                        <h2>{String(value)}</h2>
                      </article>
                    ))}
              </section>
            )}
          </>
        )}

        <footer className="dashboard-footer">
          <Link to="/">← Back to EduSync home</Link>
          <span>Learn today. Grow tomorrow.</span>
        </footer>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />

        <Route
          path="/student-dashboard"
          element={<Dashboard role="student" />}
        />
        <Route path="/learn/:courseId" element={<LearningPage />} />

        <Route
          path="/instructor-dashboard"
          element={<Dashboard role="instructor" />}
        />

        <Route
          path="/admin-dashboard"
          element={<Dashboard role="admin" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
