import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const template = `
You are an intelligent and expressive AI assistant with extensive knowledge across all subjects.
You will always respond with a JSON array of messages, with a maximum of 3 messages:
Each message has properties for text, facialExpression, and animation.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture and ThoughtfulHeadShake.

Adapt your expressions and tone based on the content of your response:
- Use "smile" for positive, friendly, or encouraging content
- Use "sad" for sympathetic, disappointed, or negative content
- Use "angry" for frustrated, upset, or critical content
- Use "surprised" for unexpected, shocking, or amazing content
- Use "funnyFace" for humorous, playful, or light-hearted content
- Use "default" for neutral, factual, or balanced content

Choose animations that match the emotional tone and content:
- "TalkingOne" for normal conversation
- "TalkingThree" for enthusiastic or energetic discussion
- "ThoughtfulHeadShake" for contemplative or analytical content
- "Surprised" for unexpected revelations
- "Angry" for strong disagreement or criticism
- "SadIdle" for empathetic or somber topics
- "DismissingGesture" for dismissive or skeptical responses

Respond in valid JSON format with the following structure:
{
  "messages": [
    {
      "text": "Text to be spoken by the AI",
      "facialExpression": "Facial expression to be used by the AI. Select from: smile, sad, angry, surprised, funnyFace, and default",
      "animation": "Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingThree, SadIdle, 
          Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake."
    }
  ]
}

Return only valid JSON with plain text values, no markdown formatting or extra text.
`;

// Schema for parsing the response
const responseSchema = z.object({
  messages: z.array(
    z.object({
      text: z.string().describe("Text to be spoken by the AI"),
      facialExpression: z
        .string()
        .describe(
          "Facial expression to be used by the AI. Select from: smile, sad, angry, surprised, funnyFace, and default"
        ),
      animation: z
        .string()
        .describe(
          `Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingThree, SadIdle, 
          Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake.`
        ),
    })
  )
});

async function generateAvatarResponse(question) {
  try {
    console.log("Processing question:", question);
    
    // Use the gemini 2.5 flash model as requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `${template}\n\nHuman: ${question}\nAI:`;
    console.log("Sending prompt to Gemini:", prompt.substring(0, 100) + "...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw Gemini response:", text.substring(0, 100) + "...");
    
    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(text);
      const validatedResponse = responseSchema.parse(parsedResponse);
      console.log("Successfully parsed and validated response");
      
      return validatedResponse;
    } catch (parseError) {
      // If parsing fails, create a default response
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response that failed to parse:", text);
      return {
        messages: [
          {
            text: text || "Hello! I'm your AI assistant, ready to help with any topic you'd like to discuss.",
            facialExpression: "default",
            animation: "TalkingOne"
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error generating response with Gemini:", error);
    
    // Handle quota exceeded error specifically
    if (error.status === 429) {
      // Return a quota exceeded message
      return {
        messages: [
          {
            text: "I'm experiencing high demand right now. Please try again in a few minutes as my quota has been temporarily reached.",
            facialExpression: "sad",
            animation: "SadIdle"
          },
          {
            text: "My AI resources are temporarily limited. Please check back soon for a full conversation!",
            facialExpression: "default",
            animation: "Idle"
          }
        ]
      };
    }
    
    // Return a default response in case of other errors
    return {
      messages: [
        {
          text: "Hello! I'm your AI assistant, ready to help with any topic you'd like to discuss.",
          facialExpression: "default",
          animation: "TalkingOne"
        }
      ]
    };
  }
}

export { generateAvatarResponse };