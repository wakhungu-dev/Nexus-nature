// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import mongoDbConnection from "@/lib/mongodb";
import GreenSession from "@/models/greenSessionCollection";
import User from "@/models/userCollection";
import { getServerSession } from "next-auth";
import authConfig from "@/auth/auth.config";

interface UserDocument {
  _id: string;
  email: string;
  name: string;
}

// GET => return sessions for current user
export async function GET() {
  try {
    await mongoDbConnection();
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).lean() as UserDocument | null;
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await GreenSession.find({ userId: user._id }).sort({ startTime: -1 }).lean();
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("GET /api/sessions error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST => create new session for current user
export async function POST(req: Request) {
  try {
    await mongoDbConnection();
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // find or create user
    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      user = await User.create({
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
      });
    }

    const newSession = await GreenSession.create({
      userId: user._id,
      startTime: body.startTime ? new Date(body.startTime) : new Date(),
      endTime: body.endTime ? new Date(body.endTime) : null,
      duration: body.duration ?? 0,
      location: {
        type: "Point",
        coordinates: [body.lng, body.lat],
      },
      source: body.source ?? "manual",
      activityId: body.activityId ?? null,
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (err) {
    console.error("POST /api/sessions error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
