import { NextResponse } from "next/server";
import mongoDbConnection from "@/lib/mongodb";
import GreenSession from "@/models/greenSessionCollection";
import ChallengeCompletion from "@/models/challengeCompletion";
import WellnessReport from "@/models/wellnessReport";
import User from "@/models/userCollection";
import { getServerSession } from "next-auth";
import authConfig from "@/auth/auth.config";

export async function GET() {
  try {
    await mongoDbConnection();
    
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    // Check if report already exists for this week
    let report = await WellnessReport.findOne({
      userId: user._id,
      weekStart,
      weekEnd
    });

    if (!report) {
      // Generate new report
      const sessions = await GreenSession.find({
        userId: user._id,
        startTime: { $gte: weekStart, $lte: weekEnd }
      });

      const completions = await ChallengeCompletion.find({
        userId: user._id,
        completedAt: { $gte: weekStart, $lte: weekEnd }
      });

      // Calculate metrics
      const totalMinutes = sessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      const sessionCount = sessions.length;
      const challengesCompleted = completions.length;
      const avgSessionDuration = sessionCount > 0 ? totalMinutes / sessionCount : 0;

      // Find favorite location (most frequent coordinates)
      const locationMap = new Map();
      sessions.forEach(session => {
        if (session.location?.coordinates) {
          const key = `${session.location.coordinates[0]},${session.location.coordinates[1]}`;
          locationMap.set(key, (locationMap.get(key) || 0) + 1);
        }
      });

      let favoriteLocation = "No location data";
      if (locationMap.size > 0) {
        const mostFrequent = Array.from(locationMap.entries())
          .sort((a, b) => b[1] - a[1])[0];
        favoriteLocation = `${mostFrequent[0]} (${mostFrequent[1]} visits)`;
      }

      // Get previous week for comparison
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekEnd);
      prevWeekEnd.setDate(weekEnd.getDate() - 7);

      const prevSessions = await GreenSession.find({
        userId: user._id,
        startTime: { $gte: prevWeekStart, $lte: prevWeekEnd }
      });

      const prevTotalMinutes = prevSessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      const minutesChange = totalMinutes - prevTotalMinutes;
      let trend: "UP" | "DOWN" | "SAME" = "SAME";
      if (minutesChange > 0) trend = "UP";
      else if (minutesChange < 0) trend = "DOWN";

      // Check for achievements
      const achievementUnlocked = totalMinutes >= 300 || challengesCompleted >= 3; // 5 hours or 3 challenges

      // Create report
      report = await WellnessReport.create({
        userId: user._id,
        weekStart,
        weekEnd,
        totalMinutes,
        sessionCount,
        challengesCompleted,
        avgSessionDuration,
        favoriteLocation,
        achievementUnlocked,
        comparisonToPrevious: {
          minutesChange,
          trend
        }
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("GET /api/reports/weekly error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
