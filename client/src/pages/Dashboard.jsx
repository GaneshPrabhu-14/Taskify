import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const views = [
  { id: "all", label: "Everything", icon: "◫" },
  { id: "todo", label: "To do", icon: "○" },
  { id: "in-progress", label: "In progress", icon: "◷" },
  { id: "completed", label: "Completed", icon: "✓" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState("all");
  const [search, setSearch] = useState("");
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Your tasks could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesView = activeView === "all" || task.status === activeView;
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(term));
      return matchesView && matchesSearch;
    });
  }, [tasks, activeView, search]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      "in-progress": tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks]
  );

  async function saveTask(values) {
    try {
      if (modalTask) {
        const { data } = await api.patch(`/tasks/${modalTask._id}`, values);
        setTasks((current) => current.map((item) => item._id === data.task._id ? data.task : item));
        showNotice("Your changes are saved.");
      } else {
        const { data } = await api.post("/tasks", values);
        setTasks((current) => [data.task, ...current]);
        showNotice("A new task, ready when you are.");
      }
      setModalOpen(false);
    } catch (requestError) {
      throw requestError.response?.data?.message || "Your task could not be saved.";
    }
  }

  async function changeStatus(task, status) {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });
      setTasks((current) => current.map((item) => item._id === data.task._id ? data.task : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The task status could not be updated.");
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((current) => current.filter((item) => item._id !== task._id));
      showNotice("Task removed.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The task could not be deleted.");
    }
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const firstName = user?.name.split(" ")[0] || "there";

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-mark">t</span><span>taskify</span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav className="side-nav" aria-label="Task filters">
          {views.map((view) => (
            <button
              key={view.id}
              className={`nav-item ${activeView === view.id ? "active" : ""}`}
              onClick={() => setActiveView(view.id)}
            >
              <span className="nav-icon">{view.icon}</span>
              <span>{view.label}</span>
              <span className="nav-count">{counts[view.id]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✳</span>
            <p>Small steps add up to big things.</p>
          </div>
          <div className="profile">
            <div className="avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div className="profile-copy">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="logout-button" onClick={logout} title="Sign out" aria-label="Sign out">↗</button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <span className="today-label">{today}</span>
          <button
            className="button button-primary create-button"
            onClick={() => { setModalTask(null); setModalOpen(true); }}
          >
            <span className="plus">+</span> New task
          </button>
        </header>
        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR PERSONAL SPACE</span>
            <h1>Good morning, {firstName}<span className="wave">✳</span></h1>
            <p>Make today count, one thing at a time.</p>
          </div>
          <div className="progress-card">
            <div className="progress-copy">
              <span>YOUR MOMENTUM</span>
              <strong>{counts.all ? Math.round((counts.completed / counts.all) * 100) : 0}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${counts.all ? (counts.completed / counts.all) * 100 : 0}%` }} />
            </div>
            <span className="progress-caption">{counts.completed} of {counts.all} tasks complete</span>
          </div>
        </section>

        <section className="task-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR TO-DO LIST</span>
              <h2>{views.find((view) => view.id === activeView)?.label} <span>{visibleTasks.length}</span></h2>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a task..."
                aria-label="Search tasks"
              />
              <kbd>/</kbd>
            </label>
          </div>

          {error && (
            <div className="notice error-notice">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss">×</button>
            </div>
          )}
          {notice && <div className="notice success-notice">{notice}</div>}
          {loading ? (
            <div className="loading-state"><span className="spinner" /> Gathering your tasks...</div>
          ) : visibleTasks.length ? (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(selected) => { setModalTask(selected); setModalOpen(true); }}
                  onDelete={deleteTask}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration"><span>✓</span><i /><b /></div>
              <h3>{search ? "Nothing matches just yet." : activeView === "completed" ? "Your wins will show up here." : "A little room to begin."}</h3>
              <p>{search ? "Try a different search, or clear it to see everything." : "Add a task whenever you're ready. Every big thing starts somewhere."}</p>
              {!search && activeView !== "completed" && (
                <button className="button button-primary" onClick={() => { setModalTask(null); setModalOpen(true); }}>
                  <span className="plus">+</span> Create your first task
                </button>
              )}
            </div>
          )}
        </section>
        <footer className="dashboard-footer">Made for meaningful progress <span>✳</span></footer>
      </main>
      {modalOpen && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalOpen(false)}
          onSave={saveTask}
        />
      )}
    </div>
  );
}
