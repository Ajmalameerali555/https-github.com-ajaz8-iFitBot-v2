
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { logout } from '../services/firebase';
import { ArrowLeft, LogOut, FileText, Dumbbell, TrendingUp, Edit } from 'lucide-react';
import { getPendingPlans } from '../services/planService';

interface InfoCardProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    ctaLink: string;
    ctaText: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children, ctaLink, ctaText }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col justify-between h-full">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <Icon className="w-8 h-8 text-lime-400" />
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
            </div>
            <div className="text-gray-300 space-y-2">
                {children}
            </div>
        </div>
        <Link to={ctaLink} className="mt-6 bg-gray-700 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center w-full block">
            {ctaText}
        </Link>
    </div>
);

export default function ProfilePage() {
    const { userProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <p className="text-white">Loading profile...</p>
            </div>
        );
    }

    const latestQuiz = userProfile.latestQuizData;
    const allPlans = getPendingPlans();
    const latestPlan = allPlans
        .filter(p => p.userEmail.toLowerCase() === userProfile.email?.toLowerCase())
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="w-full flex justify-between items-center mb-8">
                    <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                <header className="flex flex-col sm:flex-row items-center gap-6 mb-12">
                     <img 
                        src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.displayName || userProfile.email}&background=a3e635&color=000&size=128`} 
                        alt={userProfile.displayName || 'User'} 
                        className="w-24 h-24 rounded-full border-4 border-lime-500" 
                    />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-center sm:text-left">Welcome, {userProfile.displayName}!</h1>
                        <p className="text-lg text-gray-400 mt-2 text-center sm:text-left">This is your personal fitness hub. Let's get moving.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoCard icon={FileText} title="My Assessment" ctaLink={latestQuiz ? "/report" : "/assessment"} ctaText={latestQuiz ? "View Full Report" : "Start My Assessment"}>
                        {latestQuiz ? (
                             <>
                                <p><strong>Last Completed:</strong> {new Date(latestQuiz.id!).toLocaleDateString()}</p>
                                <p><strong>Primary Goal:</strong> <span className="capitalize">{latestQuiz.goal.replace('_', ' ')}</span></p>
                                <p><strong>Status:</strong> <span className="text-green-400">Complete & Ready</span></p>
                            </>
                        ) : (
                            <p>You haven't completed an assessment yet. Start now to unlock your personalized report and workout guide.</p>
                        )}
                    </InfoCard>
                    
                    <InfoCard icon={Dumbbell} title="My Workout Plan" ctaLink="/my-plan" ctaText="Check Plan Status">
                        {latestPlan ? (
                            <>
                                <p><strong>Generated:</strong> {new Date(latestPlan.generatedAt).toLocaleDateString()}</p>
                                <p><strong>Assigned Trainer:</strong> {latestPlan.assignedTrainerName}</p>
                                <p><strong>Status:</strong> <span className={`capitalize font-semibold ${
                                    latestPlan.status === 'approved' ? 'text-green-400' : 
                                    latestPlan.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                }`}>{latestPlan.status}</span></p>
                            </>
                        ) : (
                            <p>Generate a workout guide from your assessment report to see its status here. First, complete your assessment!</p>
                        )}
                    </InfoCard>

                    <InfoCard icon={TrendingUp} title="My Progress" ctaLink="/progress" ctaText="Open Progress Tracker">
                        <p>Track your weight changes, log personal records for key lifts, and visualize your consistency over time.</p>
                        <p className="mt-2 text-lime-400">Stay consistent, stay motivated.</p>
                    </InfoCard>
                </div>

            </div>
        </div>
    );
}
