// FIX: Use Firebase v8 compat imports and syntax to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from './firebase';
import type { FirebaseUser, UserProfile, QuizData } from '../types';

/**
 * Fetches a user's profile from Firestore by their UID.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns {Promise<UserProfile | null>} The user profile object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    // FIX: Use v8 compat syntax for document reference and retrieval.
    const userDocRef = db.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
        const data = userDocSnap.data();
        // Convert Firestore timestamp to ISO string if needed
        if (data && data.createdAt?.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
        }
        return data as UserProfile;
    }
    return null;
};

/**
 * Creates a new user profile document in Firestore.
 * This is typically called the first time a user signs in.
 * @param user The user object from Firebase Auth.
 * @returns {Promise<UserProfile>} The newly created user profile object.
 */
export const createUserProfile = async (user: FirebaseUser): Promise<UserProfile> => {
    // FIX: Use v8 compat syntax for document reference.
    const userDocRef = db.collection('users').doc(user.uid);
    const newUserProfile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
        ...user,
        // FIX: Use v8 compat syntax for server timestamp.
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp for creation
    };
    // FIX: Use v8 compat syntax for setting a document.
    await userDocRef.set(newUserProfile);
    return { ...user, createdAt: new Date().toISOString() };
};

/**
 * Saves or updates the 'latestQuizData' field in a user's Firestore profile.
 * @param uid The user's unique ID.
 * @param quizData The completed quiz data to save.
 */
export const saveUserAssessment = async (uid: string, quizData: QuizData): Promise<void> => {
    // FIX: Use v8 compat syntax for document reference.
    const userDocRef = db.collection('users').doc(uid);
    // FIX: Use v8 compat syntax for updating a document.
    await userDocRef.update({
        latestQuizData: quizData
    });
};