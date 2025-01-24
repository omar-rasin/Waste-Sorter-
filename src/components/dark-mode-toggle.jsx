"use client";
import React from "react";

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark:bg-gray-900 dark:text-white" : "bg-white text-gray-900"
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200 bg-gray-200 dark:bg-gray-700"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <i className="fas fa-sun text-yellow-400 text-lg"></i>
        ) : (
          <i className="fas fa-moon text-gray-600 text-lg"></i>
        )}
      </button>
    </div>
  );
}

function DarkModeToggleStory() {
  return (
    <div>
      <DarkModeToggle />
    </div>
  );
}

export default DarkModeToggle;