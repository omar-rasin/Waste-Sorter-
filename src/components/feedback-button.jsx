"use client";
import React from "react";

function FeedbackButton() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback("");
    setShowFeedback(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFeedback(true)}
        className="text-blue-600 hover:text-blue-700 font-roboto text-sm inline-block"
      >
        Was this correct? <i className="fas fa-comment-dots ml-1"></i>
      </button>

      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your feedback..."
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-roboto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-roboto"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackButtonStory() {
  return (
    <div className="p-4">
      <FeedbackButton />
    </div>
  );
}

export default FeedbackButton;