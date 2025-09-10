import { NextResponse } from "next/server";
import mongoDbConnection from "@/lib/mongodb";
import Challenge from "@/models/challengeCollection";
import ChallengeCompletion from "@/models/challengeCompletion";
import { getServerSession } from "next-auth";
import authConfig from "@/auth/auth.config";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await mongoDbConnection();
    
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challengeId = params.id;
    const body = await request.json();
    const { notes, imageUrl, location } = body;

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check if already completed
    const existingCompletion = await ChallengeCompletion.findOne({
      challengeId,
      userId: session.user.id
    });

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Challenge already completed" },
        { status: 400 }
      );
    }

    // Create completion
    const completion = await ChallengeCompletion.create({
      userId: session.user.id,
      challengeId,
      notes: notes || "",
      imageUrl: imageUrl || "",
      location: location || null,
      completedAt: new Date()
    });

    return NextResponse.json({ completion }, { status: 201 });
  } catch (error) {
    console.error("POST /api/challenges/[id]/complete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
