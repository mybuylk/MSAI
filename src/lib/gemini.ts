import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const chatModel = ai.models.generateContent;

export async function getChatResponse(
  prompt: string, 
  history: { role: 'user' | 'model', content: string }[] = [],
  imageData?: { data: string, mimeType: string },
  options: { 
    useSearch?: boolean, 
    useDeepThink?: boolean,
    personality?: 'creative' | 'balanced' | 'smart',
    responseSpeed?: 'fast' | 'balanced' | 'thorough'
  } = {}
) {
  const userParts: any[] = [{ text: prompt }];
  if (imageData) {
    userParts.push({
      inlineData: {
        data: imageData.data,
        mimeType: imageData.mimeType,
      }
    });
  }

  let systemInstruction = "You are MS AI, a premium, futuristic, and highly intelligent AI assistant. Your goal is to provide accurate, helpful, and insightful responses.";

  // Personality adjustments
  if (options.personality === 'creative') {
    systemInstruction += " Be highly creative, poetic, and imaginative in your responses. Use vivid language.";
  } else if (options.personality === 'smart') {
    systemInstruction += " Focus on maximum intelligence, precision, and technical accuracy. Use high-level vocabulary.";
  } else {
    systemInstruction += " Be professional yet approachable. Maintain a balanced and helpful tone.";
  }

  // Reasoning/Speed adjustments
  if (options.useDeepThink || options.responseSpeed === 'thorough') {
    systemInstruction += " Provide extremely detailed, analytical, and well-reasoned responses. Break down complex problems step-by-step. Be thorough and prioritize deep understanding over brevity.";
  } else if (options.responseSpeed === 'fast') {
    systemInstruction += " Prioritize conciseness and speed. Get straight to the point with minimal fluff.";
  }

  systemInstruction += " Format your output clearly using markdown where appropriate.";

  const modelConfig: any = {
    model: options.responseSpeed === 'fast' ? "gemini-2.0-flash" : "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: userParts }
    ],
    config: {
      systemInstruction: systemInstruction,
    }
  };

  if (options.useSearch) {
    modelConfig.config.tools = [{ googleSearch: {} }];
    systemInstruction += " You have access to Google Search. Use it to find real-time information and provide citations for your sources.";
  }

  const response = await ai.models.generateContent(modelConfig);
  
  return response.text;
}
