#!/usr/bin/env node

/**
 * Debug the "how to" pattern issue
 */

function debugHowTo(question) {
  console.log(`Question: "${question}"`);
  
  // Clean and normalize the question
  let cleanQuestion = question.trim();
  console.log(`Clean question: "${cleanQuestion}"`);
  
  // Remove common question prefixes more aggressively
  const prefixesToRemove = [
    'what is', 'what are', 'explain', 'tell me about', 'describe', 
    'how does', 'how do', 'can you explain', 'please explain',
    'what is the', 'what are the', 'define', 'give me information about',
    'i want to know about', 'i would like to learn about',
    'show me', 'display', 'illustrate', 'demonstrate', 'tell me',
    'can you tell me about', 'could you explain', 'would you mind explaining'
  ];
  
  // Sort prefixes by length (descending) to remove longer ones first
  prefixesToRemove.sort((a, b) => b.length - a.length);
  
  for (const prefix of prefixesToRemove) {
    if (cleanQuestion.toLowerCase().startsWith(prefix)) {
      cleanQuestion = cleanQuestion.substring(prefix.length).trim();
      console.log(`Removed prefix "${prefix}", remaining: "${cleanQuestion}"`);
      break;
    }
  }
  
  // Handle "how to X" patterns first (e.g., "how to bake bread" -> "baking")
  console.log(`Checking if starts with "how to ": ${cleanQuestion.toLowerCase().startsWith('how to ')}`);
  if (cleanQuestion.toLowerCase().startsWith('how to ')) {
    const action = cleanQuestion.substring(7).trim(); // Remove "how to "
    console.log(`Action extracted: "${action}"`);
    
    // Handle common actions with predefined conversions
    const actionMap = {
      'bake': 'baking',
      'cook': 'cooking',
      'write': 'writing',
      'read': 'reading',
      'run': 'running',
      'swim': 'swimming',
      'dance': 'dancing',
      'sing': 'singing',
      'draw': 'drawing',
      'paint': 'painting',
      'build': 'building',
      'create': 'creating',
      'make': 'making',
      'fix': 'fixing',
      'repair': 'repairing',
      'learn': 'learning',
      'teach': 'teaching',
      'study': 'studying'
    };
    
    const lowerAction = action.toLowerCase();
    console.log(`Lower action: "${lowerAction}"`);
    if (actionMap[lowerAction]) {
      console.log(`Found in action map: ${actionMap[lowerAction]}`);
      return actionMap[lowerAction];
    }
    
    // Generic conversion for other verbs
    if (lowerAction.endsWith('ing')) {
      console.log(`Already ends with ing: ${lowerAction}`);
      return lowerAction; // Already in gerund form
    } else if (lowerAction.endsWith('e')) {
      console.log(`Ends with e, removing: ${lowerAction.substring(0, lowerAction.length - 1) + 'ing'}`);
      return lowerAction.substring(0, lowerAction.length - 1) + 'ing';
    } else {
      console.log(`Adding ing: ${lowerAction + 'ing'}`);
      return lowerAction + 'ing';
    }
  }
  
  return cleanQuestion;
}

// Test the problematic case
const result = debugHowTo("How to bake chocolate chip cookies?");
console.log(`Final result: "${result}"`);