"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  locationBased: boolean;
  coordinates?: [number, number];
  points: number;
  completed?: boolean;
}

interface ChallengeCompletion {
  _id: string;
  challengeId: string;
  userId: string;
  completedAt: string;
  notes?: string;
  imageUrl?: string;
}

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"available" | "completed">("available");

  useEffect(() => {
    loadChallenges();
    if (session?.user) {
      loadCompletions();
    }
  }, [session]);

  const loadChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error("Failed to load challenges:", error);
    }
  };

  const loadCompletions = async () => {
    try {
      const response = await fetch("/api/challenges/completed");
      const data = await response.json();
      setCompletions(data.completions || []);
    } catch (error) {
      console.error("Failed to load completions:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!session?.user) {
      alert("Please sign in to complete challenges");
      return;
    }

    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Completed from challenges page" }),
      });

      if (response.ok) {
        alert("Challenge completed! 🎉");
        loadCompletions();
      } else {
        alert("Failed to complete challenge");
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      alert("Error completing challenge");
    }
  };

  const completedChallengeIds = completions.map(c => c.challengeId);
  const availableChallenges = challenges.filter(c => !completedChallengeIds.includes(c._id));
  const completedChallenges = challenges.filter(c => completedChallengeIds.includes(c._id));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPoints = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return 10;
      case "Medium": return 25;
      case "Hard": return 50;
      default: return 10;
    }
  };

  const totalPoints = completions.length * 25; // Average points

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading challenges...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🏆 Nature Challenges</h1>
          <p className="text-gray-600 mb-6">
            Complete challenges to build healthy outdoor habits and earn points!
          </p>
          
          {session?.user && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{completions.length}</div>
                  <div className="text-sm opacity-90">Challenges Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalPoints}</div>
                  <div className="text-sm opacity-90">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{availableChallenges.length}</div>
                  <div className="text-sm opacity-90">Available Challenges</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "available"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Available ({availableChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "completed"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Completed ({completions.length})
          </button>
        </div>

        {/* Challenge Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeTab === "available" &&
            availableChallenges.map((challenge) => (
              <div key={challenge._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Category: {challenge.category}</span>
                  <span className="text-sm font-medium text-green-600">
                    +{getPoints(challenge.difficulty)} points
                  </span>
                </div>

                {challenge.locationBased && (
                  <div className="text-xs text-blue-600 mb-4">
                    📍 Location-based challenge
                  </div>
                )}

                <button
                  onClick={() => completeChallenge(challenge._id)}
                  disabled={!session?.user}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {!session?.user ? "Sign in to complete" : "Complete Challenge"}
                </button>
              </div>
            ))}

          {activeTab === "completed" &&
            completedChallenges.map((challenge) => {
              const completion = completions.find(c => c.challengeId === challenge._id);
              return (
                <div key={challenge._id} className="bg-gray-50 rounded-lg shadow-md p-6 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">{challenge.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                      ✅ Completed
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  
                  {completion && (
                    <div className="text-xs text-gray-500">
                      Completed on {new Date(completion.completedAt).toLocaleDateString()}
                      {completion.notes && (
                        <div className="mt-1 italic">"{completion.notes}"</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {activeTab === "available" && availableChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">All challenges completed!</h3>
            <p className="text-gray-600">Check back later for new challenges.</p>
          </div>
        )}

        {activeTab === "completed" && completions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏁</div>
            <h3 className="text-xl font-semibold mb-2">No completed challenges yet</h3>
            <p className="text-gray-600">Start with some easy challenges to get going!</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
