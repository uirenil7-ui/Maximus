import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, PostureResult, SimulationResult, NutritionResult, VocalResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3-flash-preview";

export async function analyzeFacialFeatures(image: string): Promise<ScanResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: "Analyze this candidate for the Maximus Elitist program. Provide scores (0-100) for Symmetry, Jawline, Skin, and Eyes. Reference specific visual cues. Provide detailed explanations, comprehensive feedback, actionable recommendations, an improvement plan, a daily insight, and recommended skincare ingredients. Return strictly as JSON." },
      { inlineData: { mimeType: "image/jpeg", data: image } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              symmetry: { type: Type.NUMBER },
              jawline: { type: Type.NUMBER },
              skin: { type: Type.NUMBER },
              eyes: { type: Type.NUMBER },
              overall: { type: Type.NUMBER }
            },
            required: ["symmetry", "jawline", "skin", "eyes", "overall"]
          },
          scoreExplanations: {
            type: Type.OBJECT,
            properties: {
              symmetry: { type: Type.STRING },
              jawline: { type: Type.STRING },
              skin: { type: Type.STRING },
              eyes: { type: Type.STRING }
            },
            required: ["symmetry", "jawline", "skin", "eyes"]
          },
          feedback: {
            type: Type.STRING
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          improvementPlan: {
            type: Type.OBJECT,
            properties: {
              daily: { type: Type.ARRAY, items: { type: Type.STRING } },
              weekly: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifestyle: { type: Type.ARRAY, items: { type: Type.STRING } },
              groomingAdvice: { type: Type.STRING }
            },
            required: ["daily", "weekly", "lifestyle", "groomingAdvice"]
          },
          dailyInsight: {
            type: Type.STRING
          },
          recommendedIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["scores", "scoreExplanations", "feedback", "recommendations", "improvementPlan", "dailyInsight", "recommendedIngredients"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzePosture(image: string): Promise<PostureResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: "Analyze the candidate's posture for head tilt, shoulder alignment, and spine neutrality. Return strictly as JSON." },
      { inlineData: { mimeType: "image/jpeg", data: image } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              headPosture: { type: Type.NUMBER },
              shoulderAlignment: { type: Type.NUMBER },
              spineNeutrality: { type: Type.NUMBER },
              overall: { type: Type.NUMBER }
            },
            required: ["headPosture", "shoulderAlignment", "spineNeutrality", "overall"]
          },
          feedback: { type: Type.STRING },
          remedies: { type: Type.ARRAY, items: { type: Type.STRING } },
          mewingTechnique: { type: Type.STRING }
        },
        required: ["scores", "feedback", "remedies", "mewingTechnique"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function simulateAesthetics(image: string): Promise<SimulationResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: "Recommend optimal hairstyles and beards based on face shape. Return strictly as JSON." },
      { inlineData: { mimeType: "image/jpeg", data: image } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faceShape: { type: Type.STRING },
          recommendedHairstyles: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedBeards: { type: Type.ARRAY, items: { type: Type.STRING } },
          logic: { type: Type.STRING }
        },
        required: ["faceShape", "recommendedHairstyles", "recommendedBeards", "logic"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeNutrition(image: string): Promise<NutritionResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: "Analyze this meal photo for sodium, hydration, and facial bloating impact. Return strictly as JSON." },
      { inlineData: { mimeType: "image/jpeg", data: image } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bloatRisk: { type: Type.STRING },
          sodiumLevel: { type: Type.STRING },
          hydrationImpact: { type: Type.STRING },
          aestheticsAdvice: { type: Type.STRING }
        },
        required: ["bloatRisk", "sodiumLevel", "hydrationImpact", "aestheticsAdvice"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeVocalResonance(audio: string): Promise<VocalResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: "Analyze this vocal clip for pitch, resonance, and tonality. Provide an Aura Boost score and exercises for a more dominant voice. Return strictly as JSON." },
      { inlineData: { mimeType: "audio/wav", data: audio } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pitch: { type: Type.NUMBER },
          resonance: { type: Type.STRING },
          tonality: { type: Type.STRING },
          auraBoost: { type: Type.NUMBER },
          exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["pitch", "resonance", "tonality", "auraBoost", "exercises"]
      }
    }
  });

  return JSON.parse(response.text);
}
