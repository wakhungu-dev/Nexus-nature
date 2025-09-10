import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    
    // For now, return sample nature locations
    // In production, this would query your Challenge collection
    const natureLocations = [
      {
        id: "1",
        name: "Uhuru Gardens",
        type: "park",
        coordinates: [-1.3095, 36.7821] as [number, number],
        description: "Beautiful memorial park with gardens and monuments",
        activities: ["Walking", "Photography", "Meditation"]
      },
      {
        id: "2", 
        name: "Karura Forest",
        type: "forest",
        coordinates: [-1.2407, 36.8283] as [number, number],
        description: "Urban forest with hiking trails and waterfalls",
        activities: ["Hiking", "Bird Watching", "Cycling"]
      },
      {
        id: "3",
        name: "Ngong Hills",
        type: "hill",
        coordinates: [-1.3667, 36.6500] as [number, number], 
        description: "Scenic hills perfect for hiking and panoramic views",
        activities: ["Hiking", "Photography", "Paragliding"]
      },
      {
        id: "4",
        name: "Lake Naivasha",
        type: "lake",
        coordinates: [-0.7667, 36.3500] as [number, number],
        description: "Freshwater lake ideal for boat rides and wildlife viewing",
        activities: ["Boat Rides", "Bird Watching", "Fishing"]
      },
      {
        id: "5",
        name: "Diani Beach",
        type: "beach", 
        coordinates: [-4.2947, 39.5772] as [number, number],
        description: "Pristine white sand beach with coral reefs",
        activities: ["Swimming", "Snorkeling", "Beach Walking"]
      }
    ];

    return NextResponse.json(natureLocations);
  } catch (error) {
    console.error("Error fetching nature locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch nature locations" },
      { status: 500 }
    );
  }
}
