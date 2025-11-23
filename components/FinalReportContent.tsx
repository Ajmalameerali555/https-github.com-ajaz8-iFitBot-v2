
import React from 'react';
import type { PendingWorkoutPlan, StrengthExercise } from '../types';
import { User, ShieldCheck, Calendar, Dumbbell, Zap, Flame, Scale, Droplets, Target, Repeat, Layers } from 'lucide-react';

const Header = ({ plan }: { plan: PendingWorkoutPlan }) => (
    <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your iFit Personalized Program</h1>
        <p className="text-lg text-gray-600 mt-2">The First Step in Your Transformation Journey</p>
    </div>
);

const InfoBar = ({ plan }: { plan: PendingWorkoutPlan }) => {
    const approvalDate = plan.approvedAt ? new Date(plan.approvedAt).toLocaleDateString() : new Date().toLocaleDateString();
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-center">
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><User size={16} /> Client</div>
                <div className="text-gray-600 mt-1">{plan.userName}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><ShieldCheck size={16} /> Approved By</div>
                <div className="text-gray-600 mt-1">{plan.assignedTrainerName}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><Calendar size={16} /> Date</div>
                <div className="text-gray-600 mt-1">{approvalDate}</div>
            </div>
        </div>
    );
};

const Metric = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string | number | null | undefined, unit: string }) => (
    <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-lime-600 flex-shrink-0" />
        <div>
            <span className="font-semibold text-gray-800">{label}: </span>
            <span className="text-gray-600">{value ?? 'N/A'} {unit}</span>
        </div>
    </div>
);

const AssessmentRecap = ({ plan }: { plan: PendingWorkoutPlan }) => {
    const data = plan.planData.extracted_from_report;
    if (!data) return null;
    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-lime-500 pl-4 mb-4">Assessment Recap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-lime-50 border border-lime-200 rounded-lg p-6">
                <Metric icon={Target} label="Calorie Target" value={data.recommended_calories_kcal} unit="kcal"/>
                <Metric icon={Flame} label="Energy Burn (TDEE)" value={data.current_burn_kcal} unit="kcal"/>
                <Metric icon={Droplets} label="Water Target" value={data.water_target_l} unit="L"/>
                <Metric icon={Dumbbell} label="Protein Target" value={data.protein_target_g} unit="g"/>
                <Metric icon={Scale} label="Predicted Loss" value={data.predicted_loss_kg_per_week} unit="kg/week"/>
            </div>
        </div>
    );
};

const WorkoutDayCard: React.FC<{ day: any }> = ({ day }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col space-y-3 text-sm">
        <h4 className="font-bold text-gray-800 text-base">{day.day_name}</h4>
        
        <div className="text-gray-600">
            <span className="font-semibold text-gray-700">Warm-up:</span> {day.warmup.notes} ({day.warmup.duration_min} min)
        </div>

        <div className="flex-grow">
            <span className="font-semibold text-gray-700">Strength:</span>
            <div className="mt-2 text-xs">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-x-2 pb-1 border-b border-gray-300 font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Movement</div>
                    <div className="col-span-1 text-center">Sets</div>
                    <div className="col-span-3 text-left">Reps</div>
                    <div className="col-span-3 text-left">Tempo/RPE</div>
                </div>
                {/* Exercise Rows */}
                <div className="divide-y divide-gray-100">
                    {day.strength.map((ex: StrengthExercise, i: number) => (
                        <div key={i} className="grid grid-cols-12 gap-x-2 items-start py-2">
                            <div className="col-span-5 font-medium text-gray-800 leading-snug">{ex.movement}</div>
                            <div className="col-span-1 text-center text-gray-600">{ex.sets}</div>
                            <div className="col-span-3 text-gray-600 whitespace-pre-wrap leading-snug">{ex.reps}</div>
                            <div className="col-span-3 text-gray-600 whitespace-pre-wrap leading-snug">{ex.rpe_or_tempo}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-200 space-y-2 text-gray-600">
             <p><span className="font-semibold text-gray-700">Conditioning:</span> {day.conditioning.notes} ({day.conditioning.duration_min} min, {day.conditioning.style})</p>
            <p><span className="font-semibold text-gray-700">Cool-down:</span> {day.cooldown.notes} ({day.cooldown.duration_min} min)</p>
        </div>
    </div>
);


const FinalReportContent = React.forwardRef<HTMLDivElement, { plan: PendingWorkoutPlan }>(({ plan }, ref) => {
    const draft = plan.planData.workout_guide_draft;
    const approvalDate = plan.approvedAt ? new Date(plan.approvedAt).toLocaleDateString() : new Date().toLocaleDateString();
    if (!draft) return <div ref={ref} className="p-8 bg-white text-gray-800">Workout plan data not found.</div>;
    
    return (
        <div ref={ref} className="bg-white text-gray-800 p-6 sm:p-8 md:p-10 font-sans printable-area">
            <Header plan={plan} />
            <InfoBar plan={plan} />
            <AssessmentRecap plan={plan} />

            <div className="space-y-12">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-lime-500 pl-4 mb-6">Your {draft.program_weeks}-Week Workout Plan</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-100 p-3 rounded-lg text-center"><div className="font-semibold text-gray-800 flex items-center justify-center gap-1.5"><Zap size={14}/> {draft.weekly_days}</div><div className="text-xs text-gray-500 mt-1">Days/Week</div></div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center"><div className="font-semibold text-gray-800 flex items-center justify-center gap-1.5"><Dumbbell size={14}/> {draft.equipment_tier}</div><div className="text-xs text-gray-500 mt-1">Equipment</div></div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center"><div className="font-semibold text-gray-800 flex items-center justify-center gap-1.5"><Layers size={14}/> {draft.phases.length}</div><div className="text-xs text-gray-500 mt-1">Phases</div></div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center"><div className="font-semibold text-gray-800 flex items-center justify-center gap-1.5"><Repeat size={14}/> Progression</div><div className="text-xs text-gray-500 mt-1">Built-in</div></div>
                    </div>
                </div>

                <div className="space-y-10">
                    {draft.phases.map(phase => (
                        <div key={phase.name}>
                            <div className="bg-lime-100 p-3 rounded-lg mb-4">
                                <h3 className="text-xl font-bold text-lime-800">Phase: {phase.name} (Weeks {phase.weeks.join(' - ')})</h3>
                                <p className="text-gray-700 mt-1 text-sm italic">{phase.focus}</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {draft.days.map((day, index) => <WorkoutDayCard key={index} day={day} />)}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="space-y-6 pt-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Progression Notes</h3>
                        <div className="text-gray-600 mt-2 bg-gray-50 p-4 rounded-lg border text-sm">{draft.progression_notes}</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Safety Notes</h3>
                        <div className="text-gray-600 mt-2 bg-gray-50 p-4 rounded-lg border text-sm">{draft.safety_notes}</div>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-gray-50 p-4 rounded-lg text-center">
                <p className="font-semibold text-gray-700">Approved by {plan.assignedTrainerName} on {approvalDate}</p>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-500 border-t pt-6">
                <p>This program was designed by iFitBot AI and approved by your certified trainer, {plan.assignedTrainerName}.</p>
                <p className="mt-1">Disclaimer: Always consult with a healthcare professional before starting any new fitness program. Listen to your body and stop if you feel pain.</p>
            </div>
        </div>
    );
});

export default FinalReportContent;
