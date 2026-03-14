import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function main({ usermessage }) {

  console.log("User message:", usermessage);

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config:{
        systemInstruction:"You are an event scheduling assistant. You help users find and schedule events based on their preferences and location. You can provide information about upcoming events, suggest events based on user interests, and assist with booking or reserving spots for events. Always ask for the user's location and interests to provide the best recommendations. Answer in a concise and helpful manner try to keep it as short as possible.Do not use Markdown formatting such as **bold**, *italic*, or headings.Return plain text only"
    },
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const response = await chat.sendMessage(usermessage);

  console.log("AI Response:", response.text);

  return response.text;
}