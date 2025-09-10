import { NextResponse } from "next/server";
import mongoDbConnection from "@/lib/mongodb";
import ChallengeCompletion from "@/models/challengeCompletion";
import { getServerSession } from "next-auth";
import authConfig from "@/auth/auth.config";

export async function GET() {
  try {
    await mongoDbConnection();
    
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completions = await ChallengeCompletion.find({ 
      userId: session.user.id 
    })
    .populate('challengeId')
    .sort({ completedAt: -1 });

    return NextResponse.json({ completions });
  } catch (error) {
    console.error("GET /api/challenges/completed error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
