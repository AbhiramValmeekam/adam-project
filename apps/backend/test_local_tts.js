import { convertTextToSpeech } from "./modules/local-tts.mjs";
import fs from "fs";

console.log("Testing local TTS...");

async function testTTS() {
  try {
    console.log("Platform:", process.platform);
    
    // Test converting text to speech
    const testText = "Hello, this is a test of the local text to speech system.";
    const fileName = "test_audio.mp3";
    
    console.log(`Converting: "${testText}"`);
    await convertTextToSpeech({ text: testText, fileName: fileName });
    
    // Check if file was created
    if (fs.existsSync(fileName)) {
      const stats = fs.statSync(fileName);
      console.log(`✅ Audio file created: ${fileName} (${stats.size} bytes)`);
      // Clean up
      fs.unlinkSync(fileName);
    } else {
      console.log("❌ Audio file was not created");
    }
  } catch (error) {
    console.error("❌ Error testing local TTS:", error.message);
  }
}

testTTS();