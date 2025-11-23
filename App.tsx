import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';
import WorkoutGuidePage from './pages/WorkoutGuidePage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import AboutPage from './pages/AboutPage';
import TrainerLoginPage from './pages/TrainerLoginPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import MyPlanPage from './pages/MyPlanPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AIStudioPage from './pages/AIStudioPage';
import ContactSupportIcon from './components/ContactSupportIcon';
import type { QuizData, FirebaseUser, UserProfile } from './types';
import { auth } from './services/firebase';
import { getUserProfile, createUserProfile, saveUserAssessment } from './services/userService';
import { logToSheet } from './services/googleSheetService';

export const AuthContext = React.createContext<{
    currentUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    authLoading: boolean;
}>({
    currentUser: null,
    userProfile: null,
    authLoading: true,
});

export const AppContext = React.createContext<{
quizData: QuizData | null;
setQuizData: (data: QuizData | null) => void;
}>({
quizData: null,
setQuizData: () => {},
});

const QUIZ_DATA_STORAGE_KEY = 'ifit_latest_quiz_data';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    const { currentUser, authLoading } = React.useContext(AuthContext);
    if (authLoading) {
        return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><div className="w-8 h-8 border-4 border-lime-500 border-dashed rounded-full animate-spin"></div></div>;
    }
    return currentUser ? <>{children}</> : <Navigate to="/" />;
};

export default function App() {
    // Auth and Profile state
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // App state
    const [quizData, setQuizData] = useState<QuizData | null>(null);

    // Effect to listen for auth changes and manage user profiles
    useEffect(() => {
        // FIX: Use v8 compat syntax for onAuthStateChanged.
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const { uid, displayName, email, photoURL } = user;
                const firebaseUser = { uid, displayName, email, photoURL };
                setCurrentUser(firebaseUser);

                // Check for existing profile or create a new one
                let profile = await getUserProfile(uid);
                if (!profile) {
                    profile = await createUserProfile(firebaseUser);
                    // Log new sign up
                    logToSheet({
                        name: displayName || 'Unknown',
                        email: email || 'No Email',
                        action: 'New User Sign Up'
                    });
                } else {
                     // Log login
                     logToSheet({
                        name: displayName || 'Unknown',
                        email: email || 'No Email',
                        action: 'User Login'
                    });
                }
                setUserProfile(profile);
                setQuizData(profile.latestQuizData || null);

            } else {
                setCurrentUser(null);
                setUserProfile(null);
                 // Load from localStorage for guests
                const savedData = localStorage.getItem(QUIZ_DATA_STORAGE_KEY);
                setQuizData(savedData ? JSON.parse(savedData) : null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Function to set quiz data and persist it
    const handleSetQuizData = (data: QuizData | null) => {
        setQuizData(data);
        if (currentUser && userProfile && data) {
            // Save to Firestore for logged-in users
            saveUserAssessment(currentUser.uid, data).catch(console.error);
             // Update local profile state immediately for responsiveness
            setUserProfile(prevProfile => prevProfile ? { ...prevProfile, latestQuizData: data } : null);
        } else {
            // Save to localStorage for guests
            if (data) {
                localStorage.setItem(QUIZ_DATA_STORAGE_KEY, JSON.stringify(data));
            } else {
                localStorage.removeItem(QUIZ_DATA_STORAGE_KEY);
            }
        }
    };


return (
    <AuthContext.Provider value={{ currentUser, userProfile, authLoading }}>
        <AppContext.Provider value={{ quizData, setQuizData: handleSetQuizData }}>
            <HashRouter>
                <div className="flex flex-col min-h-screen">
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/assessment" element={<AssessmentPage />} />
                            <Route path="/report" element={quizData ? <ReportPage /> : <Navigate to="/assessment" />} />
                            <Route path="/workout-guide" element={<WorkoutGuidePage />} />
                            <Route path="/my-plan" element={<MyPlanPage />} />
                            <Route path="/progress" element={<ProgressPage />} />
                            <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/trainer-login" element={<TrainerLoginPage />} />
                            <Route path="/trainer-dashboard" element={<TrainerDashboardPage />} />
                            <Route path="/ai-studio" element={<AIStudioPage />} />
                            {/* Add the new protected profile route */}
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                     <footer className="bg-black text-center p-4 text-xs text-gray-600">
                        <p>Your program is informational and non-medical. Stop if pain or dizziness. For medical concerns, consult a professional.</p>
                    </footer>
                </div>
                <ContactSupportIcon />
            </HashRouter>
        </AppContext.Provider>
    </AuthContext.Provider>
);
}