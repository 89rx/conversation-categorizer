import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function testConnection() {
  console.log("Testing Gemini API connection...");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with exactly: "Connection successful! Gemini is ready."'
    });
    
    console.log("\n✅ Success!");
    console.log("Response:", response.text);
  } catch (error) {
    console.error("\n❌ Error connecting to Gemini:");
    console.error(error.message);
  }
}

testConnection();