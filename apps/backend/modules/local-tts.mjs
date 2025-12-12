import fs from "fs";
import { execSync } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const exec = promisify(execSync);

/**
 * Convert text to speech using local TTS solutions
 * This implementation tries multiple approaches:
 * 1. Using the 'say' command (macOS)
 * 2. Using the 'espeak' command (Linux/Windows with espeak installed)
 * 3. Using Windows PowerShell (Windows)
 * 4. Fallback to a simple placeholder
 */

async function convertTextToSpeech({ text, fileName }) {
  try {
    console.log(`Converting text to speech: ${text.substring(0, 50)}...`);
    
    // Try different TTS solutions based on the platform
    const platform = process.platform;
    
    if (platform === "darwin") {
      // macOS - use 'say' command
      try {
        execSync(`say -o "${fileName.replace('.mp3', '.aiff')}" "${text}"`);
        // Convert AIFF to MP3 if needed
        try {
          execSync(`ffmpeg -i "${fileName.replace('.mp3', '.aiff')}" "${fileName}" -y`);
          // Clean up AIFF file
          if (fs.existsSync(fileName.replace('.mp3', '.aiff'))) {
            fs.unlinkSync(fileName.replace('.mp3', '.aiff'));
          }
        } catch (convertError) {
          console.warn("FFmpeg conversion failed, using AIFF file directly");
          // Rename AIFF to MP3 (not ideal but works for basic playback)
          fs.renameSync(fileName.replace('.mp3', '.aiff'), fileName);
        }
        return;
      } catch (error) {
        console.warn("macOS 'say' command failed:", error.message);
      }
    } else if (platform === "win32") {
      // Windows - use PowerShell with .NET SpeechSynthesizer
      try {
        // Properly escape the text for PowerShell
        const escapedText = text.replace(/"/g, '`"').replace(/\$/g, '`$');
        const psScript = `
          Add-Type -AssemblyName System.Speech
          $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
          # Set voice properties for better quality
          $synth.Rate = 0
          $synth.Volume = 100
          $stream = New-Object System.IO.FileStream("${fileName}", [System.IO.FileMode]::Create)
          $synth.SetOutputToWaveStream($stream)
          $synth.Speak("${escapedText}")
          $stream.Close()
        `;
        
        fs.writeFileSync('tts.ps1', psScript);
        execSync('powershell -ExecutionPolicy Bypass -File tts.ps1');
        fs.unlinkSync('tts.ps1');
        
        // On Windows, we create WAV files directly, so no conversion needed
        console.log("Windows TTS completed, created WAV file");
        return;
      } catch (error) {
        console.warn("Windows PowerShell TTS failed:", error.message);
      }
    } else {
      // Linux or other platforms - try espeak
      try {
        execSync(`espeak -w "${fileName.replace('.mp3', '.wav')}" "${text}"`);
        // Convert WAV to MP3 if ffmpeg is available
        try {
          execSync(`ffmpeg -i "${fileName.replace('.mp3', '.wav')}" "${fileName}" -y`);
          // Clean up WAV file
          if (fs.existsSync(fileName.replace('.mp3', '.wav'))) {
            fs.unlinkSync(fileName.replace('.mp3', '.wav'));
          }
        } catch (convertError) {
          console.warn("FFmpeg conversion failed, using WAV file directly");
          // Rename WAV to MP3 (not ideal but works for basic playback)
          fs.renameSync(fileName.replace('.mp3', '.wav'), fileName);
        }
        return;
      } catch (error) {
        console.warn("espeak command failed:", error.message);
      }
    }
    
    // Fallback: Create a simple placeholder audio file
    console.warn("All TTS methods failed, creating placeholder audio");
    createPlaceholderAudio(fileName);
    
  } catch (error) {
    console.error("Error in convertTextToSpeech:", error);
    // Create a placeholder audio file as fallback
    createPlaceholderAudio(fileName);
  }
}

function createPlaceholderAudio(fileName) {
  // Create a simple silent WAV file as placeholder (more compatible than MP3)
  // This is a minimal valid WAV file (silent, ~1 second)
  const silentWav = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
    0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x40, 0x1f, 0x00, 0x00, 0x80, 0x3e, 0x00, 0x00,
    0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
  ]);
  
  fs.writeFileSync(fileName, silentWav);
}

export { convertTextToSpeech };