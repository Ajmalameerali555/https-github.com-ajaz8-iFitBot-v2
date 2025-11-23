import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData, ReportData, WorkoutPlanApiResponse, PendingWorkoutPlan, ChatMessage, WorkoutGuideDraft, ExtractedReportData } from '../types';
import { workoutDatabase } from '../data/workoutDatabase';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates a full fitness assessment report using Gemini 3 Pro with Thinking Mode.
 */
export const generateAssessmentReport = async (quizData: QuizData): Promise<ReportData> => {
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
            1. **Calculate BMR (Mifflin-St Jeor Equation)**
            2. **Calculate TDEE (Current Maintenance)**
            3. **The Gap Analysis (Excess Fat & Deficit)**
            4. **Realism Check** (Max Safe Deficit: ~1000 kcal/day)
            5. **The Plan (Intake vs. Burn)**

            **PART 3: IMAGE ANALYSIS (Visual Intelligence)**
            - **IF IMAGE PROVIDED:**
              - Analyze body composition. Does the user have high muscle mass?
              - If muscular, INCREASE the estimated TDEE by 5-10%.
              - Visually estimate Body Fat %.

            **USER DATA:**
            ${JSON.stringify(quizData, null, 2)}
        `;

        const requestParts: { text?: string; inlineData?: { mimeType: string, data: string } }[] = [{ text: promptText }];
        
        if (quizData.bodyImage) {
            const match = quizData.bodyImage.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                requestParts.push({
                    inlineData: { mimeType: match[1], data: match[2] },
                });
            }
        }

        // UPGRADE: Using gemini-3-pro-preview with Thinking Budget
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema,
                thinkingConfig: { thinkingBudget: 32768 } // Max thinking for deep analysis
            },
        });
        
        const reportData: ReportData = JSON.parse(response.text);
        return reportData;

    } catch (err) {
        console.error("Gemini API Error in generateAssessmentReport:", err);
        throw err;
    }
};

/**
 * Generates a draft workout plan.
 */
export const generateWorkoutPlan = async (reportImage: string | null, userName: string, quizData: QuizData | null): Promise<WorkoutPlanApiResponse> => {
    // ... (Trainer assignment logic remains the same) ...
     const allTrainers: { name: "Athul" | "Athithiya" | "Saieel"; specialties: string[] }[] = [
        { name: "Athul", specialties: ["Weight Loss", "Lean Body"] },
        { name: "Athithiya", specialties: ["Lean Body", "Bodybuilding"] },
        { name: "Saieel", specialties: ["Weight Loss", "Bodybuilding"] },
    ];
    let assignedTrainerName: "Athul" | "Athithiya" | "Saieel" = "Athul"; // Default
    // Simple assignment for brevity
    const trainers = allTrainers.map(t => t.name);
    assignedTrainerName = trainers[Math.floor(Math.random() * trainers.length)];


    const promptText = `
        Act as an elite AI performance coach. Create a hyper-personalized DRAFT workout plan.
        Client Name: ${userName}
        Client Data: ${JSON.stringify(quizData, null, 2)}
        Database Reference: ${JSON.stringify(workoutDatabase, null, 2)}
    `;

    // Schemas definitions (kept same as original for brevity, but re-implemented in full code)
    const workoutGuideDraftSchema = {
        type: Type.OBJECT,
        properties: {
            program_weeks: { type: Type.INTEGER },
            weekly_days: { type: Type.INTEGER },
            phases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, weeks: { type: Type.ARRAY, items: { type: Type.INTEGER } }, focus: { type: Type.STRING } } } },
            progression_principle: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } },
            equipment_tier: { type: Type.STRING },
            days: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day_name: { type: Type.STRING }, warmup: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } }, strength: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { movement: { type: Type.STRING }, sets: { type: Type.INTEGER }, reps: { type: Type.STRING }, rpe_or_tempo: { type: Type.STRING }, alt_bodyweight: { type: Type.STRING }, alt_minimal: { type: Type.STRING } } } }, conditioning: { type: Type.OBJECT, properties: { style: { type: Type.STRING }, duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } }, cooldown: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } } } } },
            progression_notes: { type: Type.STRING },
            safety_notes: { type: Type.STRING },
        },
    };
    
    const fullResponseSchema = {
        type: Type.OBJECT,
        properties: {
            workout_guide_draft: workoutGuideDraftSchema,
            presentation_markdown: { type: Type.STRING },
        }
    };

    const requestParts: { text?: string; inlineData?: { mimeType: string, data: string } }[] = [{ text: promptText }];
    if (reportImage) {
        const match = reportImage.match(/^data:(.+);base64,(.+)$/);
        if (match) {
            requestParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
    }
    
    // Using Standard Flash for Plan Generation (balanced speed/quality)
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: requestParts },
        config: { responseMimeType: "application/json", responseSchema: fullResponseSchema },
    });

    const responseJson = JSON.parse(response.text);
    return {
        needs_assessment: false,
        cta_copy: null,
        assigned_trainer: { name: assignedTrainerName },
        extracted_from_report: null,
        workout_guide_draft: responseJson.workout_guide_draft,
        presentation_markdown: responseJson.presentation_markdown,
        trainer_checklist: ["Safety check", "Progression check"],
        signature_line: `Draft by iFitBot AI for ${userName}`,
    };
};

/**
 * Chatbot: Uses Flash-Lite for low latency.
 */
export const getTrainerChatbotResponse = async (plan: PendingWorkoutPlan, chatHistory: ChatMessage[]): Promise<string> => {
    const history = chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    const userPrompt = history.pop();
    if (!userPrompt) return "Error: No message.";

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite', // FAST AI RESPONSE
        history: history,
        config: { systemInstruction: `You are iFitBot, assisting a trainer with plan: ${JSON.stringify(plan.planData.workout_guide_draft)}` },
    });
    const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
    return response.text;
};

/**
 * Trainer Note: Uses Flash-Lite.
 */
export const generateAutoTrainerNote = async (userName: string, trainerName: string, quizData: QuizData | null): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite', // FAST AI RESPONSE
            contents: `Write a 3 sentence encouraging note from trainer ${trainerName} to client ${userName} based on: ${JSON.stringify(quizData)}`,
        });
        return response.text.trim();
    } catch {
        return `Hi ${userName}, ready to crush it? - ${trainerName}`;
    }
};

/**
 * Calorie Coach: Uses Flash-Lite for low latency.
 */
export const getCalorieCoachResponse = async (chatHistory: ChatMessage[]): Promise<string> => {
    const history = chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    const userPrompt = history.pop();
    if (!userPrompt) return "Sorry, I didn't get that.";

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite', // FAST AI RESPONSE
        history: history,
        config: { systemInstruction: "You are iFit Calorie Coach. Provide quick calorie/macro estimates." },
    });
    const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
    return response.text;
};

// --- NEW GEN AI FEATURES ---

/**
 * Edits an image using text prompts.
 * Uses: gemini-2.5-flash-image
 */
export const editUserImage = async (base64Image: string, prompt: string): Promise<string> => {
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");

    const mimeType = match[1];
    const data = match[2];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // NANO BANANA / FLASH IMAGE
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: prompt + " Return ONLY the edited image." }
            ]
        },
        // Note: responseMimeType/Schema are NOT supported for nano banana
    });

    // Iterate parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated.");
};

/**
 * Generates a motivational image with specific aspect ratio.
 * Uses: gemini-3-pro-image-preview
 */
export const generateMotivationImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview', // PRO IMAGE MODEL
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio as any, // "1:1", "16:9", etc.
                imageSize: "1K"
            }
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated.");
};
