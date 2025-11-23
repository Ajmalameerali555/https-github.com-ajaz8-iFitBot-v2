
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData, ReportData, WorkoutPlanApiResponse, PendingWorkoutPlan, ChatMessage, WorkoutGuideDraft, ExtractedReportData } from '../types';
import { workoutDatabase } from '../data/workoutDatabase';

// FIX: Per guidelines, API key must come from process.env.API_KEY, not import.meta.env.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // FIX: Updated error message to reflect the new environment variable.
  throw new Error("API_KEY environment variable is not set");
}

// Use new GoogleGenAI({apiKey: ...}) as per SDK guidelines
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates a full fitness assessment report with structured data and markdown.
 */
export const generateAssessmentReport = async (quizData: QuizData): Promise<ReportData> => {
    // Define the JSON schema for the structured part of the report
    const reportSchema = {
        type: Type.OBJECT,
        properties: {
            numbers: {
                type: Type.OBJECT,
                properties: {
                    current_maintenance_calories: { type: Type.NUMBER, description: "Calculated TDEE (Total Daily Energy Expenditure) - this is their estimated current average intake." },
                    daily_calorie_deficit_needed: { type: Type.NUMBER, description: "Mathematical deficit needed to reach target weight in target weeks (7700kcal per kg of fat)." },
                    target_intake_kcal: { type: Type.NUMBER, description: "Recommended daily intake (TDEE - Deficit). Ensure it is safe (min 1200/1500)." },
                    target_burn_per_day_activity: { type: Type.NUMBER, description: "Calories to burn via ADDED exercise (cardio/steps) to support the deficit." },
                },
            },
            timeline: {
                type: Type.OBJECT,
                properties: {
                    excess_fat_kg: { type: Type.NUMBER, description: "Difference between current weight and target weight." },
                    weeks_to_goal: { type: Type.NUMBER },
                    projected_loss_per_week_kg: { type: Type.NUMBER },
                    is_timeline_realistic: { type: Type.BOOLEAN },
                    adjusted_timeline_weeks: { type: Type.NUMBER, description: "If original timeline requires >1000kcal deficit, provide a realistic timeline (approx 0.5-1kg/week)." },
                },
            },
            nutrition_targets: {
                type: Type.OBJECT,
                properties: {
                    recommended_calories_kcal: { type: Type.NUMBER },
                    protein_g: { type: Type.NUMBER },
                    water_l: { type: Type.NUMBER },
                    carbs_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    fats_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                },
            },
            body_comp: {
                type: Type.OBJECT,
                properties: {
                    estimated_bf_percent: { type: Type.NUMBER },
                    bf_ideal_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    bf_status: { type: Type.STRING },
                    estimated_tbw_percent: { type: Type.NUMBER },
                    tbw_typical_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    tbw_status: { type: Type.STRING },
                    visual_analysis_notes: { type: Type.STRING, description: "Specific observations from image (muscle definition, posture, fat distribution) if provided." },
                },
            },
            flags: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        issue: { type: Type.STRING },
                        severity: { type: Type.STRING },
                        why: { type: Type.STRING },
                    },
                },
            },
            methodology: { type: Type.ARRAY, items: { type: Type.STRING } },
            report_markdown: { type: Type.STRING, description: "A detailed, motivational report in Markdown format explaining the math and plan." },
        },
        required: ["numbers", "timeline", "nutrition_targets", "body_comp", "flags", "methodology", "report_markdown"]
    };

    try {
        const promptText = `
            Act as an elite biometric scientist and master nutritionist.
            Your goal is to perform a high-precision analysis of the user to generate a transformation plan.

            **PART 1: THE INPUTS**
            - Weight: ${quizData.currentWeight}kg
            - Height: ${quizData.height}cm
            - Age: ${quizData.age}
            - Gender: ${quizData.gender}
            - Activity Level: ${quizData.dailyActivity}
            - Gym Frequency: ${quizData.gymDaysPerWeek} days/week
            - Goal: ${quizData.goal}
            - Target: ${quizData.targetWeight}kg in ${quizData.targetPeriodWeeks} weeks.

            **PART 2: THE MATH (Execute Step-by-Step)**
            
            1. **Calculate BMR (Mifflin-St Jeor Equation)**:
               - Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
               - Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
            
            2. **Calculate TDEE (Current Maintenance/Average Intake)**:
               - Apply Activity Multiplier to BMR:
                 - Sedentary: 1.2
                 - Lightly Active: 1.375
                 - Moderately Active: 1.55
                 - Very Active: 1.725
               *CRITICAL: This value 'current_maintenance_calories' represents their ESTIMATED CURRENT DAILY INTAKE if they are maintaining weight.*

            3. **The Gap Analysis (Excess Fat & Deficit)**:
               - 'excess_fat_kg' = Current Weight - Target Weight. (If negative/gaining muscle, set to 0).
               - Total Calorie Gap = excess_fat_kg * 7700 kcal (approx energy in 1kg fat).
               - 'daily_calorie_deficit_needed' = Total Calorie Gap / (Target Weeks * 7).

            4. **Realism Check**:
               - Max Safe Deficit: ~1000 kcal/day OR 1% of body weight/week.
               - Min Safe Intake: 1200 kcal (Women), 1500 kcal (Men).
               - If 'daily_calorie_deficit_needed' > 1000 OR (TDEE - Deficit) < Min Safe Intake:
                 - Set 'is_timeline_realistic' = FALSE.
                 - Calculate 'adjusted_timeline_weeks' based on a safe 500-750 kcal daily deficit.
                 - Re-calculate targets based on the SAFE deficit, not the requested one.

            5. **The Plan (Intake vs. Burn)**:
               - 'target_intake_kcal': TDEE - Safe Deficit.
               - 'target_burn_per_day_activity': Suggest a value (e.g., 300-500) for *additional* exercise burn to assist the deficit.
               - If Goal is Muscle Gain: Set Intake to TDEE + 250-500 surplus.

            **PART 3: IMAGE ANALYSIS (Visual Intelligence)**
            - **IF IMAGE PROVIDED:**
              - Analyze body composition. Does the user have high muscle mass? (BMI skews high for muscular individuals).
              - If muscular, INCREASE the estimated TDEE by 5-10% (muscle burns more calories).
              - Visually estimate Body Fat %. Use this for 'estimated_bf_percent' instead of generic formulas.
              - Note specific areas (e.g., "Visceral fat detected," "Good shoulder development") in 'visual_analysis_notes'.

            **PART 4: REPORT GENERATION**
            - Explain the numbers clearly: "To lose X kg in Y weeks, you need a daily gap of Z calories."
            - Break down the gap: "We recommend creating this gap through A calories less food and B calories more movement."
            - Be encouraging but strictly scientific.

            **USER DATA:**
            ${JSON.stringify(quizData, null, 2)}
        `;

        const requestParts: { text?: string; inlineData?: { mimeType: string, data: string } }[] = [{ text: promptText }];
        
        // Add image to the request if it exists
        if (quizData.bodyImage) {
            const match = quizData.bodyImage.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                requestParts.push({
                    inlineData: {
                        mimeType,
                        data: base64Data,
                    },
                });
            }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema,
            },
        });
        
        const reportData: ReportData = JSON.parse(response.text);
        return reportData;

    } catch (err) {
        console.error("Gemini API Error in generateAssessmentReport:", err);
        if (err instanceof SyntaxError) {
             throw new Error("AI_JSON_PARSE_ERROR: Failed to parse the structured report from the AI.");
        }
        return {
            report_markdown: "⚠️ # Failed to generate report.\n\nThe AI service may be temporarily unavailable or encountered an issue processing your data. Please try again later.",
            numbers: { current_maintenance_calories: 0, daily_calorie_deficit_needed: 0, target_intake_kcal: 0, target_burn_per_day_activity: 0 },
            timeline: { excess_fat_kg: 0, weeks_to_goal: 0, projected_loss_per_week_kg: 0, is_timeline_realistic: true },
            nutrition_targets: { recommended_calories_kcal: 0, protein_g: 0, water_l: 0, carbs_g_range: null, fats_g_range: null },
            body_comp: { 
                estimated_bf_percent: 0, 
                bf_ideal_band: [0, 0], 
                bf_status: "within", 
                estimated_tbw_percent: 0, 
                tbw_typical_band: [0, 0],
                tbw_status: "within",
                visual_analysis_notes: "Analysis failed." 
            },
            flags: [],
            methodology: [],
        };
    }
};

