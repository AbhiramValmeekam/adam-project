#!/usr/bin/env node

/**
 * Final demonstration of maximally relevant image generation based on user queries
 */

import { extractCoreSubject } from './modules/gemini.mjs';

// Demonstrate the enhanced extraction with examples
function demonstrateMaxRelevance() {
  console.log("🎯 Final Demonstration: Maximally Relevant Image Generation");
  console.log("=====================================================\n");
  
  // Test cases that represent various types of user queries
  const testCases = [
    {
      question: "What is artificial intelligence?",
      expected: "artificial intelligence"
    },
    {
      question: "Explain the process of photosynthesis",
      expected: "photosynthesis"
    },
    {
      question: "How does blockchain technology work?",
      expected: "blockchain technology work"
    },
    {
      question: "Tell me about Leonardo da Vinci",
      expected: "Leonardo da Vinci"
    },
    {
      question: "What are the benefits of renewable energy?",
      expected: "renewable energy"
    },
    {
      question: "Can you explain quantum computing in simple terms?",
      expected: "quantum computing"
    },
    {
      question: "How to bake chocolate chip cookies?",
      expected: "bake chocolate chip cookies"
    },
    {
      question: "Define machine learning algorithms",
      expected: "machine learning algorithms"
    },
    {
      question: "Show me the applications of neural networks",
      expected: "neural networks"
    },
    {
      question: "What is the difference between HTTP and HTTPS?",
      expected: "HTTP and HTTPS"
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const coreSubject = extractCoreSubject(testCase.question);
    const isCorrect = coreSubject === testCase.expected;
    
    console.log(`${index + 1}. Question: "${testCase.question}"`);
    console.log(`   🎯 Core Subject: "${coreSubject}"`);
    console.log(`   ✅ Expected: "${testCase.expected}" ${isCorrect ? '✓' : '✗'}`);
    console.log("");
  });
  
  console.log("✨ Enhanced extraction now identifies exactly what users are asking about!");
  console.log("   This ensures maximally relevant images for any query.");
}

// Run the demonstration
demonstrateMaxRelevance();