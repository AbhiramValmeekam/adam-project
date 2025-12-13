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

// Function to generate images using Pollinations.AI (Free AI image generation)
function generateAIImage(prompt, seed = null) {
  // Pollinations.AI provides free AI-generated images based on prompts
  // Format: https://image.pollinations.ai/prompt/{prompt}?width=400&height=300&seed={seed}
  const encodedPrompt = encodeURIComponent(prompt);
  const seedParam = seed ? `&seed=${seed}` : '';
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&nologo=true${seedParam}`;
  
  return {
    url: imageUrl,
    label: prompt,
    photographer: 'AI Generated',
    source: 'pollinations.ai',
    alt: prompt
  };
}

// Function to fetch images from Wikimedia Commons API (backup)
async function fetchWikimediaImages(searchQuery, count = 2) {
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=${count}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=400`,
      {
        headers: {
          'User-Agent': 'DigitalHumanApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Wikimedia API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const images = [];
      
      for (const page of pages) {
        if (page.imageinfo && page.imageinfo[0]) {
          const imageInfo = page.imageinfo[0];
          images.push({
            url: imageInfo.thumburl || imageInfo.url,
            label: searchQuery,
            photographer: imageInfo.extmetadata?.Artist?.value || 'Wikimedia Commons',
            source: 'wikimedia',
            alt: page.title || searchQuery
          });
        }
      }
      
      if (images.length > 0) {
        console.log(`Found ${images.length} Wikimedia images for: ${searchQuery}`);
        return images;
      }
    }
    
    // No images found, return placeholder
    console.log(`No Wikimedia images found for: ${searchQuery}`);
    const timestamp = Date.now();
    return [{
      url: `https://picsum.photos/400/300?random=${timestamp}`,
      label: searchQuery,
      photographer: 'Placeholder',
      source: 'picsum'
    }];
  } catch (error) {
    console.error('Error fetching from Wikimedia:', error.message);
    // Fallback to placeholder
    const timestamp = Date.now();
    return [{
      url: `https://picsum.photos/400/300?random=${timestamp}`,
      label: searchQuery,
      photographer: 'Placeholder',
      source: 'picsum'
    }];
  }
}

// Function to fetch images from Pexels API (fallback)
async function fetchPexelsImages(searchQuery, count = 2) {
  const apiKey = process.env.PEXELS_API_KEY;
  
  // If no API key, return placeholder images with labels
  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.log('Pexels API key not configured, using placeholder images');
    const timestamp = Date.now();
    return Array.from({ length: count }, (_, i) => ({
      url: `https://picsum.photos/400/300?random=${timestamp + i}`,
      label: searchQuery,
      photographer: 'Placeholder',
      source: 'picsum'
    }));
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos.map(photo => ({
        url: photo.src.medium, // 350x350 size
        label: searchQuery,
        photographer: photo.photographer,
        source: 'pexels',
        alt: photo.alt || searchQuery
      }));
    } else {
      // No images found, return placeholder
      console.log(`No Pexels images found for: ${searchQuery}`);
      const timestamp = Date.now();
      return [{
        url: `https://picsum.photos/400/300?random=${timestamp}`,
        label: searchQuery,
        photographer: 'Placeholder',
        source: 'picsum'
      }];
    }
  } catch (error) {
    console.error('Error fetching from Pexels:', error.message);
    // Fallback to placeholder
    const timestamp = Date.now();
    return [{
      url: `https://picsum.photos/400/300?random=${timestamp}`,
      label: searchQuery,
      photographer: 'Placeholder',
      source: 'picsum'
    }];
  }
}

