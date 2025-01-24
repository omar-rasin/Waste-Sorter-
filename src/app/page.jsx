"use client";
import React from "react";
import FeedbackButton from "../components/feedback-button";
import {
  useUpload,
  useHandleStreamResponse,
} from "../utilities/runtime-helpers";

function MainComponent() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem("wastePoints");
    return savedPoints ? parseInt(savedPoints, 0) : 0;
  });
  const [error, setError] = useState(null);
  const [upload, { loading }] = useUpload();
  const [showEducation, setShowEducation] = useState(false);
  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem("wasteStreak");
    return savedStreak ? parseInt(savedStreak, 0) : 0;
  });
  const [lastScanDate, setLastScanDate] = useState(() => {
    return localStorage.getItem("lastScanDate") || null;
  });
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem("tutorialShown");
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setStreamingMessage("");
    },
  });
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    const context = result
      ? `The current waste item is classified as ${result.type}. Confidence: ${confidence}%. Tips: ${result.tips}. Additional tip: ${result.additionalTip}. It should go in the ${result.bin} bin.`
      : "No waste item has been classified yet.";

    const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant specializing in waste management and recycling. Current context: ${context}`,
          },
          ...messages,
          userMessage,
        ],
        stream: true,
      }),
    });

    handleStreamResponse(response);
  };
  const classifyWaste = async (imageUrl) => {
    setAnalyzing(true);
    setError(null);
    try {
      if (!imageUrl) {
        throw new Error("No image provided");
      }

      const response = await fetch("/integrations/gpt-vision/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are a waste classification expert. Look at this image and classify the waste item. Return a JSON object with these exact fields: type (must be plastic, paper, metal, glass, or organic), confidence (number 0-100), tip (recycling advice), additionalTip (extra guidance), and bin (blue, green, yellow, brown, or black).",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to analyze image");
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response from image analysis");
      }

      let analysis;
      try {
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[^]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON object found in response");
        }
        analysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error(
          "Could not understand the analysis result. Please try again."
        );
      }

      if (
        !analysis.type ||
        !analysis.confidence ||
        !analysis.tip ||
        !analysis.additionalTip ||
        !analysis.bin
      ) {
        throw new Error("The analysis result is missing required information");
      }

      const validTypes = ["plastic", "paper", "metal", "glass", "organic"];
      const validBins = ["blue", "green", "yellow", "brown", "black"];

      if (!validTypes.includes(analysis.type.toLowerCase())) {
        throw new Error("Invalid waste type received");
      }

      if (!validBins.includes(analysis.bin.toLowerCase())) {
        throw new Error("Invalid bin color received");
      }

      if (
        typeof analysis.confidence !== "number" ||
        analysis.confidence < 0 ||
        analysis.confidence > 100
      ) {
        throw new Error("Invalid confidence score received");
      }

      setResult({
        type: analysis.type.toLowerCase(),
        tips: analysis.tip,
        additionalTip: analysis.additionalTip,
        confidence: analysis.confidence,
        bin: analysis.bin.toLowerCase(),
      });
      setConfidence(analysis.confidence);
    } catch (err) {
      setError(err.message || "Failed to analyze image. Please try again.");
      setResult(null);
      setConfidence(null);
    } finally {
      setAnalyzing(false);
    }
  };
  const getRank = (points) => {
    if (points >= 1000) return { name: "Diamond", color: "text-[#B9F2FF]" };
    if (points >= 500) return { name: "Platinum", color: "text-[#E5E4E2]" };
    if (points >= 250) return { name: "Gold", color: "text-[#FFD700]" };
    if (points >= 100) return { name: "Silver", color: "text-[#C0C0C0]" };
    if (points >= 50) return { name: "Bronze", color: "text-[#CD7F32]" };
    return { name: "Beginner", color: "text-gray-600" };
  };
  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError(null);

      try {
        const { url, error: uploadError } = await upload({ file });
        if (uploadError) {
          throw new Error(uploadError);
        }

        if (!url) {
          throw new Error("Failed to upload image");
        }

        setSelectedImage(url);
        await classifyWaste(url);

        if (!error) {
          const today = new Date().toISOString().split("T")[0];
          const pointsToAdd = lastScanDate === today ? 5 : 10;

          if (lastScanDate) {
            const lastDate = new Date(lastScanDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (
              lastDate.toISOString().split("T")[0] ===
              yesterday.toISOString().split("T")[0]
            ) {
              setStreak((s) => s + 1);
            } else if (lastDate.toISOString().split("T")[0] !== today) {
              setStreak(1);
            }
          } else {
            setStreak(1);
          }

          setPoints((prev) => prev + pointsToAdd);
          setLastScanDate(today);
        }
      } catch (err) {
        setError(err.message || "Failed to process image");
      }
    }
  };
  const educationalContent = {
    plastic:
      "Plastic takes 400+ years to decompose. Recycle to reduce ocean pollution.",
    paper:
      "Paper can be recycled 5-7 times. Saves trees and reduces landfill waste.",
    metal: "Metal can be recycled indefinitely without quality loss.",
    glass: "Glass is 100% recyclable and can be recycled endlessly.",
    organic: "Organic waste can be composted to create nutrient-rich soil.",
    "e-waste":
      "Electronic waste contains hazardous materials. Must be properly recycled at designated facilities.",
    hazardous:
      "Hazardous waste requires special handling. Never mix with regular trash.",
  };
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("wastePoints", points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem("wasteStreak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("lastScanDate", lastScanDate || "");
  }, [lastScanDate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  const handleShare = (platform) => {
    const baseUrl = window.location.origin;
    const shareText = result
      ? `I just identified ${result.type} waste using the Waste Sorter app! Join me in making recycling easier. 🌱♻️`
      : "Check out this amazing waste sorting app!";
    const shareUrl = encodeURIComponent(`${baseUrl}`);
    const shareTextEncoded = encodeURIComponent(shareText);

    let shareLink = "";
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${shareTextEncoded}&url=${shareUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTextEncoded}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareTextEncoded}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  return (
    <div
      className={`min-h-screen p-4 font-inter relative transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200 bg-gray-200 dark:bg-gray-700"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <i className="fas fa-sun text-yellow-400 text-lg"></i>
          ) : (
            <i className="fas fa-moon text-gray-600 text-lg"></i>
          )}
        </button>
      </div>
      <div className="max-w-md mx-auto space-y-8">
        {showTutorial && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl mb-4 transform hover:scale-[1.02] transition-all">
            <div className="flex items-center mb-4">
              <i className="fas fa-leaf text-white text-3xl mr-3"></i>
              <h3 className="font-bold text-white text-xl">Welcome! 👋</h3>
            </div>
            <p className="text-blue-50 mb-6 leading-relaxed">
              Take a photo of waste items to learn how to properly recycle them.
              Earn points and maintain your daily streak!
            </p>
            <button
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem("tutorialShown", "true");
              }}
              className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-md"
            >
              Let's Get Started!
            </button>
          </div>
        )}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2 font-inter">
            <i className="fas fa-recycle mr-2"></i>
            Waste Sorter
          </h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 transform hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center">
                <i className="fas fa-trophy text-yellow-500 text-xl mr-2"></i>
                <p className="text-green-600 font-semibold text-lg">
                  {points} Points
                </p>
              </div>
              <div className="flex items-center">
                <i className="fas fa-fire text-orange-500 text-xl mr-2"></i>
                <p className="text-orange-600 font-semibold">
                  {streak} Day Streak
                </p>
              </div>
              <div className="flex items-center">
                <i
                  className="fas fa-star text-xl mr-2"
                  style={{ color: getRank(points).color.replace("text-", "") }}
                ></i>
                <p className={`font-bold text-lg ${getRank(points).color}`}>
                  {getRank(points).name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">
                {lastScanDate
                  ? `Last scan: ${new Date(lastScanDate).toLocaleDateString()}`
                  : "No scans yet"}
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((points % 50) / 50) * 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getRank(points).name !== "Diamond"
                  ? `${
                      getRank(points).name === "Beginner"
                        ? `${50 - points} points to Bronze`
                        : getRank(points).name === "Bronze"
                        ? `${100 - points} points to Silver`
                        : getRank(points).name === "Silver"
                        ? `${250 - points} points to Gold`
                        : getRank(points).name === "Gold"
                        ? `${500 - points} points to Platinum`
                        : `${1000 - points} points to Diamond`
                    }`
                  : "Maximum rank achieved! 🎉"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <label className="w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl transform transition-transform group-hover:scale-105 opacity-75 blur-lg"></div>
                  <div className="relative bg-white dark:bg-gray-700 border-3 border-dashed border-green-400 rounded-2xl p-8 text-center cursor-pointer hover:border-green-500 transition-all duration-300">
                    <div
                      className="mb-4 transform transition-transform duration-300 hover:scale-110"
                      style={{ animation: "float 3s ease-in-out infinite" }}
                    >
                      <i className="fas fa-camera text-4xl text-green-500"></i>
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Take a photo or upload image
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Click or drag and drop
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      capture="environment"
                    />
                  </div>
                </div>
              </label>
            </div>

            {selectedImage && (
              <div className="mt-6">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={selectedImage}
                    alt="Waste item"
                    className="w-full h-[250px] object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {result && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl shadow-md">
                <h3 className="font-bold text-green-800 dark:text-green-300 text-lg mb-4 flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Classification Result
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-green-700 dark:text-green-300 font-medium text-lg">
                    {analyzing ? "Analyzing..." : result.type}
                  </p>
                  {confidence && (
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-medium ${
                        confidence > 80
                          ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                          : confidence > 50
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                          : "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200"
                      }`}
                    >
                      {confidence}% confident
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-green-600 dark:text-green-300">
                    {analyzing ? "Loading recommendations..." : result.tips}
                  </p>
                  {result.additionalTip && (
                    <p className="text-green-600 dark:text-green-300 italic text-sm">
                      {result.additionalTip}
                    </p>
                  )}
                  {result.bin && (
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Bin:
                      </span>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm ${
                          result.bin === "blue"
                            ? "bg-gradient-to-r from-blue-400 to-blue-500"
                            : result.bin === "green"
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : result.bin === "yellow"
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                            : result.bin === "brown"
                            ? "bg-gradient-to-r from-[#8B4513] to-[#A0522D]"
                            : "bg-gradient-to-r from-gray-700 to-gray-800"
                        }`}
                      >
                        <i className={`fas fa-trash-alt mr-2`}></i>
                        {result.bin} bin
                      </span>
                    </div>
                  )}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleShare("twitter")}
                          className="text-[#1DA1F2] hover:opacity-80 transition-opacity"
                          aria-label="Share on Twitter"
                        >
                          <i className="fab fa-twitter text-xl"></i>
                        </button>
                        <button
                          onClick={() => handleShare("facebook")}
                          className="text-[#4267B2] hover:opacity-80 transition-opacity"
                          aria-label="Share on Facebook"
                        >
                          <i className="fab fa-facebook text-xl"></i>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="text-[#0077B5] hover:opacity-80 transition-opacity"
                          aria-label="Share on LinkedIn"
                        >
                          <i className="fab fa-linkedin text-xl"></i>
                        </button>
                      </div>
                      <FeedbackButton />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
          >
            <i
              className={`fas ${
                showEducation ? "fa-chevron-up" : "fa-book"
              } mr-2`}
            ></i>
            {showEducation ? "Hide" : "Show"} Recycling Guide
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-2 px-4 rounded whitespace-nowrap">
            Learn about different types of waste and how to recycle them
            properly
          </div>
        </div>
        {showEducation && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
            {Object.entries(educationalContent).map(([type, content]) => (
              <div
                key={type}
                className="border-b border-green-100 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex items-center mb-2">
                  <i
                    className={`fas fa-${
                      type === "plastic"
                        ? "bottle-water"
                        : type === "paper"
                        ? "newspaper"
                        : type === "metal"
                        ? "can-food"
                        : type === "glass"
                        ? "wine-bottle"
                        : type === "e-waste"
                        ? "laptop"
                        : type === "hazardous"
                        ? "skull"
                        : "leaf"
                    } text-green-500 dark:text-green-400 text-xl mr-3`}
                  ></i>
                  <h3 className="font-bold text-green-800 dark:text-green-300 text-lg capitalize">
                    {type}
                  </h3>
                </div>
                <p className="text-green-600 dark:text-green-400 leading-relaxed">
                  {content}
                </p>
              </div>
            ))}
            <></>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-md border border-red-100 flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <div className="fixed bottom-4 right-4 z-50">
        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
          >
            <i className="fas fa-comments text-2xl"></i>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl w-[320px] h-[480px] flex flex-col">
            <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold">Recycling Assistant</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-green-100"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                    {streamingMessage}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && sendMessage(inputMessage)
                  }
                  placeholder="Ask about recycling..."
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={() => sendMessage(inputMessage)}
                  className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        :root {
          --bg-color: #FFFFFF;
          --text-color: #000000;
          --accent-color: #4CAF50;
        }

        [data-theme='dark'] {
          --bg-color: #121212;
          --text-color: #E0E0E0;
        }

        body {
          background-color: var(--bg-color);
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
}

export default MainComponent;