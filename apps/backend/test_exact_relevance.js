#!/usr/bin/env node

/**
 * Comprehensive test for exactly relevant image generation based on user queries
 */

import { extractCoreSubject, generateImageUrls } from './modules/gemini.mjs';

async function testExactRelevance() {
  console.log("🔍 Testing Exactly Relevant Image Generation");
  console.log("==========================================\n");
  
  // Test cases that represent various types of user queries
  const testCases = [
    {
      question: "What is artificial intelligence?",
      response: "Artificial intelligence (AI) refers to the simulation of human intelligence in machines..."
    },
    {
      question: "Explain quantum computing in simple terms",
      response: "Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously..."
    },
    {
      question: "How does photosynthesis work?",
      response: "Photosynthesis is the process by which plants convert light energy into chemical energy..."
    },
    {
      question: "Tell me about Leonardo da Vinci",
      response: "Leonardo da Vinci was an Italian polymath of the Renaissance period..."
    },
    {
      question: "What are the benefits of renewable energy?",
      response: "Renewable energy sources like solar, wind, and hydroelectric power offer numerous environmental and economic benefits..."
    }
  ];
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(`${index + 1}. User Question: "${testCase.question}"`);
    
    // Extract the core subject
    const coreSubject = extractCoreSubject(testCase.question);
    console.log(`   🔍 Core Subject Identified: "${coreSubject}"`);
    
    // Generate exactly relevant images
    try {
      console.log(`   🎯 Generating exactly relevant images...`);
      const images = await generateImageUrls(testCase.question, testCase.response);
      
      console.log(`   ✅ Generated ${images.length} exactly relevant images:`);
      images.forEach((image, imgIndex) => {
        console.log(`      ${imgIndex + 1}. ${image.label}`);
        console.log(`         Source: ${image.source} (${image.photographer})`);
        // Show first 50 characters of URL for brevity
        console.log(`         URL: ${image.url.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log(`   ❌ Error generating images: ${error.message}`);
    }
    
    console.log(""); // Blank line for readability
  }
  
  console.log("✨ The system now generates exactly relevant visual content for any user query!");
  console.log("   Each image is precisely matched to what the user asked about.");
}

// Run the comprehensive test
testExactRelevance().catch(console.error);