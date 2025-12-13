import { extractCoreSubject } from './modules/gemini.mjs';

// Test the enhanced core subject extraction
const testQuestions = [
  "What is photosynthesis?",
  "Explain the process of cellular respiration",
  "How does artificial intelligence work?",
  "Tell me about the history of the Roman Empire",
  "Describe the structure of a water molecule",
  "How to bake chocolate chip cookies?",
  "What are the benefits of renewable energy sources?",
  "Define quantum computing"
];

console.log("Testing enhanced core subject extraction:");
console.log("========================================");

testQuestions.forEach((question, index) => {
  const coreSubject = extractCoreSubject(question);
  console.log(`${index + 1}. Question: "${question}"`);
  console.log(`   Core Subject: "${coreSubject}"`);
  console.log("");
});