// Function to extract keywords and generate image data with labels
async function generateImageUrls(question, responseText) {
  // Extract the core subject from the question
  const coreSubject = extractCoreSubject(question);
  
  console.log(`Searching for images related to core subject: "${coreSubject}"`);
  
  // Use Wikimedia Commons as primary source for more reliable images
  try {
    const wikimediaImages = await fetchWikimediaImages(coreSubject, 2);
    
    // Process the images to ensure they're exactly relevant
    const processedImages = wikimediaImages.map((image, index) => ({
      url: image.url,
      label: `Exact representation of: ${coreSubject}`,
      photographer: image.photographer || 'Wikimedia Commons',
      source: image.source || 'wikimedia',
      alt: `${coreSubject} - ${image.alt || 'relevant image'}`
    }));
    
    console.log(`Found ${processedImages.length} exactly relevant images for: "${coreSubject}"`);
    return processedImages;
  } catch (error) {
    console.error("Error fetching Wikimedia images:", error.message);
    
    // Fallback to Picsum with labeled placeholders
    const timestamp = Date.now();
    return [
      {
        url: `https://picsum.photos/400/300?random=${timestamp}`,
        label: `Topic: ${coreSubject}`,
        photographer: 'Placeholder Image',
        source: 'picsum',
        alt: `Placeholder for ${coreSubject}`
      },
      {
        url: `https://picsum.photos/400/300?random=${timestamp + 1}`,
        label: `Subject: ${coreSubject}`,
        photographer: 'Placeholder Image',
        source: 'picsum',
        alt: `Placeholder for ${coreSubject}`
      }
    ];
  }
}

