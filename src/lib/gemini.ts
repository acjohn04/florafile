import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

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

const DiagnosisSchema = z.object({
  diagnosisName: z.string(),
  severity: z.string(),
  description: z.string(),
  recoverySteps: z.array(z.string()),
});

export type PlantDiagnosis = z.infer<typeof DiagnosisSchema>;

export async function diagnosePlant(imageBase64: string, mimeType: string): Promise<PlantDiagnosis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  const prompt = `You are a plant pathologist. Diagnose the issue in this photo and return JSON with the following properties: diagnosisName, severity (low/medium/high), description (what is happening and why), recoverySteps (array of strings, each string is an actionable step to fix the problem).`;
  
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
          diagnosisName: { type: "STRING" },
          severity: { type: "STRING" },
          description: { type: "STRING" },
          recoverySteps: { 
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["diagnosisName", "severity", "description", "recoverySteps"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini.");
  
  return DiagnosisSchema.parse(JSON.parse(text));
}
