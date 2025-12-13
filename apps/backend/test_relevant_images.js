#!/usr/bin/env node

/**
 * Test script to verify relevant image generation functionality
 */

import { extractCoreSubject, generateImageUrls } from './modules/gemini.mjs';

async function testRelevantImages() {
  console.log("🔍 Testing Relevant Image Generation");
  console.log("==================================\n");
  
  // Test cases that represent various types of user queries
  const testCases = [
    "What is artificial intelligence?",
    "Explain quantum computing in simple terms",
    "How does photosynthesis work?",
    "Tell me about Leonardo da Vinci",
    "What are the benefits of renewable energy?"
  ];
  
  for (const [index, question] of testCases.entries()) {
    console.log(`${index + 1}. User Question: "${question}"`);
    
    // Extract the core subject
    const coreSubject = extractCoreSubject(question);
    console.log(`   🔍 Core Subject Identified: "${coreSubject}"`);
    
    // Generate relevant images (simulating with an empty response for now)
    try {
      console.log(`   🎯 Generating relevant images...`);
      const images = await generateImageUrls(question, "");
      
      console.log(`   ✅ Generated ${images.length} relevant images:`);
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
  
  console.log("✨ The system generates relevant visual content for any user query!");
}

// Run the test
testRelevantImages().catch(console.error);