import { NextResponse } from "next/server";
import mongoDbConnection from "@/lib/mongodb";
import Challenge from "@/models/challengeCollection";

export async function GET() {
  try {
    await mongoDbConnection();
    
    const challenges = await Challenge.find({}).sort({ difficulty: 1 , category: 1 });
    
    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("GET /api/challenges error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await mongoDbConnection();
    
    const body = await request.json();
    const { title, description, difficulty, category, locationBased, coordinates } = body;

    if (!title || !description || !difficulty || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty,
      category,
      locationBased: locationBased || false,
      coordinates: coordinates || []
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("POST /api/challenges error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


