#!/usr/bin/env node

/**
 * Direct test of the extractCoreSubject function
 */

import { extractCoreSubject } from './modules/gemini.mjs';

// Test the specific case that's failing
const question = "How to bake chocolate chip cookies?";
const result = extractCoreSubject(question);

console.log(`Question: "${question}"`);
console.log(`Result: "${result}"`);