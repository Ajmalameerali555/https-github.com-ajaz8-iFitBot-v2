
import React from 'react';
import type { ReportData, QuizData, Flag } from '../types';
import { BookOpen, AlertTriangle, Flame, Droplets, Utensils, Wheat, Beef, Target, Activity, CalendarClock, ArrowRight } from 'lucide-react';

// --- START: NEW VISUALIZATION COMPONENTS ---

// Enhanced Gauge Component with Semi-Circle Design
const Gauge = ({ label, value, unit, idealMin, idealMax, status }: { label: string, value: number, unit: string, idealMin: number, idealMax: number, status: "below" | "within" | "above" }) => {
    // Calculate visualization percentages
    // We create a visual range that puts the ideal range roughly in the middle
    const rangeSpan = idealMax - idealMin;
    const padding = rangeSpan * 1.5; // Padding around the ideal range
    const visualMin = Math.max(0, idealMin - padding);
    const visualMax = idealMax + padding;
    
    const percentage = Math.max(0, Math.min(100, ((value - visualMin) / (visualMax - visualMin)) * 100));
    
    // Gradient definitions based on status
    const colors = {
        below: { text: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', gradient: ['#60a5fa', '#3b82f6'] }, // Blue
        within: { text: 'text-green-600', bg: 'bg-green-50/50', border: 'border-green-100', gradient: ['#4ade80', '#22c55e'] }, // Green
        above: { text: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100', gradient: ['#fbbf24', '#f59e0b'] }, // Amber
    }[status] || { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', gradient: ['#9ca3af', '#6b7280'] };

    const radius = 40;
    const circumference = Math.PI * radius; // Semi-circle
    const dashOffset = circumference - ((percentage / 100) * circumference);

    return (
        <div className={`p-6 rounded-2xl shadow-sm border ${colors.border} ${colors.bg} flex flex-col items-center justify-between h-full transition-all duration-300 hover:shadow-md`}>
            <h3 className="text-lg font-bold text-gray-700 mb-4">{label}</h3>
            
            <div className="relative w-full max-w-[200px] aspect-[2/1] mb-2">
                <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colors.gradient[0]} />
                            <stop offset="100%" stopColor={colors.gradient[1]} />
                        </linearGradient>
                    </defs>
                    {/* Background Track */}
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                    {/* Value Track */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={`url(#grad-${label.replace(/\s/g, '')})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-1000 ease-out"
                    />
                    {/* Value Text */}
                    <text x="50" y="42" textAnchor="middle" className={`text-2xl font-bold fill-current ${colors.text}`} dominantBaseline="middle">
                        {value.toFixed(1)}
                    </text>
                    <text x="50" y="55" textAnchor="middle" className="text-[0.6rem] fill-gray-500 font-semibold uppercase tracking-wider">
                        {unit}
                    </text>
                </svg>
            </div>

             <div className="text-center w-full">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${status === 'within' ? 'bg-green-100 text-green-700' : status === 'below' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {status} Range
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-4 border-t border-gray-200/50 pt-2 w-full">
                    <span>Target Min: {idealMin}</span>
                    <span>Max: {idealMax}</span>
                </div>
            </div>
        </div>
    );
};

// Enhanced Macro Display Card
const MacroDisplay = ({ label, value, unit, icon: Icon, colorClass, barColor }: { label: string, value: string, unit: string, icon: React.ElementType, colorClass: string, barColor: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 group">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-gray-300 text-sm font-medium">{label}</span>
                <span className="text-white text-lg font-bold tracking-tight">{value} <span className="text-xs text-gray-500 font-normal">{unit}</span></span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} w-3/4 rounded-full opacity-90 shadow-[0_0_10px_rgba(0,0,0,0.3)]`}></div>
            </div>
        </div>
    </div>
);

const NutritionTargets = ({ targets }: { targets: ReportData['nutrition_targets'] }) => {
    return (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg h-full flex flex-col">
             <div className="text-center mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    <Utensils size={14} /> Daily Calorie Target
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500 drop-shadow-sm">
                        {targets.recommended_calories_kcal}
                    </span>
                    <span className="text-xl text-gray-500 font-medium">kcal</span>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center gap-3">
                 <MacroDisplay 
                    label="Protein" 
                    value={`${targets.protein_g}`} 
                    unit="g" 
                    icon={Beef} 
                    colorClass="bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                    barColor="bg-rose-500" 
                 />
                 <MacroDisplay 
                    label="Carbs" 
                    value={`${targets.carbs_g_range?.[0] || '?'} - ${targets.carbs_g_range?.[1] || '?'}`} 
                    unit="g" 
                    icon={Wheat} 
                    colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                    barColor="bg-amber-500" 
                 />
                 <MacroDisplay 
                    label="Fats" 
                    value={`${targets.fats_g_range?.[0] || '?'} - ${targets.fats_g_range?.[1] || '?'}`} 
                    unit="g" 
                    icon={Flame} 
                    colorClass="bg-blue-500/10 text-blue-500 border border-blue-500/20" 
                    barColor="bg-blue-500" 
                 />
                 <MacroDisplay 
                    label="Water" 
                    value={`${targets.water_l}`} 
                    unit="L" 
                    icon={Droplets} 
                    colorClass="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" 
                    barColor="bg-cyan-500" 
                 />
            </div>
        </div>
    );
};

const TransformationRoadmap = ({ data }: { data: ReportData }) => {
    const { timeline, numbers } = data;
    
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6 relative z-10">
                <Target className="text-lime-600" /> Transformation Roadmap
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100 text-center shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Excess Fat to Lose</p>
                    <p className="text-4xl font-extrabold text-red-600 mt-2">
                        {timeline.excess_fat_kg > 0 ? timeline.excess_fat_kg.toFixed(1) : <span className="text-2xl text-gray-400">N/A</span>} 
                        {timeline.excess_fat_kg > 0 && <span className="text-lg text-red-400 ml-1">kg</span>}
                    </p>
                </div>
                
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="hidden md:block w-full h-0.5 bg-gray-200 relative top-3"></div>
                    <div className="bg-white px-4 relative z-10 flex flex-col items-center">
                         <span className="text-xs font-bold uppercase text-lime-600 mb-1">Target Timeline</span>
                         <span className="text-2xl font-bold text-gray-800">{timeline.is_timeline_realistic ? timeline.weeks_to_goal : timeline.adjusted_timeline_weeks} <span className="text-sm font-normal text-gray-500">Weeks</span></span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 text-center shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Daily Deficit Required</p>
                    <p className="text-4xl font-extrabold text-green-600 mt-2">{numbers.daily_calorie_deficit_needed.toFixed(0)} <span className="text-lg text-green-400">kcal</span></p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Activity size={16}/> The Daily Equation</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Maintenance</p>
                        <p className="text-xl font-bold text-gray-800">~{numbers.current_maintenance_calories.toFixed(0)}</p>
                    </div>
                    <div className="hidden md:block text-xl text-gray-300">-</div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Target Intake</p>
                        <p className="text-xl font-bold text-blue-600">{numbers.target_intake_kcal.toFixed(0)}</p>
                    </div>
                    <div className="hidden md:block text-xl text-gray-300">+</div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Burn (Cardio)</p>
                        <p className="text-xl font-bold text-orange-500">{numbers.target_burn_per_day_activity.toFixed(0)}</p>
                    </div>
                    <div className="hidden md:block text-xl text-gray-300">=</div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Result</p>
                        <p className="text-xl font-bold text-green-600">-{timeline.projected_loss_per_week_kg.toFixed(2)} kg/wk</p>
                    </div>
                </div>
                 {!timeline.is_timeline_realistic && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg flex items-start gap-3 shadow-sm">
                        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-yellow-600"/>
                        <span>
                            <strong>Timeline Adjusted:</strong> Your original goal was unsafe. We've extended it to {timeline.adjusted_timeline_weeks} weeks to protect your muscle mass and metabolism.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const FlagsDisplay = ({ flags }: { flags: Flag[] }) => {
    if (!flags || flags.length === 0) return null;
    
    const severityStyles = {
        low: 'bg-blue-50 border-blue-200 text-blue-800',
        medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        high: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
        <div className="mb-10">
             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <AlertTriangle className="text-red-500" /> Priority Focus Areas
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flags.map((flag, index) => (
                    <div key={index} className={`border p-5 rounded-xl shadow-sm ${severityStyles[flag.severity]}`}>
                        <div className="flex justify-between items-start mb-2">
                             <p className="font-bold text-lg">{flag.issue}</p>
                             <span className="text-xs font-bold uppercase tracking-wider opacity-70 px-2 py-0.5 rounded bg-white/50">{flag.severity}</span>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">{flag.why}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- END: NEW VISUALIZATION COMPONENTS ---


const ReportContent = React.forwardRef<HTMLDivElement, { reportData: ReportData, quizData: QuizData }>(({ reportData, quizData }, ref) => {
    if (!reportData) return null;

    // A simple markdown to HTML converter
    const renderMarkdown = (markdown: string) => {
        return markdown
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-700 mt-8 mb-3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 border-l-4 border-lime-500 pl-4 my-8">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
            .replace(/\*\*(.*)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/\n\s*-\s/g, '<li class="flex items-start mb-2"><span class="text-lime-500 font-bold mr-2 mt-1.5">•</span><span>')
            .replace(/(\<li.*\>.*)/g, '$1</span></li>') // Close span
            .replace(/<\/li\>(?!<li)/g, '</li></ul>') // Close ul at end of list block (approximation)
            .replace(/<li/g, '<ul class="my-4 pl-2"><li') // Open ul (approximation, regex markdown is tricky)
            .replace(/<\/ul>\s*<ul class="my-4 pl-2">/g, '') // Merge adjacent lists
            .replace(/\n/g, '<br />');
    };

    return (
        <div ref={ref} className="bg-white text-gray-700 p-4 sm:p-8 md:p-12 rounded-xl shadow-2xl printable-area font-sans max-w-5xl mx-auto">
            <div className="text-center mb-12 border-b border-gray-100 pb-8">
                <div className="inline-block px-4 py-1.5 rounded-full bg-lime-100 text-lime-800 text-sm font-bold uppercase tracking-wider mb-4">iFit AI Analysis</div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">Transformation Blueprint</h1>
                <p className="text-md sm:text-lg text-gray-500">Prepared for <span className="font-bold text-gray-800">{quizData.name}</span> on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <TransformationRoadmap data={reportData} />

            {/* --- VISUAL DASHBOARD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Gauge 
                        label="Estimated Body Fat"
                        value={reportData.body_comp.estimated_bf_percent}
                        unit="%"
                        idealMin={reportData.body_comp.bf_ideal_band[0]}
                        idealMax={reportData.body_comp.bf_ideal_band[1]}
                        status={reportData.body_comp.bf_status}
                    />
                     <Gauge 
                        label="Total Body Water"
                        value={reportData.body_comp.estimated_tbw_percent}
                        unit="%"
                        idealMin={reportData.body_comp.tbw_typical_band[0]}
                        idealMax={reportData.body_comp.tbw_typical_band[1]}
                        status={reportData.body_comp.tbw_status}
                    />
                </div>
                <div className="lg:col-span-1">
                    <NutritionTargets targets={reportData.nutrition_targets} />
                </div>
            </div>
            
            {reportData.body_comp.visual_analysis_notes && (
                <div className="mb-12 bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex gap-4">
                    <div className="p-3 bg-indigo-100 rounded-full h-fit text-indigo-600">
                        <CalendarClock size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Visual Analysis Insights</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{reportData.body_comp.visual_analysis_notes}</p>
                    </div>
                </div>
            )}
            
            <FlagsDisplay flags={reportData.flags} />
            
            <div className="prose prose-lg max-w-none text-gray-600">
                {/* Render markdown with cleaner function usage */}
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(reportData.report_markdown) }} />
            </div>

            {reportData.methodology && reportData.methodology.length > 0 && (
                 <div className="mt-16 pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2"><BookOpen className="text-lime-500 w-5 h-5"/> Methodology</h2>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <ul className="text-gray-500 text-sm list-disc list-inside space-y-2">
                            {reportData.methodology.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="mt-12 text-center text-xs text-gray-400 border-t pt-8">
                <p>Disclaimer: This AI-generated report is for informational purposes only. Consult with a healthcare professional before starting any new fitness or nutrition plan.</p>
                <p className="mt-1">© {new Date().getFullYear()} iFit. All rights reserved.</p>
            </div>
        </div>
    );
});

export default ReportContent;
