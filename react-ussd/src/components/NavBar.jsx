import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./NavBar.css";
import { UssdService } from "../services/UssdService";

function Navbar() {
  const [selectedAppName, setSelectedAppName] = useState("");
  const location = useLocation();
  const ussd = new UssdService();

  // Mimic Angular's BehaviorSubject-like subscription
  useEffect(() => {
    const app = ussd.getSelectedApp();
    setSelectedAppName(app?.name || "None");
  }, [location]); // update when route changes

  return (
    <nav className="navbar navbar-expand-lg navbar-dark py-2 px-3 shadow-sm">
      <div className="container-fluid flex-column align-items-center">
        {/* Top row: buttons */}
        <div className="d-flex justify-content-around w-100 mb-2">
          <Link to="/session" className="btn btn-outline-light btn-sm btn-navbar">
            <i className="bi bi-telephone"></i> Session
          </Link>
          <Link to="/add-app" className="btn btn-outline-light btn-sm btn-navbar">
            <i className="bi bi-plus-circle"></i> Add App
          </Link>
          <Link to="/settings" className="btn btn-outline-light btn-sm btn-navbar">
            <i className="bi bi-gear"></i> Settings
          </Link>
        </div>

        {/* Bottom row: active app name */}
        <div className="navbar-center text-light text-center">
          <span className="fw-semibold">Active App:</span>
          <span className="text-warning ms-1">
            {selectedAppName || "None"}
          </span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
