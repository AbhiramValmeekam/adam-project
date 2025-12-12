import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing different Gemini models...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function testModels() {
  try {
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    
    // Commonly available models
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-pro",
      "gemini-pro-vision",
      "models/gemini-pro",
      "models/gemini-1.0-pro"
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Say hello in one word";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Success with ${modelName}: ${text}`);
        return modelName; // Return the first working model
      } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.message.split('.')[0]}`);
      }
    }
    
    console.log("\nNo models worked. Please check your API key and region restrictions.");
  } catch (error) {
    console.error("❌ Error testing models:", error.message);
    console.error("Error details:", error);
  }
}

testModels();