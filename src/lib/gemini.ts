import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3.1-flash-lite";

const IdentificationSchema = z.object({
  commonName: z.string(),
  scientificName: z.string(),
  light: z.string(),
  water: z.string(),
  toxicity: z.string(),
  careLevel: z.string(),
  description: z.string(),
});

export type PlantIdentification = z.infer<typeof IdentificationSchema>;

export async function identifyPlant(imageBase64: string, mimeType: string): Promise<PlantIdentification> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  const prompt = `You are a botanist. Identify this plant and return JSON with the following properties: commonName, scientificName, light (requirements), water (frequency), toxicity (e.g. toxic to pets), careLevel (e.g. Beginner friendly), description (brief).`;
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          commonName: { type: "STRING" },
          scientificName: { type: "STRING" },
          light: { type: "STRING" },
          water: { type: "STRING" },
          toxicity: { type: "STRING" },
          careLevel: { type: "STRING" },
          description: { type: "STRING" }
        },
        required: ["commonName", "scientificName", "light", "water", "toxicity", "careLevel", "description"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini.");
  
  return IdentificationSchema.parse(JSON.parse(text));
}

/**
 * Diagnosis result from Gemini AI.
 * `status` is "healthy" when no issues are found, "sick" otherwise.
 * When healthy, diagnosisName will be "Healthy" and recoverySteps will be empty.
 */
const DiagnosisSchema = z.object({
  status: z.string(),
  diagnosisName: z.string(),
  severity: z.string(),
  description: z.string(),
  recoverySteps: z.array(z.string()),
});

export type PlantDiagnosis = z.infer<typeof DiagnosisSchema>;

/**
 * Analyze a plant image for health issues.
 * Returns a diagnosis with status "healthy" or "sick".
 */
export async function diagnosePlant(imageBase64: string, mimeType: string): Promise<PlantDiagnosis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  const prompt = `You are a plant pathologist. Analyze this plant photo carefully.

If the plant appears healthy with no visible issues, return:
- status: "healthy"
- diagnosisName: "Healthy"
- severity: "none"
- description: a brief note that the plant looks healthy
- recoverySteps: empty array

If the plant has visible health issues (disease, pests, nutrient deficiency, overwatering, underwatering, sun damage, etc.), return:
- status: "sick"
- diagnosisName: the name of the condition
- severity: "low", "medium", or "high"
- description: what is happening and why
- recoverySteps: array of actionable steps to fix the problem

Return JSON with properties: status, diagnosisName, severity, description, recoverySteps.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          status: { type: "STRING" },
          diagnosisName: { type: "STRING" },
          severity: { type: "STRING" },
          description: { type: "STRING" },
          recoverySteps: { 
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["status", "diagnosisName", "severity", "description", "recoverySteps"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini.");
  
  return DiagnosisSchema.parse(JSON.parse(text));
}

const ScheduleTaskSchema = z.object({
  label: z.string(),
  description: z.string(),
  dateStr: z.string(), // YYYY-MM-DD format
});

export type ScheduleTask = z.infer<typeof ScheduleTaskSchema>;

export async function generateCareSchedule(plants: any[], startDate: Date): Promise<ScheduleTask[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  const prompt = `You are a master gardener. Generate a 3-month care schedule for these plants.
Today is ${startDate.toISOString().split('T')[0]}.
The schedule should space out tasks so the owner isn't overwhelmed on any single day.
Consider the 'water' frequency and 'careLevel' for each plant.

Plants:
${JSON.stringify(plants.map(p => ({
  name: p.nickname || p.commonName,
  water: p.water,
  careLevel: p.careLevel,
  room: p.room
})), null, 2)}

Return a JSON array of tasks. Each task must have:
- label: e.g. "Water Monstera"
- description: e.g. "Check top 2 inches of soil first."
- dateStr: exact date in YYYY-MM-DD format
Limit to max 50 events total to keep the calendar clean.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            label: { type: "STRING" },
            description: { type: "STRING" },
            dateStr: { type: "STRING" }
          },
          required: ["label", "description", "dateStr"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini.");
  
  const parsed = JSON.parse(text);
  return z.array(ScheduleTaskSchema).parse(parsed);
}
