#!/usr/bin/env node

/**
 * Demonstration script for the enhanced Wikimedia API integration
 * Shows how the system extracts core subjects and fetches exactly relevant images
 */

import { extractCoreSubject, fetchWikimediaImages } from './modules/gemini.mjs';

async function demonstrateWikimediaIntegration() {
  console.log("🎨 Enhanced Wikimedia API Integration Demo");
  console.log("==========================================\n");
  
  // Sample questions that users might ask
  const sampleQuestions = [
    "What is quantum computing?",
    "Explain the process of photosynthesis",
    "How does blockchain technology work?",
    "Tell me about the Renaissance period",
    "What are the benefits of renewable energy?"
  ];
  
  for (const [index, question] of sampleQuestions.entries()) {
    console.log(`${index + 1}. User Question: "${question}"`);
    
    // Extract the core subject
    const coreSubject = extractCoreSubject(question);
    console.log(`   🔍 Core Subject Identified: "${coreSubject}"`);
    
    // Fetch exactly relevant images from Wikimedia
    try {
      console.log(`   🖼️  Fetching relevant images...`);
      const images = await fetchWikimediaImages(coreSubject, 2);
      
      console.log(`   ✅ Found ${images.length} exactly relevant images:`);
      images.forEach((image, imgIndex) => {
        console.log(`      ${imgIndex + 1}. ${image.label}`);
        console.log(`         Source: ${image.source} (${image.photographer})`);
        // Show first 50 characters of URL for brevity
        console.log(`         URL: ${image.url.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log(`   ❌ Error fetching images: ${error.message}`);
    }
    
    console.log(""); // Blank line for readability
  }
  
  console.log("✨ The system now provides exactly relevant visual context for any user query!");
}

// Run the demonstration
demonstrateWikimediaIntegration().catch(console.error);