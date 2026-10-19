
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import API from "./api";

function LearningPage() {
  const { courseId } = useParams();

  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("edusyncToken");

  useEffect(() => {
    async function loadLearningContent() {
      try {
        setLoading(true);
        setError("");

        // Fetch course sections
        const sectionResponse = await fetch(
          `${API}/api/sections/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sectionData = await sectionResponse.json();

        if (!sectionResponse.ok) {
          throw new Error(
            sectionData.message || "Could not load sections"
          );
        }

        const sectionList = sectionData.sections || [];
        setSections(sectionList);

        // Fetch lessons in every section
        const lessonResults = await Promise.all(
          sectionList.map(async (section) => {
            const response = await fetch(
              `${API}/api/lessons/section/${section._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || "Could not load lessons"
              );
            }

            return [section._id, data.lessons || []];
          })
        );

        const lessonMap = Object.fromEntries(lessonResults);
        setLessons(lessonMap);

        // Fetch student dashboard enrollment data
        const dashboardResponse = await fetch(
          `${API}/api/student-dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dashboardData = await dashboardResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData.message || "Could not load progress"
          );
        }

        // Find enrollment for this course
        const enrollment = (dashboardData.enrolledCourses || []).find(
          (item) =>
            String(item.course?._id || item.course) === String(courseId)
        );

        if (enrollment) {
          setProgress(enrollment.progress || 0);
          setCompletedLessons(
            (enrollment.completedLessons || []).map((id) =>
              String(id._id || id)
            )
          );
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (token && courseId) {
      loadLearningContent();
    } else {
      setError("Please log in to access your course.");
      setLoading(false);
    }
  }, [courseId, token]);

  async function markLessonComplete(lessonId) {
    try {
      setMessage("");

      const response = await fetch(`${API}/api/lessons/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Lesson already completed") {
          setMessage("This lesson is already completed.");
          return;
        }

        throw new Error(
          data.message || "Could not complete lesson"
        );
      }

      setCompletedLessons((previous) =>
        previous.includes(String(lessonId))
          ? previous
          : [...previous, String(lessonId)]
      );

      setProgress(data.enrollment?.progress ?? progress);
      setMessage("Lesson completed successfully!");
    } catch (err) {
      setMessage(err.message || "Could not complete lesson.");
    }
  }

  if (loading) {
    return (
      <main className="learning-page">
        <p>Loading course...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="learning-page">
        <Link to="/student-dashboard">← Back to Dashboard</Link>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="learning-page">
      <header className="learning-header">
        <Link to="/student-dashboard">← Back to Dashboard</Link>
        <h1>Course Learning</h1>
        <p>Learn at your own pace and track your progress.</p>
      </header>

      <section className="learning-progress">
        <div className="learning-progress-info">
          <span>Your Progress</span>
          <strong>{progress}%</strong>
        </div>

        <div className="learning-progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </section>

      {message && (
        <p className="learning-message">{message}</p>
      )}

      {sections.length === 0 ? (
        <p>No sections have been added to this course yet.</p>
      ) : (
        sections.map((section) => (
          <section className="learning-section" key={section._id}>
            <h2>{section.title}</h2>

            {(lessons[section._id] || []).length === 0 ? (
              <p>No lessons in this section yet.</p>
            ) : (
              (lessons[section._id] || []).map((lesson) => {
                const isCompleted = completedLessons.includes(
                  String(lesson._id)
                );

                return (
                  <article
                    className="learning-lesson"
                    key={lesson._id}
                  >
                    <div>
                      <h3>{lesson.title}</h3>

                      <p>
                        {lesson.description ||
                          "No description available."}
                      </p>

                      {lesson.videoUrl && (
                        <p>
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open lesson resource
                          </a>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        markLessonComplete(lesson._id)
                      }
                      disabled={isCompleted}
                    >
                      {isCompleted
                        ? "Completed ✓"
                        : "Mark Complete"}
                    </button>
                  </article>
                );
              })
            )}
          </section>
        ))
      )}
    </main>
  );
}

export default LearningPage;
