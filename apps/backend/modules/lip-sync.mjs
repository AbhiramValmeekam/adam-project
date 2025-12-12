import { convertTextToSpeech } from "./local-tts.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";
import fs from "fs";

const MAX_RETRIES = 10;
const RETRY_DELAY = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lipSync = async (response) => {
  // Extract messages from response, preserving other properties
  const { messages, ...otherProps } = response;
  
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;
      const wavFileName = `audios/message_${index}.wav`;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await convertTextToSpeech({ text: message.text, fileName });
          await delay(RETRY_DELAY);
          break;
        } catch (error) {
          if (error.response && error.response.status === 429 && attempt < MAX_RETRIES - 1) {
            await delay(RETRY_DELAY);
          } else {
            throw error;
          }
        }
      }
      console.log(`Message ${index} converted to speech`);
    })
  );

  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;
      const wavFileName = `audios/message_${index}.wav`;
      const jsonFileName = `audios/message_${index}.json`;

      try {
        // Check if WAV file exists (Windows TTS creates WAV files)
        let audioFile = fileName;
        if (fs.existsSync(wavFileName)) {
          audioFile = wavFileName;
        } else if (!fs.existsSync(fileName)) {
          console.warn(`Neither ${fileName} nor ${wavFileName} found`);
          // Create a placeholder if neither file exists
          const placeholder = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x40, 0x1f, 0x00, 0x00, 0x80, 0x3e, 0x00, 0x00, 0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]);
          fs.writeFileSync(audioFile, placeholder);
        }
        
        await getPhonemes({ message: index });
        message.audio = await audioFileToBase64({ fileName: audioFile });
        message.lipsync = await readJsonTranscript({ fileName: jsonFileName });
      } catch (error) {
        console.error(`Error while getting phonemes for message ${index}:`, error);
        // Create placeholder data if there's an error
        try {
          message.audio = ""; // Empty audio data
          message.lipsync = {
            mouthCues: [
              { start: 0.0, end: 0.5, value: "A" },
              { start: 0.5, end: 1.0, value: "B" },
              { start: 1.0, end: 1.5, value: "C" }
            ]
          };
        } catch (innerError) {
          console.error(`Error creating placeholder data for message ${index}:`, innerError);
        }
      }
    })
  );

  // Return the complete response with processed messages and preserved other properties
  return {
    ...otherProps,
    messages: messages
  };
};

export { lipSync };