// Helper function to extract the exact core subject from a question
function extractCoreSubject(question) {
  // Clean and normalize the question
  let cleanQuestion = question.trim();
  
  // Remove common question prefixes
  const prefixesToRemove = [
    'what is', 'what are', 'explain', 'tell me about', 'describe', 
    'how does', 'how do', 'can you explain', 'please explain',
    'what is the', 'what are the', 'define', 'give me information about',
    'i want to know about', 'i would like to learn about',
    'show me', 'display', 'illustrate', 'demonstrate'
  ];
  
  for (const prefix of prefixesToRemove) {
    if (cleanQuestion.toLowerCase().startsWith(prefix)) {
      cleanQuestion = cleanQuestion.substring(prefix.length).trim();
      break;
    }
  }
  
  // Remove trailing punctuation
  cleanQuestion = cleanQuestion.replace(/[?!.]+$/, '').trim();
  
  // Handle "X of Y" patterns (e.g., "process of photosynthesis" -> "photosynthesis")
  const ofPattern = /^(.*)\s+of\s+(.+)$/;
  const ofMatch = cleanQuestion.match(ofPattern);
  if (ofMatch) {
    return ofMatch[2].trim(); // Return the "Y" part
  }
  
  // Handle "X in Y" patterns (e.g., "photosynthesis in plants" -> "photosynthesis")
  const inPattern = /^(.*)\s+in\s+(.+)$/;
  const inMatch = cleanQuestion.match(inPattern);
  if (inMatch) {
    return inMatch[1].trim(); // Return the "X" part
  }
  
  // Split into words
  const words = cleanQuestion.split(/\s+/);
  
  // If it's a short phrase (1-3 words), use it directly
  if (words.length <= 3) {
    return cleanQuestion;
  }
  
  // For longer phrases, try to identify the core noun phrase
  // Look for the main subject by finding key nouns
  const keyNouns = [
    'algorithm', 'process', 'system', 'technology', 'method', 'technique',
    'theory', 'concept', 'principle', 'law', 'function', 'structure',
    'mechanism', 'procedure', 'approach', 'model', 'framework', 'design',
    'architecture', 'component', 'element', 'feature', 'aspect', 'property',
    'characteristic', 'attribute', 'quality', 'trait', 'behavior', 'pattern',
    'relationship', 'connection', 'interaction', 'effect', 'impact', 'result',
    'outcome', 'benefit', 'advantage', 'disadvantage', 'limitation', 'challenge',
    'problem', 'solution', 'application', 'implementation', 'example', 'case',
    'computer', 'machine', 'device', 'engine', 'robot', 'software', 'program',
    'network', 'internet', 'web', 'database', 'server', 'cloud', 'ai', 'intelligence',
    'brain', 'mind', 'thought', 'idea', 'thought', 'philosophy', 'science',
    'mathematics', 'physics', 'chemistry', 'biology', 'medicine', 'health',
    'business', 'economics', 'finance', 'market', 'investment', 'trading',
    'history', 'culture', 'art', 'music', 'literature', 'poetry', 'writing'
  ];
  
  // Look for key nouns in the phrase
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i].toLowerCase().replace(/[^a-zA-Z]/g, '');
    if (keyNouns.includes(word)) {
      // Return the part before the key noun
      return words.slice(0, i + 1).join(' ');
    }
  }
  
  // If no key noun found, return the first 3-4 words as the core subject
  return words.slice(0, Math.min(4, words.length)).join(' ');
}

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
      
      // Add image URLs to the response
      const responseText = validatedResponse.messages.map(m => m.text).join(' ');
      validatedResponse.images = await generateImageUrls(question, responseText);
      console.log("Generated images:", validatedResponse.images);
      
      return validatedResponse;
    } catch (parseError) {
      // If parsing fails, create a default response
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response that failed to parse:", text);
      const defaultResponse = {
        messages: [
          {
            text: text || "Hello! I'm your AI assistant, ready to help with any topic you'd like to discuss.",
            facialExpression: "default",
            animation: "TalkingOne"
          }
        ]
      };
      defaultResponse.images = await generateImageUrls(question, text);
      return defaultResponse;
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

// New function for generating chat summaries
async function generateChatSummary(chatHistory) {
  try {
    console.log("Generating summary for chat history...");
    
    // Use the gemini 2.5 flash model as requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Format the chat history for the prompt
    const formattedHistory = chatHistory.map(msg => {
      const sender = msg.sender === 'user' ? 'User' : msg.sender === 'ai' ? 'AI Assistant' : 'System';
      return `${sender}: ${msg.text}`;
    }).join('\n');
    
    const summaryTemplate = `
    You are an intelligent and expressive AI assistant. Your task is to create a concise, informative summary of the conversation between a user and an AI assistant.
    
    Please follow these guidelines:
    1. Provide a clear overview of the main topics discussed
    2. Highlight any important decisions, agreements, or conclusions reached
    3. Mention any questions asked and answers provided
    4. Keep the summary concise but comprehensive
    5. Use natural language and avoid technical jargon when possible
    
    Conversation History:
    ${formattedHistory}
    
    Please provide a summary of this conversation in a natural, readable format.
    `;
    
    console.log("Sending summary prompt to Gemini...");
    const result = await model.generateContent(summaryTemplate);
    const response = await result.response;
    const summaryText = response.text();
    
    console.log("Successfully generated chat summary");
    return summaryText;
  } catch (error) {
    console.error("Error generating chat summary:", error);
    throw error;
  }
}

// New function for generating retention tests
async function generateRetentionTest(chatHistory) {
  try {
    console.log("Generating retention test based on chat history...");
    
    // Use gemini-1.5-flash for higher quota (1500 requests/day vs 20 for 2.5-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Format the chat history for the prompt
    const formattedHistory = chatHistory.map(msg => {
      const sender = msg.sender === 'user' ? 'User' : msg.sender === 'ai' ? 'AI Assistant' : 'System';
      return `${sender}: ${msg.text}`;
    }).join('\n');
    
    const retentionTestTemplate = `
    You are an intelligent and knowledgeable educator who creates comprehensive retention tests. 
    Based on the conversation history provided below, create a test that assesses the user's understanding of the material discussed.
    
    Conversation History:
    ${formattedHistory}
    
    Please follow these guidelines:
    1. Create exactly 5 multiple-choice questions
    2. Each question should have 4 options (A, B, C, D)
    3. Clearly indicate the correct answer for each question
    4. Make the questions challenging but fair, covering different aspects of the topics discussed
    5. Include a mix of question types:
       - Factual recall questions
       - Conceptual understanding questions
       - Application-based questions
    6. Provide detailed explanations for each answer
    7. Format the response as valid JSON with the following structure:
    
    {
      "testTitle": "A descriptive title for the test based on the conversation topics",
      "questions": [
        {
          "id": 1,
          "question": "Question text here",
          "options": [
            {"id": "A", "text": "Option A text"},
            {"id": "B", "text": "Option B text"},
            {"id": "C", "text": "Option C text"},
            {"id": "D", "text": "Option D text"}
          ],
          "correctAnswer": "A",
          "explanation": "Detailed explanation of why the answer is correct and why other options are incorrect",
          "topic": "The main topic this question addresses"
        }
      ]
    }
    
    Generate a comprehensive retention test based on the conversation history following this format exactly.
    `;
    
    console.log("Sending retention test prompt to Gemini...");
    const result = await model.generateContent(retentionTestTemplate);
    const response = await result.response;
    const testText = response.text();
    
    console.log("Raw Gemini retention test response:", testText.substring(0, 100) + "...");
    
    // Try to parse the JSON response
    try {
      // Extract JSON from potential markdown code blocks
      let cleanTestText = testText.trim();
      if (cleanTestText.startsWith("```json")) {
        cleanTestText = cleanTestText.substring(7);
      }
      if (cleanTestText.endsWith("```")) {
        cleanTestText = cleanTestText.substring(0, cleanTestText.length - 3);
      }
      
      const parsedTest = JSON.parse(cleanTestText);
      console.log("Successfully parsed and validated retention test");
      return parsedTest;
    } catch (parseError) {
      console.error("Error parsing retention test response:", parseError);
      console.error("Raw response that failed to parse:", testText);
      // Return a default test structure
      return {
        testTitle: "General Knowledge Test",
        questions: []
      };
    }
  } catch (error) {
    console.error("Error generating retention test:", error);
    throw error;
  }
}

// New function for generating personalized feedback
async function generatePersonalizedFeedback(testResults, chatHistory) {
  try {
    console.log("Generating personalized feedback based on test results...");
    
    // Use gemini-1.5-flash for higher quota
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Format the chat history for the prompt
    const formattedHistory = chatHistory.map(msg => {
      const sender = msg.sender === 'user' ? 'User' : msg.sender === 'ai' ? 'AI Assistant' : 'System';
      return `${sender}: ${msg.text}`;
    }).join('\n');
    
    const feedbackTemplate = `
    You are an intelligent and supportive educator who provides personalized feedback on test performance. 
    Based on the test results and conversation history provided below, give constructive feedback and specific improvement suggestions.
    
    Conversation History:
    ${formattedHistory}
    
    Test Results:
    ${JSON.stringify(testResults, null, 2)}
    
    Please provide:
    1. Overall performance assessment with a score percentage
    2. Specific areas of strength demonstrated by correct answers
    3. Detailed analysis of mistakes and misconceptions revealed by incorrect answers
    4. Personalized suggestions on how to improve in weak areas
    5. Study techniques and strategies tailored to the user's learning patterns
    6. Additional resources or topics to explore for deeper understanding
    7. Encouraging closing remarks that motivate continued learning
    
    Format your response in a natural, conversational way that would be suitable for speech by an AI avatar.
    Be specific and actionable in your suggestions, referencing the actual topics discussed in the conversation.
    `;
    
    console.log("Sending feedback prompt to Gemini...");
    const result = await model.generateContent(feedbackTemplate);
    const response = await result.response;
    const feedbackText = response.text();
    
    console.log("Successfully generated personalized feedback");
    return feedbackText;
  } catch (error) {
    console.error("Error generating personalized feedback:", error);
    throw error;
  }
}

export { generateAvatarResponse, generateChatSummary, generateRetentionTest, generatePersonalizedFeedback };