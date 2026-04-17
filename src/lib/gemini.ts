import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface EmailAnalysis {
  score: number; // 0 to 100, where 100 is safe
  status: "safe" | "suspicious" | "fraud" | "verified";
  senderInfo: {
    email: string;
    domain: string;
    isVerified: boolean;
    reputation: string;
  };
  indicators: {
    label: string;
    severity: "low" | "medium" | "high";
    description: string;
  }[];
  verdict: string;
  recommendation: string;
}

export async function analyzeEmail(content: string, headers?: string): Promise<EmailAnalysis> {
  const prompt = `
    Analyze the following email content and headers for security risks, phishing attempts, and fraud.
    
    EMAIL CONTENT:
    ${content}
    
    EMAIL HEADERS:
    ${headers || "No headers provided"}
    
    Provide a detailed security assessment in JSON format.
    Include a safety score (0-100), a status (safe, suspicious, fraud, verified), 
    sender information, specific security indicators (like urgency, suspicious links, spoofed domains), 
    a final verdict, and a recommendation for the user.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["safe", "suspicious", "fraud", "verified"] },
          senderInfo: {
            type: Type.OBJECT,
            properties: {
              email: { type: Type.STRING },
              domain: { type: Type.STRING },
              isVerified: { type: Type.BOOLEAN },
              reputation: { type: Type.STRING }
            },
            required: ["email", "domain", "isVerified", "reputation"]
          },
          indicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                description: { type: Type.STRING }
              },
              required: ["label", "severity", "description"]
            }
          },
          verdict: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["score", "status", "senderInfo", "indicators", "verdict", "recommendation"]
      }
    }
  });

  return JSON.parse(response.text);
}
