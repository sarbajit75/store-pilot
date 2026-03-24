
import { GoogleGenAI, Type } from "@google/genai";
import { StoreData, Mission, InsightType, PeerBenchmarks } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-3-pro-preview";

const generateDynamicMissions = (storeData: StoreData, benchmarks: PeerBenchmarks): Mission[] => {
    const missions: Mission[] = [];
    
    const checkCategoryRisk = (catName: string, id: string, title: string, kpi: string, huddle: string) => {
        const storeValue = storeData.categorySales[catName] || 0;
        const peerAverage = benchmarks.categories[catName]?.sales || 0;
        const peerLeader = benchmarks.categories[catName]?.leaderSales || 0;

        if (peerAverage > 0 && storeValue < (peerAverage * 0.9)) {
            missions.push({
                id: `m-dyn-${id}`,
                title: title,
                description: `${catName} sales are trailing the peer average by ${Math.floor((1 - storeValue/peerAverage)*100)}%. Closing this gap to catch the Peer Leader would generate significant revenue.`,
                impact: `+£${Math.floor((peerAverage - storeValue) / 8)} / wk`,
                status: "NEW",
                type: InsightType.RISK,
                insightType: "Peer Gap Analysis",
                insightCategory: catName,
                kpi: kpi,
                huddleTip: huddle,
                laborReadiness: 'OPTIMAL',
                trigger: `You: £${Math.floor(storeValue)} vs Avg: £${Math.floor(peerAverage)} vs Leader: £${Math.floor(peerLeader)}.`,
                benchmark: {
                    metric: "Sales Achievement",
                    storeValue: Math.floor(storeValue),
                    peerValue: Math.floor(peerAverage),
                    leaderValue: Math.floor(peerLeader),
                    unit: "£"
                },
                steps: [
                    `Audit ${catName} stock levels immediately.`,
                    "Check promotion signage for correct pricing.",
                    "Brief team on upsell techniques."
                ]
            });
        }
    };

    checkCategoryRisk("Suncare", "1", "Suncare Revenue Recovery", "Category Sales (£)", "Remind the team to offer SPF to every customer buying holiday essentials.");
    checkCategoryRisk("Travel Health", "2", "Travel Health Services Boost", "Consultation Rev (£)", "Check if we have consultation slots open for tomorrow's shift.");
    checkCategoryRisk("Prescriptions", "3", "Core Pharmacy Growth Plan", "Item Volume", "Prioritize prescription nominations during the evening rush.");

    return missions;
};

export const generateMissionsFromData = async (storeData: StoreData, benchmarks: PeerBenchmarks): Promise<Mission[]> => {
  const dynamicMissions = generateDynamicMissions(storeData, benchmarks);

  if (!process.env.API_KEY) {
    return dynamicMissions;
  }

  const prompt = `
    You are an expert Retail Performance AI for Boots UK. 
    Analyze the ACTUAL AGGREGATED DATA provided below and identify 6 key missions.
    
    MANAGEMENT CONTEXT:
    1. PEER LEADER: Use the 'leaderSales' data to show the manager what the 'Top store' is doing.
    2. HUDDLE TIP: Provide a 1-sentence directive the manager can read to the team (e.g., "Team, focus on X today...").
    3. LABOR READINESS: Assess if the department is understaffed based on department sales vs targets.
    
    STRICT FORMATTING:
    - MISSION TITLES: Must include the specific category/product name.
    - CURRENCY: Always use '£'.
    
    Active Store Category Aggregates: ${JSON.stringify(storeData.categorySales)}
    Peer Group Benchmarks: ${JSON.stringify(benchmarks.categories)}

    Return a valid JSON array of Mission objects. Prioritize High-Margin Pharmacy and Suncare.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["NEW", "IN_PROGRESS", "COMPLETED"] },
              type: { type: Type.STRING, enum: ["RISK", "OPPORTUNITY", "INFO"] },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              insightType: { type: Type.STRING },
              insightCategory: { type: Type.STRING },
              kpi: { type: Type.STRING },
              trigger: { type: Type.STRING },
              huddleTip: { type: Type.STRING },
              laborReadiness: { type: Type.STRING, enum: ["OPTIMAL", "UNDERSTAFFED", "CRITICAL"] },
              benchmark: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  storeValue: { type: Type.NUMBER },
                  peerValue: { type: Type.NUMBER },
                  leaderValue: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              }
            },
            required: ["id", "title", "description", "impact", "status", "type", "steps", "benchmark", "huddleTip"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    return parsed.length > 0 ? parsed : dynamicMissions;
  } catch (error) {
    console.error("Gemini failed:", error);
    return dynamicMissions;
  }
};

export const chatWithStorePilot = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  currentContextJSON: string
): Promise<string> => {
  if (!process.env.API_KEY) return "AI disabled.";

  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: `You are StorePilot, an AI co-pilot for Boots UK store managers. 
        CONTEXT: ${currentContextJSON}
        
        INSTRUCTIONS:
        1. Access store performance and the list of 'activeMissions' (which are specific action plans).
        2. If the user asks about a specific mission (e.g., "What are the steps for Suncare?"), identify the relevant mission in the 'activeMissions' array and provide its specific 'steps', 'assignee', 'impact', or 'dueDate'.
        3. Always reference specific categories (Suncare, Pharmacy, etc.) and currency (£).
        4. Be professional, data-driven, and concise. Use bullet points for steps.`,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response.";
  } catch (error) {
    return "Chat error.";
  }
};
