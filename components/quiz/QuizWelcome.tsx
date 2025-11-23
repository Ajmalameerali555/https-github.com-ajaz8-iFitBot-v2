
import React from 'react';
import { Sparkles, Target, Zap, ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuizWelcome({ onStart }: { onStart: () => void }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
             <Link to="/" className="absolute top-8 left-8 text-gray-300 hover:text-lime-500 flex items-center z-20">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="max-w-3xl mx-auto text-center z-10">
                <div className="mb-10">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        iFit Assessment
                        <span className="block text-lime-500 text-4xl md:text-5xl mt-2">
                            Ready to Start?
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                        Get a hyper-personalized fitness plan powered by AI.
                        <br className="hidden md:block" />
                        We'll just take your <strong>Name</strong> and <strong>Email</strong>, then jump straight into your custom assessment.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center transform hover:scale-105 transition-transform">
                        <Target className="w-12 h-12 text-lime-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Personalized</h3>
                        <p className="text-gray-400 text-sm">Tailored to your body, goals, and lifestyle</p>
                    </div>
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center transform hover:scale-105 transition-transform">
                        <Zap className="w-12 h-12 text-lime-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
                        <p className="text-gray-400 text-sm">Advanced algorithms create your optimal plan</p>
                    </div>
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center transform hover:scale-105 transition-transform">
                        <Sparkles className="w-12 h-12 text-lime-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Actionable</h3>
                        <p className="text-gray-400 text-sm">Clear reports and day-by-day workout guides.</p>
                    </div>
                </div>

                <div>
                    <button
                        onClick={onStart}
                        className="bg-gradient-to-r from-lime-500 to-green-500 hover:opacity-90 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-lime-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                    >
                        Start with Name & Email
                        <Play className="w-6 h-6 fill-current" />
                    </button>
                    <p className="text-gray-400 text-sm mt-4">
                        Takes about 2 minutes • No login required
                    </p>
                </div>
            </div>
        </div>
    );
}
