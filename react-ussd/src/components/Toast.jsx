// src/components/Toast.jsx
import React from "react";

export default function Toast({ message, type }) {
  return (
    <div
      className={`toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3 show`}
      style={{ zIndex: 1050 }}
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
}
