import { extractCoreSubject, fetchWikimediaImages } from './modules/gemini.mjs';

// Test the enhanced core subject extraction and Wikimedia API integration
async function testWikimediaIntegration() {
  const testQuestions = [
    "What is photosynthesis?",
    "Explain the process of cellular respiration",
    "How does artificial intelligence work?",
    "Tell me about the history of the Roman Empire"
  ];

  console.log("Testing enhanced Wikimedia API integration:");
  console.log("==========================================");

  for (const [index, question] of testQuestions.entries()) {
    console.log(`\n${index + 1}. Question: "${question}"`);
    
    const coreSubject = extractCoreSubject(question);
    console.log(`   Core Subject: "${coreSubject}"`);
    
    try {
      console.log(`   Fetching images for: "${coreSubject}"`);
      const images = await fetchWikimediaImages(coreSubject, 2);
      console.log(`   Found ${images.length} images:`);
      
      images.forEach((image, imgIndex) => {
        console.log(`     ${imgIndex + 1}. ${image.label}`);
        console.log(`        URL: ${image.url}`);
        console.log(`        Source: ${image.source}`);
      });
    } catch (error) {
      console.error(`   Error fetching images: ${error.message}`);
    }
    
    console.log(""); // Blank line for readability
  }
}

testWikimediaIntegration().catch(console.error);