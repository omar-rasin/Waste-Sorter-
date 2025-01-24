# EcoSort App

Welcome to the **EcoSort App**! This web application is designed to revolutionize how we manage and recycle waste by combining cutting-edge AI technology with an engaging user experience. Below is a detailed overview of the app's features, functionalities, and technical implementation.

---


## Table of Contents
- [Core Features](#core-features)
- [Gamification Elements](#gamification-elements)
- [User Interface](#user-interface)
- [Social Features](#social-features)
- [Educational Content](#educational-content)
- [Technical Implementation](#technical-implementation)
- [Accessibility and Performance](#accessibility-and-performance)
- [How It Works](#how-it-works)
- [Future Plans](#future-plans)

---

## Core Features 🌟

1. **Image Upload & Analysis**
   - 📸 Users can upload or capture photos of waste items.
   - 🤖 The app uses GPT Vision to automatically classify the waste type.

2. **Smart Bin Recommendations**
   - 🗑️ Provides suggestions on the correct bin to use for recycling.

3. **Educational Content**
   - 📘 Displays tips and environmental impact information for better waste management.

---

## Gamification Elements 🎮

- **Points System**: Earn points for every scan (10 points for the first daily scan, 5 points for subsequent scans).
- **Streak Tracker**: Tracks consecutive days of app usage to encourage consistent recycling habits.
- **Ranking System**: Progress through ranks from Beginner to Diamond based on accumulated points.
- **Progress Bar**: Displays your journey to the next rank.

---

## User Interface 🎨

- **Light/Dark Mode**: Easily toggle between themes with smooth transitions.
- **Responsive Design**: Fully functional on mobile and desktop devices.
- **Interactive Elements**: Hover effects, animations, and a guided tutorial for first-time users.

---

## Social Features 🌐

- **Share Button**: Share your recycling achievements on Twitter, Facebook, and LinkedIn.
- **Feedback System**: Submit feedback directly through the app.
- **AI Chat Assistant**: Get real-time recycling advice and tips through an integrated chatbot.

---

## Educational Content 📚

- **Waste Categories**: Learn about various types of waste and how to recycle them effectively.
- **Recycling Tips**: Get actionable tips for improving recycling habits.
- **Environmental Impact**: Understand the decomposition times and environmental effects of common waste items.

---

## Technical Implementation 🛠️

### Core Technologies
- **React.js**: Frontend framework for building dynamic user interfaces.
- **GPT Vision API**: For analyzing and classifying waste items from images.
- **Local Storage**: Used to persist user data like points, streaks, and preferences.

### State Management
- Utilizes React hooks (`useState`) for managing:
  - Uploaded images
  - Analysis results
  - Points, streaks, and other user data

### Key Functionalities in Code

#### Main Component
This is the heart of the application, managing user interactions and data flow.
```javascript
const [selectedImage, setSelectedImage] = useState(null);
const [result, setResult] = useState(null);
const [confidence, setConfidence] = useState(null);
const [points, setPoints] = useState(() => {
  const savedPoints = localStorage.getItem("wastePoints");
  return savedPoints ? parseInt(savedPoints, 0) : 0;
});
```

#### AI Integration
Handles AI-powered image analysis.
```javascript
const analyzeImage = async (image) => {
  try {
    const result = await upload(image); // Upload to GPT Vision
    setResult(result.label);
    setConfidence(result.confidence);
    setPoints((prevPoints) => prevPoints + 10);
  } catch (error) {
    setError("Analysis failed. Please try again.");
  }
};
```

#### Gamification Logic
Tracks streaks and points.
```javascript
const updateStreak = () => {
  const today = new Date().toISOString().split('T')[0];
  if (lastScanDate !== today) {
    setStreak((prev) => prev + 1);
    setLastScanDate(today);
  }
};
```

---

## Accessibility and Performance 🌐

- **ARIA Labels**: Ensures accessibility for screen readers.
- **Keyboard Navigation**: Full keyboard support for navigating the app.
- **Optimized Image Handling**: Efficient image uploads and processing.
- **Error Handling**: Displays clear feedback for errors during analysis or interaction.

---

## How It Works 🛠️

1. **Upload or Capture**: Take a photo or upload an image of the waste item.
2. **AI Analysis**: The app analyzes the image and determines the waste category.
3. **Get Recommendations**: Learn the correct recycling bin to use.
4. **Earn Points**: Accumulate points and track your progress through ranks.
5. **Learn and Share**: Access recycling tips and share your achievements online.

---

## Future Plans 🚀

- Integration with local recycling programs.
- Expanding the AI model to recognize more waste categories.
- Adding multi-language support.


---



### Thank You for Using EcoSort!
Together, let's make recycling smarter, easier, and more fun! 🌍
