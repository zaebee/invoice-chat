
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InvoiceData, LeaseData, ChatMessage, LeaseStatus } from "../types";

// --- SCHEMAS ---

const invoiceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    number: { type: Type.STRING, description: "Invoice number" },
    date: { type: Type.STRING, description: "Invoice date in YYYY-MM-DD format" },
    vatRate: { type: Type.NUMBER, description: "VAT rate (0, 10, 20). Use -1 if not specified or 'Without VAT'." },
    seller: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        inn: { type: Type.STRING },
        kpp: { type: Type.STRING },
        address: { type: Type.STRING },
        bankName: { type: Type.STRING },
        bik: { type: Type.STRING },
        accountNumber: { type: Type.STRING },
        correspondentAccount: { type: Type.STRING },
      },
      required: ["name"]
    },
    buyer: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        inn: { type: Type.STRING },
        address: { type: Type.STRING },
      },
      required: ["name"]
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          price: { type: Type.NUMBER },
        },
        required: ["name", "quantity", "price"]
      }
    }
  },
  required: ["seller", "buyer", "items"]
};

const leaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reservationId: { type: Type.STRING },
    source: { type: Type.STRING },
    vehicle: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        details: { type: Type.STRING },
        plate: { type: Type.STRING }
      },
      required: ["name"]
    },
    pickup: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "YYYY-MM-DD" },
        time: { type: Type.STRING }
      }
    },
    dropoff: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "YYYY-MM-DD" },
        time: { type: Type.STRING }
      }
    },
    pricing: {
      type: Type.OBJECT,
      properties: {
        daysRegular: { type: Type.NUMBER },
        priceRegular: { type: Type.NUMBER },
        daysSeason: { type: Type.NUMBER },
        priceSeason: { type: Type.NUMBER },
        deposit: { type: Type.NUMBER },
        total: { type: Type.NUMBER },
      }
    },
    owner: {
      type: Type.OBJECT,
      properties: {
        surname: { type: Type.STRING },
        contact: { type: Type.STRING },
        address: { type: Type.STRING }
      }
    },
    renter: {
      type: Type.OBJECT,
      properties: {
        surname: { type: Type.STRING },
        contact: { type: Type.STRING },
        passport: { type: Type.STRING }
      }
    }
  },
  required: ["vehicle", "pickup", "dropoff", "pricing"]
};

const intentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      enum: ["confirm", "reject", "collect", "complete", "none"],
      description: "The suggested action for the Owner. Use 'none' if no clear action is implied."
    },
    reason: {
      type: Type.STRING,
      description: "Brief reason for the suggestion, e.g. 'Renter says they arrived'."
    }
  },
  required: ["action"]
};

// --- API HELPER ---

const getAiClient = () => {
    let apiKey = '';
    try {
        // @ts-ignore
        apiKey = process.env.API_KEY;
    } catch (e) { }

    if (!apiKey) throw new Error("API Key is missing");
    return new GoogleGenAI({ apiKey });
};

// --- PARSERS ---

export const parseInvoiceText = async (text: string): Promise<Partial<InvoiceData> | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract Russian invoice data. If field missing, leave null. Text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    const data = JSON.parse(jsonText);
    
    // Add IDs to items
    if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map((item: any) => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9)
        }));
    }
    return data as Partial<InvoiceData>;
  } catch (error) {
    console.error("Gemini Invoice Parse Error:", error);
    throw error;
  }
};

export const parseLeaseText = async (text: string): Promise<Partial<LeaseData> | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract vehicle lease agreement data. If field missing, leave null. Text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: leaseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText) as Partial<LeaseData>;
  } catch (error) {
     console.error("Gemini Lease Parse Error:", error);
     throw error;
  }
};

export const analyzeChatIntent = async (
  messages: ChatMessage[],
  status: LeaseStatus
): Promise<{ action: 'confirm' | 'reject' | 'collect' | 'complete'; reason: string } | null> => {
  try {
    const ai = getAiClient();
    
    // Filter last 10 messages for context and format as transcript
    const transcript = messages.slice(-10).map(m => {
        const role = m.senderId === 'me' ? 'Owner' : (m.senderId === 'system' ? 'System' : 'Renter');
        return `${role}: ${m.text}`;
    }).join('\n');

    const prompt = `
      You are an AI assistant for a rental business. Analyze the conversation history between Owner and Renter to suggest the next logical workflow action for the Owner.
      
      Current Lease Status: "${status}"
      
      Workflow Rules:
      1. If status is 'pending' or 'confirmation_owner':
         - Suggest 'confirm' if the Renter confirms details or asks to proceed.
         - Suggest 'reject' if the Owner/Renter decides to cancel or dates are unavailable.
      2. If status is 'confirmed':
         - Suggest 'collect' (Handover) ONLY if the Renter implies they are at the location, arrived, or ready to pick up the vehicle NOW.
      3. If status is 'collected':
         - Suggest 'complete' (Return) ONLY if the Renter implies they have returned the vehicle or finished the rental.
      
      Conversation Transcript:
      ${transcript}
      
      If the conversation strongly implies one of these actions is needed right now, suggest it. Otherwise, return 'none'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: intentSchema,
        temperature: 0, // Deterministic
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    const result = JSON.parse(jsonText);
    
    if (!result.action || result.action === 'none') return null;
    
    return result;
  } catch (error) {
    console.warn("Gemini Intent Analysis skipped/failed:", error);
    return null;
  }
};
