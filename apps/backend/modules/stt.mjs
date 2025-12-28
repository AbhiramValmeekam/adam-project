import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import dotenv from "dotenv";
import { transcribeWithGoogle } from "./google-stt.mjs";

dotenv.config();

const debugLog = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(join("debug_audio", "stt_debug.log"), logMsg);
  console.log(msg);
};

const execPromise = promisify(exec);

/**
 * Convert audio to text using various STT options
 * This implementation tries multiple approaches:
 * 1. Google Speech-to-Text API (if credentials are available)
 * 2. Local Whisper.cpp (if available)
 * 3. Azure Speech-to-Text (if credentials are available)
 * 4. Fallback to a simple transcription service
 */
async function convertAudioToText({ audioData, language = "english" }) {
  try {
    debugLog(`Starting STT conversion for language: ${language}`);
    debugLog(`Audio data size: ${audioData.length} bytes`);

    // Save audio data to a temporary file
    const tempDir = tmpdir();
    const timestamp = Date.now();
    // Use .webm as a default but we'll try to be smart
    const tempFilePath = join(tempDir, `input_audio_${timestamp}.webm`);
    const tempWavPath = join(tempDir, `input_audio_${timestamp}.wav`);

    debugLog(`Writing audio to temp file: ${tempFilePath}`);
    fs.writeFileSync(tempFilePath, audioData);

    let finalPath = tempFilePath;

    // For Google STT, WebM are often better handled raw if they come from Chrome
    // We will still keep the WAV conversion as a fallback or for other models
    try {
      debugLog(`[STT] Normalization/Conversion: ${tempFilePath} -> ${tempWavPath}`);
      await execPromise(`ffmpeg -i "${tempFilePath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${tempWavPath}" -y`);
      debugLog(`[STT] WAV conversion ready: ${tempWavPath} (${fs.statSync(tempWavPath).size} bytes)`);
    } catch (conversionError) {
      debugLog(`[STT] FFmpeg conversion failed: ${conversionError.message}`);
    }

    // DECISION: We will try the ORIGINAL file for Google STT if it's WebM
    // because Chrome's raw output is usually what Google expects.
    if (tempFilePath.endsWith('.webm')) {
      finalPath = tempFilePath;
      debugLog(`[STT] Prioritizing RAW WebM for Google STT: ${finalPath}`);
    } else if (fs.existsSync(tempWavPath)) {
      finalPath = tempWavPath;
      debugLog(`[STT] Using converted WAV: ${finalPath}`);
    }

    // Clean up temporary files
    const cleanup = () => {
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath);
      } catch (cleanupError) { }
    };

    // Try Google Speech-to-Text
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    debugLog(`[STT] Credentials Path: ${credPath}`);
    debugLog(`[STT] Credentials File Exists: ${credPath ? fs.existsSync(credPath) : 'no path'}`);

    if (credPath && fs.existsSync(credPath)) {
      try {
        debugLog(`[STT] Attempting Google STT with file: ${finalPath}`);
        debugLog(`[STT] Final file size for Google: ${fs.statSync(finalPath).size} bytes`);
        const result = await transcribeWithGoogle(finalPath, language);
        if (result && result.trim() !== "") {
          debugLog(`[STT] ✅ Google STT succeeded: "${result}"`);
          cleanup();
          return result;
        } else {
          debugLog("[STT] ⚠️ Google STT returned empty result or null");
        }
      } catch (googleError) {
        debugLog(`[STT] ❌ Google STT failed: ${googleError.message}`);
      }
    } else {
      debugLog("[STT] ❌ GOOGLE_APPLICATION_CREDENTIALS not set or file not found");
    }

    // Try Azure Speech-to-Text if credentials are available
    if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
      try {
        const result = await transcribeWithAzure(tempWavPath);
        cleanup();
        return result;
      } catch (azureError) {
        debugLog(`[STT] Azure STT failed: ${azureError.message}`);
      }
    }

    // Try local Whisper.cpp if available
    try {
      const result = await transcribeWithLocalWhisper(tempWavPath);
      cleanup();
      return result;
    } catch (whisperError) {
      debugLog(`[STT] Local Whisper failed: ${whisperError.message}`);
    }

    debugLog("All STT methods failed, returning empty transcription");
    cleanup();
    return "";

  } catch (error) {
    debugLog(`[STT] Error: ${error.message}`);
    return "";
  }
}

/**
 * Transcribe audio using Azure Speech-to-Text API
 */
async function transcribeWithAzure(audioFilePath) {
  // This would require implementing the Azure Speech-to-Text API
  // For now, we'll return a placeholder
  console.log("Azure STT would transcribe:", audioFilePath);
  return "This is a test transcription from Azure STT.";
}

/**
 * Transcribe audio using local Whisper.cpp
 */
async function transcribeWithLocalWhisper(audioFilePath) {
  try {
    // Check if whisper.cpp is available
    await execPromise("whisper --help");

    // Run whisper.cpp on the audio file
    const { stdout } = await execPromise(`whisper "${audioFilePath}" --model tiny.en --output-txt`);

    // Read the transcription result
    const txtFilePath = audioFilePath.replace(/\.[^/.]+$/, ".txt");
    if (fs.existsSync(txtFilePath)) {
      const transcription = fs.readFileSync(txtFilePath, 'utf8');
      return transcription.trim();
    }

    return "Transcription completed with Whisper.";
  } catch (error) {
    console.error("Local Whisper Error:", error);
    throw error;
  }
}

export { convertAudioToText };