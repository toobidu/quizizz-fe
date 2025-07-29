import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/components/ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={`theme-toggle-switch${isDark ? " dark" : ""}`}
      aria-label={ariaLabel}
      aria-checked={isDark}
      role="switch"
      tabIndex={0}
      onClick={toggleTheme}
      onKeyDown={e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      <span className="theme-toggle-knob">
        {isDark ? (
          <FiMoon className="theme-toggle-icon moon" aria-hidden="true" />
        ) : (
          <FiSun className="theme-toggle-icon sun" aria-hidden="true" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;