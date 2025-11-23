
import React, { useEffect, useRef, useState } from 'react';
import { X, Check, ChevronDown, VideoOff } from 'lucide-react';
import type { LibraryExercise } from '../types';

interface ExerciseDetailModalProps {
    exercise: LibraryExercise | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, isOpen, onClose }: ExerciseDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [variationsOpen, setVariationsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVariationsOpen(false); // Reset variations state when modal opens
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !exercise) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-title"
        >
             <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out; }`}</style>
            <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 id="exercise-title" className="text-2xl font-bold text-white">{exercise.name}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </header>
                
                <div className="overflow-y-auto">
                    <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                        {exercise.videoUrl ? (
                             <video
                                key={exercise.id}
                                src={exercise.videoUrl}
                                className="w-full h-full object-contain"
                                autoPlay
                                loop
                                controls
                                muted
                                playsInline
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                                <VideoOff className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Video demonstration not available</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6">
                        <p className="text-gray-300 mb-6 leading-relaxed">{exercise.description}</p>
                        
                        <h3 className="text-xl font-semibold text-white mb-4">Instructions</h3>
                        <ul className="space-y-4">
                            {exercise.instructions.map((step, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className="w-5 h-5 text-lime-500 mr-4 mt-1 flex-shrink-0" />
                                    <span className="text-gray-300 leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ul>

                        {exercise.variations && exercise.variations.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <button
                                    onClick={() => setVariationsOpen(!variationsOpen)}
                                    className="w-full flex justify-between items-center text-left text-xl font-semibold text-white"
                                    aria-expanded={variationsOpen}
                                    aria-controls="variations-content"
                                >
                                    <span>Exercise Variations</span>
                                    <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${variationsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div
                                    id="variations-content"
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${variationsOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}
                                >
                                    <div className="space-y-4 pl-2 border-l-2 border-gray-700">
                                        {exercise.variations.map((variation, index) => (
                                            <div key={index} className="pl-4">
                                                <h4 className="font-bold text-lime-400">{variation.name}</h4>
                                                <p className="text-gray-300 leading-relaxed">{variation.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
