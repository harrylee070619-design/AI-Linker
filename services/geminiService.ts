import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Project, User } from "../types";

// Initialize Gemini
// Note: In a production app, API calls should go through a backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes the match between an investor profile and a project description.
 */
export const analyzeInvestmentMatch = async (investor: User, project: Project): Promise<{ score: number; reasoning: string }> => {
  if (!process.env.API_KEY) {
    return { score: 85, reasoning: "Demo mode: API Key missing. High compatibility based on shared tags." };
  }

  const prompt = `
    Act as an investment analyst AI.
    Evaluate the compatibility between this Investor and this Project.

    Investor Profile:
    - Interests: ${investor.tags.join(', ')}
    - Bio: ${investor.bio}

    Project Details:
    - Title: ${project.title}
    - Description: ${project.description}
    - Tags: ${project.tags.join(', ')}

    Return a JSON object with:
    - score: An integer from 0 to 100 representing match likelihood.
    - reasoning: A concise 2-sentence explanation of why they match or do not match.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
          },
          required: ['score', 'reasoning'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return { score: 0, reasoning: "AI Analysis currently unavailable." };
  }
};

/**
 * Generates an enhanced pitch summary for a developer's project.
 */
export const generatePitchSummary = async (description: string, tags: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Demo mode: This is a simulated AI summary. Please configure an API Key to generate real summaries.";
  }

  const prompt = `
    You are a startup mentor. Refine the following project description into a punchy, 
    investor-ready elevator pitch (max 50 words). Focus on innovation and market potential.
    
    Description: ${description}
    Tags: ${tags.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Pitch Gen Failed:", error);
    return description.substring(0, 100) + "...";
  }
};