
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Star, Dumbbell, Waves, Sparkles, HeartPulse, UserCheck, Music } from 'lucide-react';

interface InfoCardProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex items-start gap-4">
        <Icon className="w-8 h-8 text-lime-400 mt-1 flex-shrink-0" />
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="text-gray-300">{children}</div>
        </div>
    </div>
);

export default function AboutPage() {
    const address = "Suhail Awaidah Al Khaili Heirs Building, Salam Street, near ADCB Headquarters, Abu Dhabi, UAE";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-2">iFit Fitness Club</h1>
                    <p className="text-xl text-lime-400">A friendly and judgment-free environment for everyone.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard icon={MapPin} title="Location">
                        <p>{address}</p>
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline mt-2 inline-block">
                            View on Google Maps
                        </a>
                    </InfoCard>

                    <InfoCard icon={Phone} title="Contact Us">
                        <p><strong>Phone:</strong> <a href="tel:+971581514436" className="hover:underline">+971 58 151 4436</a></p>
                        <p><strong>Landline:</strong> <a href="tel:+97125844436" className="hover:underline">+971 25 84 4436</a></p>
                        <p className="mt-2"><strong>Email:</strong></p>
                        <a href="mailto:ifitfitnessclub@gmail.com" className="hover:underline">ifitfitnessclub@gmail.com</a>
                    </InfoCard>

                    <InfoCard icon={Clock} title="Opening Hours">
                        <ul className="list-disc list-inside">
                            <li><strong>Sunday:</strong> 4:00 PM - 12:00 AM</li>
                            <li><strong>Mon - Sat:</strong> 6:00 AM - 1:00 AM</li>
                        </ul>
                    </InfoCard>

                    <InfoCard icon={Star} title="Community Rated">
                         <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="ml-2 text-white font-bold text-lg">4.8 / 5</span>
                        </div>
                        <p className="text-sm mt-1">Based on ~38 reviews on GymFinder.</p>
                    </InfoCard>

                    <div className="md:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                         <h3 className="text-xl font-semibold text-white mb-4 text-center">Facilities & Services</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div className="flex flex-col items-center p-2"><HeartPulse className="w-8 h-8 text-lime-400 mb-2"/><span>Cardio</span></div>
                            <div className="flex flex-col items-center p-2"><Dumbbell className="w-8 h-8 text-lime-400 mb-2"/><span>Weight Training</span></div>
                            <div className="flex flex-col items-center p-2"><Waves className="w-8 h-8 text-lime-400 mb-2"/><span>Swimming Pool</span></div>
                            <div className="flex flex-col items-center p-2"><Music className="w-8 h-8 text-lime-400 mb-2"/><span>Dance Classes</span></div>
                            <div className="flex flex-col items-center p-2"><UserCheck className="w-8 h-8 text-lime-400 mb-2"/><span>Personal Training</span></div>
                            <div className="flex flex-col items-center p-2"><Sparkles className="w-8 h-8 text-lime-400 mb-2"/><span>Clean Facilities</span></div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
