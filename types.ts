
export interface QuizData {
    id?: string;
    name: string;
    email: string;
    gender: 'male' | 'female';
    age: number;
    currentWeight: number;
    height: number;
    waistCm?: number;
    goal: 'lose_weight' | 'gain_muscle' | 'get_shredded';
    targetWeight: number;
    targetPeriodWeeks: number;
    bodyImage?: string;
    dailyActivity: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    avgStepsPerDay?: number;
    sittingHoursPerDay?: number;
    fitnessLevel: 'beginner' | 'amateur' | 'advanced';
    gymDaysPerWeek: number;
    minutesPerSession?: number;
    workoutLocation: 'home' | 'gym' | 'both';
    sleepHours: 'less_than_5' | '5_to_6' | '7_to_8' | 'more_than_8';
    stressLevel: 'low' | 'moderate' | 'high';
    waterIntakeLiters: number;
    junkMealsPerWeek: number;
    sugaryDrinksPerDay: number;
    eveningHunger: 'light' | 'normal' | 'heavy' | 'order_outside';
    dietType: 'balanced' | 'low_carb' | 'vegetarian' | 'vegan' | 'other';
    motivation: string;
}

export interface Flag {
    issue: string;
    severity: "low" | "medium" | "high";
    why: string;
}

export interface ReportData {
    numbers: {
        current_maintenance_calories: number; 
        daily_calorie_deficit_needed: number;
        target_intake_kcal: number;
        target_burn_per_day_activity: number; 
    };
    timeline: {
        excess_fat_kg: number;
        weeks_to_goal: number;
        projected_loss_per_week_kg: number;
        is_timeline_realistic: boolean;
        adjusted_timeline_weeks?: number; 
    };
    nutrition_targets: {
        recommended_calories_kcal: number;
        protein_g: number;
        water_l: number;
        carbs_g_range: [number, number] | null;
        fats_g_range: [number, number] | null;
    };
    body_comp: {
        estimated_bf_percent: number;
        bf_ideal_band: [number, number];
        bf_status: "below" | "within" | "above";
        visual_analysis_notes?: string; 
        estimated_tbw_percent: number;
        tbw_typical_band: [number, number];
        tbw_status: "below" | "within" | "above";
    };
    flags: Flag[];
    methodology: string[];
    report_markdown: string;
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    instructions: string;
}

export interface Workout {
    day: number;
    title: string;
    estimated_duration: number;
    warmup: string;
    exercises: Exercise[];
    cooldown: string;
}

export interface WeeklyWorkout {
    week: number;
    workouts: Workout[];
}

export interface WorkoutPlan {
    userName: string;
    title: string;
    description: string;
    duration_weeks: number;
    progression_principle: {
        title: string;
        description: string;
    };
    weekly_workouts: WeeklyWorkout[];
}

export interface Variation {
  name: string;
  description: string;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
export type Equipment = 'Bodyweight' | 'Dumbbells' | 'Barbell' | 'Kettlebell' | 'Resistance Bands';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LibraryExercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  videoUrl?: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  variations?: Variation[];
}

export interface AssignedTrainer {
    name: "Athul" | "Athithiya" | "Saieel";
}

export interface ExtractedReportData {
    recommended_calories_kcal: number | null;
    current_burn_kcal: number | null;
    current_intake_kcal: number | null;
    calorie_gap_kcal: number | null;
    protein_target_g: number | null;
    water_target_l: number | null;
    predicted_loss_kg_per_week: number | null;
    weeks_to_lose_10kg: number | null;
    parse_notes: string;
}

export interface WorkoutPhase {
    name: "Foundation" | "Build" | "Peak";
    weeks: [number, number];
    focus: string;
}

export interface StrengthExercise {
    movement: string;
    sets: number;
    reps: string;
    rpe_or_tempo: string;
    alt_bodyweight: string | null;
    alt_minimal: string | null;
}

export interface WorkoutDay {
    day_name: string;
    warmup: { duration_min: number; notes: string };
    strength: StrengthExercise[];
    conditioning: { style: "steady" | "interval"; duration_min: number; notes: string };
    cooldown: { duration_min: number; notes: string };
}

export interface WorkoutGuideDraft {
    program_weeks: number;
    weekly_days: number;
    phases: WorkoutPhase[];
    progression_principle: {
        title: string;
        description: string;
    };
    equipment_tier: "bodyweight" | "minimal" | "full";
    days: WorkoutDay[];
    progression_notes: string;
    safety_notes: string;
}

export interface WorkoutPlanApiResponse {
    needs_assessment: boolean;
    cta_copy: { title: string; subtitle: string; button_label: string } | null;
    assigned_trainer: AssignedTrainer | null;
    extracted_from_report: ExtractedReportData | null;
    workout_guide_draft: WorkoutGuideDraft | null;
    presentation_markdown: string;
    trainer_checklist?: string[];
    signature_line?: string;
}

export interface PendingWorkoutPlan {
    id: string; 
    userEmail: string; 
    userName: string;
    assignedTrainerName: "Athul" | "Athithiya" | "Saieel";
    status: 'pending' | 'approved' | 'rejected';
    generatedAt: string; 
    approvedAt?: string; 
    planData: WorkoutPlanApiResponse;
    quizData: QuizData | null; 
    trainerNotes?: string; 
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface WeightEntry {
  date: string; 
  weight: number;
}

export interface PersonalRecordEntry {
  id: string; 
  date: string; 
  exercise: string;
  value: string; 
}

export interface UserProgress {
  weightLog: WeightEntry[];
  personalRecords: PersonalRecordEntry[];
}

export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserProfile extends FirebaseUser {
  createdAt: string; 
  latestQuizData?: QuizData;
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
