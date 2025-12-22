import React, { useState } from "react";
import TaskCard from "./TaskCard";

function TaskColumn({
  column,
  tasks,
  onAddTask,
  onMoveTask,
  onToggleDone,
  onRequestDelete,
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(column.id, title, dueDate || null);
    setTitle("");
    setDueDate("");
  };

  return (
    <div className="task-column">
      <div className="task-column-header">
        <div className="task-column-label">{column.label}</div>
        <div className="task-column-count">{tasks.length}</div>
      </div>

      <form className="task-add-form" onSubmit={handleSubmit}>
        <input
          className="task-input-title"
          type="text"
          placeholder={
            column.id === "dump"
              ? "Throw something in the pile..."
              : "Name the thing you fear..."
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {column.id !== "dump" && (
          <input
            className="task-input-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}
        <button type="submit" className="task-add-button">
          ADD
        </button>
      </form>

      <div className="task-list">
        {tasks.length === 0 && (
          <div className="task-empty">NO MERCY SCHEDULED YET.</div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMoveTask={onMoveTask}
            onToggleDone={onToggleDone}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskColumn;
