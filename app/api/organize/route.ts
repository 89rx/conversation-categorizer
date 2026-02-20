import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversation } = body;

    // Basic validation
    if (!conversation || typeof conversation !== 'string') {
      return NextResponse.json(
        { error: 'A conversation string is required.' },
        { status: 400 }
      );
    }

    // The prompt instructs Gemini to act as an analyst and strictly return JSON
    const prompt = `
      You are an expert conversational analyst. I will provide you with a raw chat transcript. 
      Read the ENTIRE transcript and group the conversation into 4 to 5 distinct semantic blocks based on the topics discussed.

      Respond ONLY with a valid JSON object matching this exact schema:
      {
        "blocks": [
          {
            "category": "Topic Name (e.g., Pricing Strategy)",
            "messages": [
              "User: ...",
              "Assistant: ..."
            ]
          }
        ]
      }

      Here is the raw transcript:
      """
      ${conversation}
      """
    `;

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // This is a pro-move: forces the model to guarantee valid JSON output
        responseMimeType: "application/json", 
        temperature: 0.2, // Low temperature for more deterministic categorization
      }
    });

    const textResponse = response.text;
    
    if (!textResponse) {
      throw new Error("No text returned from Gemini");
    }

    // Parse the JSON string returned by Gemini into a TypeScript object
    const parsedData = JSON.parse(textResponse);

    // Return the categorized blocks to the frontend
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error in /api/organize:', error);
    return NextResponse.json(
      { error: 'Failed to organize conversation. Please try again.' },
      { status: 500 }
    );
  }
}