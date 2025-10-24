// src/app/api/sessions/[id]/route.ts
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

// DELETE => delete a specific session by ID for current user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await mongoDbConnection();
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email }).lean() as UserDocument | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find and delete the session, but only if it belongs to the current user
    const deletedSession = await GreenSession.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!deletedSession) {
      return NextResponse.json({ 
        error: "Session not found or you don't have permission to delete it" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Session deleted successfully",
      deletedSession: {
        id: deletedSession._id,
        startTime: deletedSession.startTime,
        duration: deletedSession.duration
      }
    });
  } catch (err) {
    console.error("DELETE /api/sessions/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}