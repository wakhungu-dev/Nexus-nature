// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/sessions");
      const json = await res.json();
      setSessions(json.sessions || []);
      setLoading(false);
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
          <div>Loading…</div>
        ) : (
          <>
            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-4 rounded">
                <h2 className="font-semibold mb-2">Recent Sessions</h2>
                {sessions.length === 0 ? (
                  <p>No sessions yet — go log some green time!</p>
                ) : (
                  <ul className="space-y-2">
                    {sessions.slice(0, 10).map(s => (
                      <li key={s._id} className="p-2 bg-white/3 rounded">
                        <div className="text-sm">
                          <strong>{s.activityId ?? "Manual entry"}</strong>
                        </div>
                        <div className="text-xs text-gray-300">
                          {new Date(s.startTime).toLocaleString()} • {s.location.coordinates[1].toFixed(4)},{s.location.coordinates[0].toFixed(4)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white/5 p-4 rounded">
                <h2 className="font-semibold mb-2">Activity this week</h2>
                {/* Simple inline SVG bar chart */}
                <div className="w-full h-40 flex items-end gap-2">
                  {counts.map((c, idx) => {
                    const height = Math.min(100, c * 20 + 4);
                    return (
                      <div key={idx} className="flex-1 text-center">
                        <div className="bg-green-500 mx-auto" style={{ height: `${height}%`, width: "70%" }}></div>
                        <div className="text-xs mt-1">{last7[idx].toLocaleDateString(undefined, { weekday: "short" })}</div>
                      </div>
                    );
                  })}
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
