
import React from 'react';
import type { LibraryExercise } from '../types';
import { VideoOff } from 'lucide-react';

interface ExerciseCardProps {
    exercise: LibraryExercise;
    onClick: (exercise: LibraryExercise) => void;
}

const difficultyColorMap: Record<string, string> = {
    Beginner: 'bg-green-500/80',
    Intermediate: 'bg-yellow-500/80',
    Advanced: 'bg-red-500/80',
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
    const difficultyColor = difficultyColorMap[exercise.difficulty] || 'bg-gray-500/80';

    return (
        <div
            className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lime-500/20"
            onClick={() => onClick(exercise)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${exercise.name}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(exercise)}
        >
            <div className="relative w-full h-56 bg-black">
                {exercise.videoUrl ? (
                    <video
                        src={exercise.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        autoPlay
                        loop
                        muted
                        playsInline
                        aria-hidden="true"
                    />
                ) : (
                     <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                        <VideoOff className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Video Not Available</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white truncate">{exercise.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-300 bg-white/10 px-2 py-1 rounded-md">{exercise.muscleGroup}</span>
                        <span className={`text-xs text-white font-semibold px-2 py-1 rounded-full ${difficultyColor}`}>
                            {exercise.difficulty}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExerciseCard;
