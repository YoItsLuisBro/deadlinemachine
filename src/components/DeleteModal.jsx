import React from "react";

function DeleteModal({ task, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-title">DELETE TASK?</div>
          <div className="modal-subtitle">
            THIS ACTION IS IRREVERSIBLE. LIKE TIME.
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-task-label">TARGET:</div>
          <div className="modal-task-title">
            {task.title || "UNTITLED TASK"}
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-button-yes" onClick={onConfirm}>
            YES, OBLITERATE
          </button>
          <button className="modal-button-no" onClick={onCancel}>
            no, keep it
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
