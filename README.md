# Chat Organizer Assignment

## Setup
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:3000

## Environment Variables
*(Note: I opted to use the Google Gemini API instead of OpenAI for its speed and native structured JSON capabilities).* Create `.env.local`:
GEMINI_API_KEY=your_key_here

## Approach
I split the conversation into semantic blocks by utilizing the `@google/genai` SDK in a Next.js API route. Instead of fragile keyword-matching heuristics, I passed the entire transcript to Gemini 2.5 Flash. 

To ensure the output perfectly matched the requirements, I used **Few-Shot Prompt Engineering**, providing the model with specific examples of "Good" (e.g., "Pricing Strategy") vs "Bad" (e.g., "Pricing") category names. To guarantee the UI wouldn't crash from improperly formatted text, I forced the model to return strict JSON using the `responseMimeType: "application/json"` configuration. Finally, for the persistence bonus point, I built a custom, typed `useLocalStorage` React hook to instantly save the categorized blocks to the user's browser without the overhead of setting up a database.

## Time Spent
Approximately 2 hours

## Future Improvements
- **Database Persistence & Auth:** Swap `localStorage` for a Supabase backend to allow users to log in, save multiple chat sessions, and access their organized blocks across different devices.
- **Dynamic Routing:** Implement unique URLs for saved chats (e.g., `/chat/[id]`) so users can easily share their organized semantic blocks with team members.
- **Sliding Window Chunking:** If users needed to ingest massive chat logs that exceed standard LLM context windows, I would implement a text-chunking pipeline to process and reduce the text in batches before final categorization.
- **Export Functionality:** Add buttons to export the semantic blocks as a PDF or formatted Markdown file.