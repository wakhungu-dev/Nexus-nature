"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              🌿 Connect with Nature
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Track your outdoor adventures, discover new parks, complete challenges, 
              and build a deeper connection with the natural world around you.
            </p>
            
            <div className="flex gap-4 justify-center">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/signin"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Everything you need to explore nature
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Interactive Map</h3>
              <p className="text-gray-600">
                Discover parks and natural areas near you. Log activities and track your 
                outdoor adventures with our interactive mapping system.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Gamified Challenges</h3>
              <p className="text-gray-600">
                Complete nature challenges, earn points, and unlock achievements. 
                Stay motivated with our engaging gamification system.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Wellness Analytics</h3>
              <p className="text-gray-600">
                Track your progress with detailed analytics. See how much time you spend 
                in nature and monitor your wellness journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600">Parks Discovered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">10k+</div>
              <div className="text-gray-600">Activities Logged</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Challenges Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to start your nature journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of nature enthusiasts already using Nexus Nature to 
            explore, track, and connect with the outdoors.
          </p>
          
          {!session && (
            <Link
              href="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                🌿 Nexus Nature
              </h3>
              <p className="text-gray-400">
                Connecting people with nature through technology and community.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Interactive Maps</li>
                <li>Activity Tracking</li>
                <li>Challenges</li>
                <li>Analytics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Blog</li>
                <li>Updates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Contact Us</li>
                <li>Social Media</li>
                <li>Newsletter</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Nexus Nature. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
