"use client";
import React from "react";

function ShareButton({ classificationResults }) {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareText = classificationResults
    ? `I just identified ${classificationResults}! Check out this amazing tool!`
    : "Check out this amazing image classification tool!";

  const shareLinks = [
    {
      name: "Twitter",
      icon: "fa-twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}`,
    },
    {
      name: "Facebook",
      icon: "fa-facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`,
    },
    {
      name: "LinkedIn",
      icon: "fa-linkedin",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Share results"
      >
        <i className="fas fa-share-alt"></i>
        <span>Share</span>
      </button>

      {showShareOptions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2">
          <div className="flex gap-4">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 transition-colors"
                aria-label={`Share on ${link.name}`}
              >
                <i className={`fab ${link.icon} text-lg`}></i>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShareButtonStory() {
  const sampleResults = [
    "a beautiful mountain landscape",
    "a cute puppy",
    null,
  ];

  return (
    <div className="p-8 space-y-8">
      {sampleResults.map((result, index) => (
        <div key={index} className="border rounded p-4">
          <h3 className="font-medium mb-4">
            Example {index + 1}:{" "}
            {result ? `With result: "${result}"` : "No result"}
          </h3>
          <ShareButton classificationResults={result} />
        </div>
      ))}
    </div>
  );
}

export default ShareButton;