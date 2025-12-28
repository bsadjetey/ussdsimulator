import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UssdSession.css"; // Optional for custom tweaks

// Mock service (to be replaced with your actual backend service)
import { UssdService } from "../services/UssdService";

function UssdSession() {
  const [ussdContent, setUssdContent] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef(null);

  const sessionKey = "ussd_session_id";
  const ussd = new UssdService();

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = ussd.generateSessionId();
      sessionStorage.setItem(sessionKey, sessionId);
    }
    return sessionId;
  };

  const clearSession = () => {
    sessionStorage.removeItem(sessionKey);
  };

  const sendUSSD = async (text = "") => {
    const sessionId = getSessionId();
    const phoneNumber = ussd.getPhoneNumber();
    const appCode = ussd.getSelectedApp()?.code;

    setLoading(true);
    try {
      const response = await ussd.sendUSSD({ text, phoneNumber, sessionId, appCode });
      setLoading(false);

      const respType = response.slice(0, 3).toLowerCase();
      const content = response.slice(3).trim();
      setUssdContent(content);

      if (respType === "con") {
        setShowInput(true);
        setShowEnd(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setShowInput(false);
        setShowEnd(true);
        clearSession();
      }
    } catch (err) {
      setLoading(false);
      alert("USSD request failed");
    }
  };

  const startSession = () => {
    setUssdContent("");
    setShowInput(false);
    setShowEnd(false);
    sendUSSD("");
  };

  const submitInput = () => {
    if (!inputText.trim()) return;
    sendUSSD(inputText.trim());
    setInputText("");
  };

  const cancelSession = () => {
    setShowInput(false);
    setShowEnd(false);
    setUssdContent("");
    setInputText("");
    clearSession();
  };

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  return (
    <div className="container-fullscreen bg-white rounded shadow-sm ussd-container d-flex flex-column">
      {/* Body */}
      <div className="ussd-body flex-grow-1 d-flex justify-content-center align-items-center text-center w-100 px-3">
        {loading && (
          <div className="loader">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}

        {!loading && ussdContent && (
          <div className="ussd-content w-100">
            <pre>{ussdContent}</pre>
          </div>
        )}

        {!loading && !ussdContent && !showInput && (
          <div id="start-section">
            <button className="btn btn-primary btn-lg" onClick={startSession}>
              Start USSD
            </button>
          </div>
        )}
      </div>

      {/* Footer input controls */}
      {showInput && (
        <div className="ussd-footer bg-white border-top p-2 w-100">
          <div className="d-flex w-100 gap-2 mb-0">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Enter option..."
              autoComplete="off"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={submitInput}>
              <i className="bi bi-send"></i>
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={cancelSession}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer for END message */}
      {showEnd && (
        <div className="ussd-footer bg-white border-top p-3 text-center w-100">
          <button className="btn btn-secondary w-50" onClick={cancelSession}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default UssdSession;
