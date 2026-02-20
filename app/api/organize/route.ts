import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversation } = body;

    if (!conversation || typeof conversation !== 'string') {
      return NextResponse.json(
        { error: 'A conversation string is required.' },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert conversational analyst. I will provide you with a raw chat transcript. 
      Read the ENTIRE transcript and group the conversation into 4 to 5 distinct semantic blocks based on the topics discussed.

      CRITICAL RULE FOR CATEGORY NAMES:
      Do not use generic, single-word keywords. Category names must be highly specific, descriptive, and professional. 
      
      Examples of BAD generic categories: "Pricing", "Competitors", "Hiring", "Trials", "Numbers"
      Examples of GOOD specific categories: "Pricing Strategy", "Starting Price Points", "Competitor Analysis", "Free Trial Strategy", "Sales Team Building"

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: 0.1, 
      }
    });

    const textResponse = response.text;
    
    if (!textResponse) {
      throw new Error("No text returned from Gemini");
    }

    const parsedData = JSON.parse(textResponse);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error in /api/organize:', error);
    return NextResponse.json(
      { error: 'Failed to organize conversation. Please try again.' },
      { status: 500 }
    );
  }
}