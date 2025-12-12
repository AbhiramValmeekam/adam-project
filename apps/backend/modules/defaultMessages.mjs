import { audioFileToBase64, readJsonTranscript } from "../utils/files.mjs";
import dotenv from "dotenv";
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

async function sendDefaultMessages({ userMessage }) {
  let messages;
  if (!userMessage) {
    messages = [
      {
        text: "Hello! I'm your AI assistant. What would you like to discuss today?",
        audio: await audioFileToBase64({ fileName: "audios/intro_0.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/intro_0.json" }),
        facialExpression: "smile",
        animation: "TalkingOne",
      },
      {
        text: "I can help with any topic - science, history, literature, mathematics, or anything else you're curious about.",
        audio: await audioFileToBase64({ fileName: "audios/intro_1.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/intro_1.json" }),
        facialExpression: "default",
        animation: "TalkingTwo",
      },
    ];
    return messages;
  }
  if (!geminiApiKey) {
    messages = [
      {
        text: "Please add your Gemini API key to enable my full capabilities!",
        audio: await audioFileToBase64({ fileName: "audios/api_0.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/api_0.json" }),
        facialExpression: "angry",
        animation: "TalkingThree",
      },
      {
        text: "I need a Gemini API key to provide detailed responses on any topic!",
        audio: await audioFileToBase64({ fileName: "audios/api_1.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/api_1.json" }),
        facialExpression: "smile",
        animation: "Angry",
      },
    ];
    return messages;
  }
}

const defaultResponse = [
  {
    text: "I'm sorry, there seems to be an error. Could you please repeat your question?",
    facialExpression: "sad",
    animation: "Idle",
  },
];

export { sendDefaultMessages, defaultResponse };