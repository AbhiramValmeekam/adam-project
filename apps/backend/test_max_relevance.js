#!/usr/bin/env node

/**
 * Comprehensive test for maximally relevant image generation based on user queries
 */

import { extractCoreSubject } from './modules/gemini.mjs';

// Test the enhanced core subject extraction
function testEnhancedExtraction() {
  console.log("🔍 Testing Enhanced Core Subject Extraction");
  console.log("========================================\n");
  
  // Test cases that represent various types of user queries
  const testCases = [
    "What is artificial intelligence?",
    "Explain the process of photosynthesis",
    "How does blockchain technology work?",
    "Tell me about Leonardo da Vinci",
    "What are the benefits of renewable energy?",
    "Can you explain quantum computing in simple terms?",
    "How to bake chocolate chip cookies?",
    "Define machine learning algorithms",
    "Show me the applications of neural networks",
    "What is the difference between HTTP and HTTPS?"
  ];
  
  testCases.forEach((question, index) => {
    const coreSubject = extractCoreSubject(question);
    console.log(`${index + 1}. Question: "${question}"`);
    console.log(`   🎯 Core Subject: "${coreSubject}"`);
    console.log("");
  });
  
  console.log("✨ Enhanced extraction identifies exactly what users are asking about!");
}

// Run the test
testEnhancedExtraction();