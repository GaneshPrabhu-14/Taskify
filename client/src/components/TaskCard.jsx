const statusLabels = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed",
};

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(date)
  );
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    task.status !== "completed";

  return (
    <article className={`task-card ${task.status === "completed" ? "is-complete" : ""}`}>
      <button
        className={`check-button ${task.status === "completed" ? "checked" : ""}`}
        onClick={() =>
          onStatusChange(task, task.status === "completed" ? "todo" : "completed")
        }
        aria-label={task.status === "completed" ? "Mark as to do" : "Complete task"}
      >
        {task.status === "completed" ? "✓" : ""}
      </button>
      <div className="task-content">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <span className={`priority-dot ${task.priority}`} title={`${task.priority} priority`} />
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`status-pill ${task.status}`}>{statusLabels[task.status]}</span>
          {task.dueDate && (
            <span className={`due-date ${overdue ? "overdue" : ""}`}>
              <span aria-hidden="true">◷</span> {formatDate(task.dueDate)}
            </span>
          )}
          {task.tags?.slice(0, 2).map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-button" onClick={() => onEdit(task)} aria-label="Edit task">
          ✎
        </button>
        <button
          className="icon-button delete-action"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
    </article>
  );
}