/**
 * Generates a draft workout plan as a structured JSON object.
 */
export const generateWorkoutPlan = async (reportImage: string | null, userName: string, quizData: QuizData | null): Promise<WorkoutPlanApiResponse> => {
    try {
        // --- Smart Trainer Assignment Logic ---
        const allTrainers: { name: "Athul" | "Athithiya" | "Saieel"; specialties: string[] }[] = [
            { name: "Athul", specialties: ["Weight Loss", "Lean Body"] },
            { name: "Athithiya", specialties: ["Lean Body", "Bodybuilding"] },
            { name: "Saieel", specialties: ["Weight Loss", "Bodybuilding"] },
        ];

        const goalToSpecialtyMap: Record<string, string> = {
            'lose_weight': "Weight Loss",
            'gain_muscle': "Bodybuilding",
            'get_shredded': "Lean Body",
        };

        const userGoal = quizData?.goal;
        const targetSpecialty = userGoal ? goalToSpecialtyMap[userGoal] : null;

        let assignedTrainerName: "Athul" | "Athithiya" | "Saieel";

        if (targetSpecialty) {
            const weightedPool: ("Athul" | "Athithiya" | "Saieel")[] = [];
            const specialistWeight = 5; // Specialists are 5 times more likely to be picked
            const generalistWeight = 1; // Non-specialists still have a chance

            allTrainers.forEach(trainer => {
                const weight = trainer.specialties.includes(targetSpecialty) ? specialistWeight : generalistWeight;
                for (let i = 0; i < weight; i++) {
                    weightedPool.push(trainer.name);
                }
            });

            assignedTrainerName = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        } else {
            // Fallback to simple random if no goal is specified
            const trainers = allTrainers.map(t => t.name);
            assignedTrainerName = trainers[Math.floor(Math.random() * trainers.length)];
        }
        // --- End of Smart Trainer Assignment ---

        const promptText = `
            Act as an elite AI performance coach.
            Your task is to create a comprehensive and hyper-personalized DRAFT workout plan for a client.
            This draft is for review by a human trainer.
            The output MUST be a valid JSON object matching the provided schema.

            **INSTRUCTIONS:**
            1.  **Analyze Client Data:** Review the client's name, their assessment data (if available), and the assessment report image.
            2.  **Use the Database:** Refer to the provided 'AI-Ready Workout Database' below. Select a Category and Split that best matches the client's goal and available gym days.
            3.  **Personalize the Plan:** Adapt the template from the database. You can adjust exercises, sets, reps, and conditioning to fit the client's fitness level and equipment access. DO NOT just copy the template.
            4.  **Create Training Phases:** Structure the plan into distinct phases (e.g., 'Foundation', 'Build', 'Peak'). Each phase should have a clear focus and cover specific weeks of the program. This is critical for long-term progress.
            5.  **Progression Principle:** Crucially, define a clear 'progression_principle' with a title and a simple description explaining how the client should aim to progress (e.g., adding weight, reps, or reducing rest).
            6.  **Extract Metrics:** Analyze the report image to extract key metrics if they aren't available in the JSON data.
            7.  **Handle Nulls:** For properties like 'alt_bodyweight' and 'alt_minimal' that might not have a value, return JSON null, not the string "null".

            ---
            **AI-READY WORKOUT DATABASE (Reference Only):**
            ${JSON.stringify(workoutDatabase, null, 2)}
            ---

            **CLIENT DETAILS:**
            Client Name: ${userName}
            Client Data (if available): ${JSON.stringify(quizData, null, 2)}
        `;

        const strengthExerciseSchema = {
            type: Type.OBJECT,
            properties: {
                movement: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
                rpe_or_tempo: { type: Type.STRING },
                alt_bodyweight: { type: Type.STRING },
                alt_minimal: { type: Type.STRING },
            }
        };

        const workoutDaySchema = {
            type: Type.OBJECT,
            properties: {
                day_name: { type: Type.STRING },
                warmup: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
                strength: { type: Type.ARRAY, items: strengthExerciseSchema },
                conditioning: { type: Type.OBJECT, properties: { style: { type: Type.STRING }, duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
                cooldown: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
            }
        };

        const workoutGuideDraftSchema = {
            type: Type.OBJECT,
            properties: {
                program_weeks: { type: Type.INTEGER },
                weekly_days: { type: Type.INTEGER },
                phases: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            weeks: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                            focus: { type: Type.STRING },
                        },
                    },
                },
                progression_principle: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the progression principle, e.g., 'Progressive Overload'." },
                        description: { type: Type.STRING, description: "A brief explanation of how the user should progress week to week." },
                    },
                },
                equipment_tier: { type: Type.STRING },
                days: { type: Type.ARRAY, items: workoutDaySchema },
                progression_notes: { type: Type.STRING },
                safety_notes: { type: Type.STRING },
            },
        };
        
        const fullResponseSchema = {
            type: Type.OBJECT,
            properties: {
                workout_guide_draft: workoutGuideDraftSchema,
                presentation_markdown: { type: Type.STRING, description: "A user-friendly markdown summary of the workout philosophy and a sample day for the client." },
            }
        };
        
        // FIX: Explicitly type requestParts to allow for both text and inlineData parts,
        // which prevents a TypeScript error when pushing the image part.
        const requestParts: { text?: string; inlineData?: { mimeType: string, data: string } }[] = [{ text: promptText }];
        if (reportImage) {
            const match = reportImage.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                requestParts.push({
                    inlineData: {
                        mimeType,
                        data: base64Data,
                    },
                });
            }
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: fullResponseSchema,
            },
        });

        const responseJson = JSON.parse(response.text);
        const workoutGuideDraft: WorkoutGuideDraft = responseJson.workout_guide_draft;
        const presentationMarkdown: string = responseJson.presentation_markdown;

        return {
            needs_assessment: false,
            cta_copy: null,
            assigned_trainer: { name: assignedTrainerName },
            extracted_from_report: null, // This part is not implemented yet in the prompt
            workout_guide_draft: workoutGuideDraft,
            presentation_markdown: presentationMarkdown,
            trainer_checklist: ["Confirm the plan aligns with client goals.", "Check exercise selection for safety and effectiveness.", "Verify progression logic is appropriate for the client's fitness level."],
            signature_line: `Draft by iFitBot AI for ${userName}`,
        };
    } catch (err) {
        console.error("Gemini API Error in generateWorkoutPlan:", err);
        const placeholderExtractedData: ExtractedReportData = {
            recommended_calories_kcal: null,
            current_burn_kcal: null,
            current_intake_kcal: null,
            calorie_gap_kcal: null,
            protein_target_g: null,
            water_target_l: null,
            predicted_loss_kg_per_week: null,
            weeks_to_lose_10kg: null,
            parse_notes: "AI failed to generate a plan.",
        };
        return {
            needs_assessment: false,
            cta_copy: null,
            assigned_trainer: { name: "Athul" }, // Placeholder trainer on error
            extracted_from_report: placeholderExtractedData, // Placeholder data on error
            workout_guide_draft: null,
            presentation_markdown: "# ⚠️ Generation Error\n\nSorry, the AI couldn't create your plan. This might be due to a poor quality image or high server load. Please try again with a clearer report image."
        };
    }
};


