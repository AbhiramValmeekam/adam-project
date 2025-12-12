import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing Gemini API key...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function testGemini() {
  try {
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    
    // Try the Gemini 2.5 Flash model
    console.log("Trying model: gemini-2.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Test the model with a simple prompt
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    console.log(`✅ Success with gemini-2.5-flash: ${text}`);
  } catch (error) {
    console.error("❌ Error with Gemini API:", error.message);
    console.error("Full error:", error);
    
    // Try other common models as fallback
    const fallbackModels = ["gemini-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
    
    for (const modelName of fallbackModels) {
      try {
        console.log(`Trying fallback model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Success with ${modelName}: ${text}`);
        return;
      } catch (fallbackError) {
        console.log(`❌ Failed with ${modelName}: ${fallbackError.message.split('.')[0]}`);
      }
    }
  }
}

testGemini();