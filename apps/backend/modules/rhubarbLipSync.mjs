import { execCommand } from "../utils/files.mjs";
import fs from "fs";

const getPhonemes = async ({ message }) => {
  try {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${message}`);
    
    // Check if ffmpeg is available
    try {
      await execCommand({ command: "ffmpeg -version" });
    } catch (ffmpegError) {
      console.warn("FFmpeg not found, skipping lip sync");
      // Create a simple placeholder JSON file with correct format
      const placeholderData = {
        mouthCues: [
          { start: 0.0, end: 0.5, value: "A" },
          { start: 0.5, end: 1.0, value: "B" },
          { start: 1.0, end: 1.5, value: "C" }
        ]
      };
      fs.writeFileSync(`audios/message_${message}.json`, JSON.stringify(placeholderData));
      return;
    }
    
    await execCommand(
      { command: `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav` }
      // -y to overwrite the file
    );
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    
    // Check if rhubarb is available
    try {
      await execCommand({ command: "./bin/rhubarb --help" });
    } catch (rhubarbError) {
      console.warn("Rhubarb not found, creating placeholder lip sync data");
      // Create a simple placeholder JSON file with correct format
      const placeholderData = {
        mouthCues: [
          { start: 0.0, end: 0.5, value: "A" },
          { start: 0.5, end: 1.0, value: "B" },
          { start: 1.0, end: 1.5, value: "C" }
        ]
      };
      fs.writeFileSync(`audios/message_${message}.json`, JSON.stringify(placeholderData));
      return;
    }
    
    await execCommand({
      command: `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
    });
    // -r phonetic is faster but less accurate
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  } catch (error) {
    console.error(`Error while getting phonemes for message ${message}:`, error);
    // Create a simple placeholder JSON file as fallback with correct format
    try {
      const placeholderData = {
        mouthCues: [
          { start: 0.0, end: 0.5, value: "A" },
          { start: 0.5, end: 1.0, value: "B" },
          { start: 1.0, end: 1.5, value: "C" }
        ]
      };
      fs.writeFileSync(`audios/message_${message}.json`, JSON.stringify(placeholderData));
    } catch (writeError) {
      console.error(`Error creating placeholder lip sync data:`, writeError);
    }
  }
};

export { getPhonemes };