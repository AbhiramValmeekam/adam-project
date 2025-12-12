import speech from "@google-cloud/speech";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

/**
 * Transcribe audio using Google Cloud Speech-to-Text API
 * 
 * To use this, you need to:
 * 1. Create a Google Cloud project
 * 2. Enable the Speech-to-Text API
 * 3. Create a service account and download the JSON key
 * 4. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to the JSON key file
 */

async function transcribeWithGoogle(audioFilePath) {
  try {
    // Creates a client
    const client = new speech.SpeechClient();

    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(audioFilePath);
    const audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
      content: audioBytes,
    };
    
    const config = {
      encoding: 'LINEAR16', // LINEAR16 is for WAV files
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
      
    console.log(`Transcription: ${transcription}`);
    return transcription;
  } catch (error) {
    console.error('Google STT Error:', error);
    throw error;
  }
}

export { transcribeWithGoogle };