import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Image as ImageIcon, Wand2, Download, Upload, Loader2, RefreshCw } from 'lucide-react';
import { editUserImage, generateMotivationImage } from '../services/geminiService';
import type { AspectRatio } from '../types';

const AspectRatioSelector = ({ value, onChange }: { value: AspectRatio, onChange: (v: AspectRatio) => void }) => (
    <div className="grid grid-cols-4 gap-2">
        {["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"].map((ratio) => (
            <button
                key={ratio}
                onClick={() => onChange(ratio as AspectRatio)}
                className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                    value === ratio 
                        ? 'bg-lime-500 text-black border-lime-500' 
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-lime-500'
                }`}
            >
                {ratio}
            </button>
        ))}
    </div>
);

export default function AIStudioPage() {
    const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('edit');
    const [loading, setLoading] = useState(false);
    
    // Edit State
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [editedResult, setEditedResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate State
    const [genPrompt, setGenPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setSourceImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!sourceImage || !editPrompt) return;
        setLoading(true);
        setEditedResult(null);
        try {
            const result = await editUserImage(sourceImage, editPrompt);
            setEditedResult(result);
        } catch (error) {
            console.error(error);
            alert("Failed to edit image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!genPrompt) return;
        setLoading(true);
        setGeneratedResult(null);
        try {
            const result = await generateMotivationImage(genPrompt, aspectRatio);
            setGeneratedResult(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <header className="text-center mb-10">
                    <Sparkles className="w-12 h-12 mx-auto text-lime-500 mb-4" />
                    <h1 className="text-4xl font-bold">iFit AI Studio</h1>
                    <p className="text-gray-400 mt-2">Powered by Gemini 3 Pro & Gemini 2.5 Flash Image</p>
                </header>

                <div className="flex justify-center mb-8 bg-gray-800/50 p-1 rounded-xl w-fit mx-auto">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'edit' ? 'bg-lime-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Magic Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'generate' ? 'bg-lime-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Motivation Generator
                    </button>
                </div>

                {activeTab === 'edit' ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Wand2 className="text-lime-400"/> Edit Your Photos</h2>
                        <p className="text-gray-400 mb-6 text-sm">Upload a photo and describe how you want to change it (e.g., "Add a retro filter", "Remove the background").</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${sourceImage ? 'border-lime-500 bg-gray-900' : 'border-gray-600 hover:border-gray-500 bg-gray-800'}`}
                                >
                                    {sourceImage ? (
                                        <img src={sourceImage} alt="Source" className="w-full h-full object-contain rounded-xl" />
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-500 mb-2" />
                                            <span className="text-gray-400 text-sm">Click to Upload</span>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
                                    <textarea
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="E.g., Make it look like a cyberpunk poster..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleEdit}
                                    disabled={loading || !sourceImage || !editPrompt}
                                    className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                                    Magic Edit
                                </button>
                            </div>

                            <div className="bg-black/50 rounded-xl border border-gray-700 flex items-center justify-center aspect-square relative">
                                {editedResult ? (
                                    <>
                                        <img src={editedResult} alt="Result" className="w-full h-full object-contain rounded-xl" />
                                        <a href={editedResult} download="ifit_edit.png" className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-200">
                                            <Download size={20} />
                                        </a>
                                    </>
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center">
                                        <ImageIcon size={40} className="mb-2 opacity-20" />
                                        <span>Result will appear here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="text-lime-400"/> Create Motivation Posters</h2>
                        <p className="text-gray-400 mb-6 text-sm">Describe your ideal fitness goal or a motivational scene, and choose an aspect ratio.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Describe the Image</label>
                                    <textarea
                                        value={genPrompt}
                                        onChange={(e) => setGenPrompt(e.target.value)}
                                        placeholder="E.g., A futuristic gym with neon lights, high energy..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                                        rows={4}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                    <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !genPrompt}
                                    className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:opacity-90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    Generate
                                </button>
                            </div>

                             <div className="bg-black/50 rounded-xl border border-gray-700 flex items-center justify-center min-h-[300px] relative">
                                {generatedResult ? (
                                    <>
                                        <img src={generatedResult} alt="Generated" className="w-full h-full object-contain rounded-xl max-h-[500px]" />
                                        <a href={generatedResult} download="ifit_motivation.png" className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-200">
                                            <Download size={20} />
                                        </a>
                                    </>
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center">
                                        <Sparkles size={40} className="mb-2 opacity-20" />
                                        <span>Generated art appears here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}