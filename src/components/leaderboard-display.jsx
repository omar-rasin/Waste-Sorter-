"use client";
import React from "react";

function LeaderboardDisplay({ users = [] }) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white font-roboto text-center">
        Leaderboard
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 font-roboto">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 font-roboto">
                Initials
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-200 font-roboto">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-700"
                } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
              >
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-roboto">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-roboto">
                  {user.initials}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 text-right font-roboto">
                  {user.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardDisplayStory() {
  const sampleUsers = [
    { initials: "JD", points: 1250 },
    { initials: "AK", points: 1100 },
    { initials: "RB", points: 950 },
    { initials: "MC", points: 900 },
    { initials: "TS", points: 850 },
    { initials: "LM", points: 800 },
    { initials: "PK", points: 750 },
    { initials: "NH", points: 700 },
    { initials: "WS", points: 650 },
    { initials: "BT", points: 600 },
  ];

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <LeaderboardDisplay users={sampleUsers} />
    </div>
  );
}

export default LeaderboardDisplay;