import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// Schema for the analysis response
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief executive summary of the document's fairness and key issues.",
    },
    overallRiskScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how predatory the document is (100 being extremely predatory).",
    },
    redFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          quote: { type: Type.STRING, description: "The exact text from the document containing the issue." },
          explanation: { type: Type.STRING, description: "Why this clause is problematic or predatory." },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          legalPrinciple: { type: Type.STRING, description: "The general legal concept violated (e.g., 'Unconscionability', 'Lack of Consideration')." }
        },
        required: ["title", "quote", "explanation", "severity"],
      },
    },
  },
  required: ["summary", "redFlags", "overallRiskScore"],
};

export const analyzeDocument = async (base64Data: string, mimeType: string, userContext: string): Promise<AnalysisResult> => {
  try {
    const model = "gemini-3-pro-preview"; // Using the powerful model for reasoning
    
    const prompt = `
      You are an elite legal expert and consumer rights advocate. Your job is to protect the user from predatory bureaucracy.
      
      Analyze the attached document (which could be a contract, bill, or notice).
      The user has provided this context about their situation: "${userContext}".

      1. Identify specific clauses that are logically unfair, legally dubious, hidden in fine print, or predatory.
      2. Quote the exact text.
      3. Explain why it is a "Red Flag" using standard legal logic (e.g., ambiguity, shifting burden of proof, unreasonable fees).
      4. Assess the severity.

      Be authoritative but accessible.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 4096 }, // Leveraging thinking budget for deeper legal analysis
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateDisputeLetter = async (analysis: AnalysisResult, userContext: string): Promise<string> => {
  try {
    const model = "gemini-3-pro-preview";

    const prompt = `
      You are a senior attorney writing a formal dispute letter on behalf of a client.
      
      Client's Situation: "${userContext}"
      
      Key Issues Identified in Document:
      ${JSON.stringify(analysis.redFlags)}
      
      Task:
      Write a formal, stern, and legally grounded dispute letter.
      - Use professional formatting.
      - Cite the specific clauses (from the red flags) and explain why they are invalid or being contested.
      - Demand a specific resolution based on the user's context.
      - Keep the tone firm but polite (authoritative).
      - Do not include placeholders like "[Your Name]" if possible, just use generic placeholders like "[Sender Name]" unless the context provides one.
      
      Output ONLY the letter content in Markdown format.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    return response.text || "Failed to generate letter.";
  } catch (error) {
    console.error("Letter generation failed:", error);
    throw error;
  }
};
