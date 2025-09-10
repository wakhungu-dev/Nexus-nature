// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Session = {
  _id: string;
  startTime: string;
  endTime: string | null;
  duration?: number;
  location: { coordinates: [number, number] }; // [lng, lat]
  activityId?: string | null;
};

interface WellnessReport {
  _id: string;
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  sessionCount: number;
  challengesCompleted: number;
  avgSessionDuration: number;
  favoriteLocation: string;
  achievementUnlocked: boolean;
  comparisonToPrevious: {
    minutesChange: number;
    trend: "UP" | "DOWN" | "SAME";
  };
  generatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [report, setReport] = useState<WellnessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load sessions
        const sessionsRes = await fetch("/api/sessions");
        const sessionsJson = await sessionsRes.json();
        setSessions(sessionsJson.sessions || []);

        // Load weekly report
        const reportRes = await fetch("/api/reports/weekly");
        const reportJson = await reportRes.json();
        setReport(reportJson.report || null);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // prepare a simple counts-by-day for last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const counts = last7.map((d) => {
    const dateStr = d.toISOString().slice(0, 10);
    return sessions.filter(s => s.startTime.slice(0,10) === dateStr).length;
  });

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Green Sessions</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Weekly Wellness Report */}
            {report && (
              <section className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">📊 Weekly Wellness Report</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{Math.round(report.totalMinutes)}</div>
                      <div className="text-sm opacity-90">Minutes in Nature</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{report.sessionCount}</div>
                      <div className="text-sm opacity-90">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{report.challengesCompleted}</div>
                      <div className="text-sm opacity-90">Challenges Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{Math.round(report.avgSessionDuration)}</div>
                      <div className="text-sm opacity-90">Avg Session (min)</div>
                    </div>
                  </div>
                  
                  {/* Trend Indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">Compared to last week:</span>
                    {report.comparisonToPrevious.trend === "UP" && (
                      <span className="flex items-center gap-1 text-green-200">
                        📈 +{report.comparisonToPrevious.minutesChange} minutes
                      </span>
                    )}
                    {report.comparisonToPrevious.trend === "DOWN" && (
                      <span className="flex items-center gap-1 text-yellow-200">
                        📉 {report.comparisonToPrevious.minutesChange} minutes
                      </span>
                    )}
                    {report.comparisonToPrevious.trend === "SAME" && (
                      <span className="text-blue-200">📊 Same as last week</span>
                    )}
                  </div>

                  {/* Achievement Badge */}
                  {report.achievementUnlocked && (
                    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg inline-block">
                      🏆 Achievement Unlocked! Great week!
                    </div>
                  )}

                  {/* Favorite Location */}
                  <div className="mt-4 text-sm opacity-90">
                    📍 Most visited: {report.favoriteLocation}
                  </div>
                </div>
              </section>
            )}

            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-semibold mb-4 text-gray-800">Recent Sessions</h2>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🌿</div>
                    <p>No sessions yet — go log some green time!</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {sessions.slice(0, 8).map(s => (
                      <li key={s._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">
                              {s.activityId ?? "Manual entry"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(s.startTime).toLocaleDateString()} at{" "}
                              {new Date(s.startTime).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-blue-600">
                              📍 {s.location.coordinates[1].toFixed(4)}, {s.location.coordinates[0].toFixed(4)}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {s.duration ? `${s.duration}m` : "—"}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-semibold mb-4 text-gray-800">Activity This Week</h2>
                <div className="w-full h-48 flex items-end gap-2 bg-gray-50 p-4 rounded">
                  {counts.map((c, idx) => {
                    const height = Math.max(8, Math.min(100, c * 25 + 8));
                    return (
                      <div key={idx} className="flex-1 text-center">
                        <div 
                          className="bg-green-500 mx-auto rounded-t transition-all duration-500" 
                          style={{ height: `${height}%`, width: "70%" }}
                        ></div>
                        <div className="text-xs mt-2 text-gray-600">
                          {last7[idx].toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="text-xs text-gray-500">{c}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Sessions per day
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-semibold mb-4 text-gray-800">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a 
                    href="/map" 
                    className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl mb-2">🗺️</div>
                    <div className="text-sm font-medium text-green-700">Explore Map</div>
                  </a>
                  <a 
                    href="/challenges" 
                    className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm font-medium text-blue-700">Challenges</div>
                  </a>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium text-purple-700">Refresh Data</div>
                  </button>
                  <a 
                    href="/signin" 
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm font-medium text-gray-700">Profile</div>
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
