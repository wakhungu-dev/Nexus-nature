"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MapPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the enhanced map page
    router.push("/enhanced-map");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Map...</h2>
        <p className="text-gray-600">Redirecting to Enhanced Map Experience</p>
      </div>
    </div>
  );
}
