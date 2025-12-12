import dotenv from "dotenv";
import { promisify } from "util";
import { exec } from "child_process";

dotenv.config();

const execPromise = promisify(exec);

console.log("Simple Gemini API test...");

async function testGeminiAPI() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key present:", !!apiKey);
    
    // Simple curl test to the Gemini API
    const command = `curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}" -H "Content-Type: application/json" -d "{\\"contents\\":[{\\"parts\\":[{\\"text\\":\\"Say hello in one word\\"}]}]}"`;
    
    console.log("Running command:", command.substring(0, 100) + "...");
    
    const { stdout, stderr } = await execPromise(command);
    
    console.log("Response:", stdout);
    if (stderr) {
      console.log("Error:", stderr);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testGeminiAPI();