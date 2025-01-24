"use client";
import React from "react";

function FunFactCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <i className={`fas fa-lightbulb text-yellow-400`}></i>
            <span className="font-roboto text-lg text-gray-800 dark:text-gray-200">
              Fun Fact
            </span>
          </div>
          <i
            className={`fas fa-chevron-${
              isExpanded ? "up" : "down"
            } text-gray-500 dark:text-gray-400 transition-transform duration-200`}
          ></i>
        </button>

        {isExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="font-roboto text-gray-600 dark:text-gray-300">
              Did you know? Artificial Intelligence can now recognize images
              with accuracy that sometimes exceeds human capabilities!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FunFactCardStory() {
  return (
    <div className="p-4 space-y-4">
      <FunFactCard />
    </div>
  );
}

export default FunFactCard;