/**
 * Gets a contextual response from the AI for the trainer chatbot.
 */
export const getTrainerChatbotResponse = async (plan: PendingWorkoutPlan, chatHistory: ChatMessage[]): Promise<string> => {
    try {
        const history = chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        // The last message is the current user prompt, so we separate it.
        const userPrompt = history.pop();
        if (!userPrompt) {
            return "I'm sorry, I didn't receive a question.";
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `
                    You are iFitBot, an expert AI assistant for certified personal trainers.
                    Your role is to help the trainer refine and adjust an AI-generated workout plan before they approve it for a client.
                    The trainer is currently reviewing the plan for client: ${plan.userName}.
                    
                    Client's original assessment data:
                    ${JSON.stringify(plan.quizData, null, 2)}
                    
                    The current DRAFT workout plan is:
                    ${JSON.stringify(plan.planData.workout_guide_draft, null, 2)}
                    
                    Your task is to respond to the trainer's requests concisely and professionally. 
                    You can suggest exercise swaps, adjust durations, explain the rationale behind the plan, or modify the plan structure based on their instructions. 
                    When suggesting changes, be specific. For example, instead of "I'll add squats," say "Okay, I've replaced leg press with barbell back squats, 3 sets of 8-12 reps."
                    Always be helpful and defer to the trainer's expertise.
                `,
            },
        });

        const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
        return response.text;

    } catch (error) {
        console.error("Trainer Chatbot Error:", error);
        return "I apologize, but I encountered an error and cannot respond at this moment.";
    }
};

