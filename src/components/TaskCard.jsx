import React from "react";
import { isOverdue, isDueToday } from "../utils/taskUtils";

function TaskCard({ task, onMoveTask, onToggleDone, onRequestDelete }) {
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const doItNow = !task.done && (task.urgent || dueToday);

  return (
    <article
      className={[
        "task-card",
        task.done ? "task-card-done" : "",
        overdue ? "task-card-overdue" : "",
      ].join(" ")}
    >
      <header className="task-card-header">
        <div className="task-card-title-block">
          <div className="task-card-title">{task.title || "UNTITLED TASK"}</div>
          <div className="task-card-tags">
            {overdue && <span className="tag tag-overdue">OVERDUE</span>}
            {doItNow && <span className="tag tag-doitnow">DO IT NOW</span>}
            {task.done && <span className="tag tag-done">DONE</span>}
          </div>
        </div>
        <button
          className="task-toggle-button"
          onClick={() => onToggleDone(task.id)}
        >
          {task.done ? "UNDO" : "CRUSH"}
        </button>
      </header>

      <div className="task-card-body">
        {task.description ? (
          <p className="task-card-description">{task.description}</p>
        ) : (
          <p className="task-card-description task-card-description-empty">
            NO EXCUSES PROVIDED.
          </p>
        )}
      </div>

      <footer className="task-card-footer">
        <div className="task-meta">
          {task.dueDate ? (
            <>
              <span className="task-meta-label">DUE</span>
              <span className="task-meta-value">{task.dueDate}</span>
            </>
          ) : (
            <span className="task-meta-value task-meta-faint">
              NO DEADLINE. DANGEROUS.
            </span>
          )}
        </div>
        <div className="task-actions">
          <div className="task-move-group">
            <span className="task-move-label">MOVE →</span>
            <button
              type="button"
              className="task-move-button"
              onClick={() => onMoveTask(task.id, "today")}
            >
              TODAY
            </button>
            <button
              type="button"
              className="task-move-button"
              onClick={() => onMoveTask(task.id, "week")}
            >
              WEEK
            </button>
            <button
              type="button"
              className="task-move-button"
              onClick={() => onMoveTask(task.id, "dump")}
            >
              DUMP
            </button>
          </div>
          <button
            type="button"
            className="task-delete-button"
            onClick={() => onRequestDelete(task)}
          >
            DELETE
          </button>
        </div>
      </footer>
    </article>
  );
}

export default TaskCard;
