import { useEffect, useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
  tags: "",
};

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!task) {
      setForm(emptyTask);
      return;
    }
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: toDateInput(task.dueDate),
      tags: (task.tags || []).join(", "),
    });
  }, [task]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate || null,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
    } catch (saveError) {
      setError(saveError);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2 id="modal-title">{task ? "Edit task" : "A new task"}</h2>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label>
            Task name
            <input
              autoFocus
              required
              maxLength={120}
              name="title"
              placeholder="What needs to get done?"
              value={form.title}
              onChange={updateField}
            />
          </label>
          <label>
            A few details <span className="optional">(optional)</span>
            <textarea
              name="description"
              rows="3"
              maxLength={2000}
              placeholder="Add a little context..."
              value={form.description}
              onChange={updateField}
            />
          </label>
          <div className="form-row">
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Due date
              <input type="date" name="dueDate" value={form.dueDate} onChange={updateField} />
            </label>
          </div>
          {task && (
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          )}
          <label>
            Tags <span className="optional">(comma-separated)</span>
            <input name="tags" placeholder="Design, Work, Personal" value={form.tags} onChange={updateField} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? "Saving..." : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