/**
 * Generates a personalized, encouraging note from a trainer to a client.
 */
export const generateAutoTrainerNote = async (userName: string, trainerName: string, quizData: QuizData | null): Promise<string> => {
    try {
        const prompt = `
            Act as a friendly and motivating certified personal trainer. Your name is ${trainerName}.
            You are writing a short, personal note to your new client, ${userName}, after reviewing their AI-generated workout plan.
            Your note should be encouraging, establish a human connection, and add a personal touch.
            
            **Instructions:**
            1.  Start with a warm greeting to ${userName}.
            2.  Mention that you've personally reviewed their new AI-based plan.
            3.  Based on their assessment data below, pick ONE key area for them to focus on (e.g., consistency if they are a beginner, hydration if their water intake is low, sleep if their hours are short).
            4.  Keep the tone positive and motivating.
            5.  End with an encouraging sign-off like "Let's crush it together!" or similar.
            6.  Sign off with your name, ${trainerName}.
            7.  The entire note should be about 3-4 sentences long.

            **Client's Assessment Data:**
            ${JSON.stringify(quizData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (err) {
        console.error("Gemini API Error in generateAutoTrainerNote:", err);
        // Return a safe, generic fallback note on error
        return `Hi ${userName},\n\nI've personally reviewed your AI-based assessment and tailored plan. I recommend focusing extra on consistency this week. Let's crush it together 💪\n\n– ${trainerName}`;
    }
};

/**
 * Gets a conversational response from the AI for the calorie chatbot.
 */
export const getCalorieCoachResponse = async (chatHistory: ChatMessage[]): Promise<string> => {
    try {
        const history = chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const userPrompt = history.pop();
        if (!userPrompt) {
            return "Sorry, I didn't get that. What food are you curious about?";
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `
                    You are an expert nutritionist and calorie counter named iFit Calorie Coach.
                    Your role is to provide quick, estimated nutritional information for food items.
                    
                    **Instructions:**
                    1.  When a user provides a food item, you MUST provide an estimated calorie count for a standard serving size.
                    2.  Also include a brief, simple macronutrient breakdown (Protein, Carbs, Fat).
                    3.  Be friendly, concise, and conversational. Keep your responses short and to the point (2-3 sentences max).
                    4.  If a user asks a follow-up question (e.g., "what about a larger portion?"), answer it in context.
                    5.  Do not give medical advice. Add a brief disclaimer if the user asks for health advice.
                `,
            },
        });

        const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
        return response.text;

    } catch (error) {
        console.error("Calorie Coach Chatbot Error:", error);
        return "I apologize, but I couldn't process that request right now. Please try again.";
    }
};
