import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = "http://localhost:3002"; // Changed from 3001 to 3002

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [currentMessageText, setCurrentMessageText] = useState(""); // Track current message text for captions
  const [currentAudio, setCurrentAudio] = useState(null); // Track current audio for stopping
  const [currentImages, setCurrentImages] = useState([]); // Track current images

  let chunks = [];

  const initiateRecording = () => {
    chunks = [];
  };

  const onDataAvailable = (e) => {
    chunks.push(e.data);
  };

  const sendAudioData = async (audioBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async function () {
      const base64Audio = reader.result.split(",")[1];
      setLoading(true);
      try {
        const data = await fetch(`${backendUrl}/sts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64Audio }),
        });
        const response = await data.json();
        
        // Handle messages - simplified to handle both array and object formats
        let responseMessages = [];
        if (Array.isArray(response)) {
          responseMessages = response;
        } else if (response.messages && Array.isArray(response.messages)) {
          responseMessages = response.messages;
        }
        
        // Handle images
        if (response.images && Array.isArray(response.images)) {
          console.log("Setting current images (STS):", response.images);
          setCurrentImages(response.images);
        } else {
          console.log("No images in STS response:", response);
        }
        
        if (responseMessages.length > 0) {
          console.log("Received messages from STS:", responseMessages);
          setMessages((messages) => [...messages, ...responseMessages]);
        }
      } catch (error) {
        console.error("Error in sendAudioData:", error);
      } finally {
        setLoading(false);
      }
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream);
          newMediaRecorder.onstart = initiateRecording;
          newMediaRecorder.ondataavailable = onDataAvailable;
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            try {
              await sendAudioData(audioBlob);
            } catch (error) {
              console.error(error);
              alert(error.message);
            }
          };
          setMediaRecorder(newMediaRecorder);
        })
        .catch((err) => console.error("Error accessing microphone:", err));
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const tts = async (messageText) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      });
      const response = await data.json();
      
      // Handle messages - simplified to handle both array and object formats
      let responseMessages = [];
      if (Array.isArray(response)) {
        responseMessages = response;
      } else if (response.messages && Array.isArray(response.messages)) {
        responseMessages = response.messages;
      }
      
      // Handle images
      if (response.images && Array.isArray(response.images)) {
        console.log("Setting current images (TTS):", response.images);
        setCurrentImages(response.images);
      } else {
        console.log("No images in TTS response:", response);
      }
      
      if (responseMessages.length > 0) {
        console.log("Received messages from TTS:", responseMessages);
        setMessages((messages) => [...messages, ...responseMessages]);
      }
    } catch (error) {
      console.error("Error in tts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    console.log("Message played, moving to next message");
    setMessages((messages) => {
      const newMessages = messages.slice(1);
      console.log("Remaining messages:", newMessages.length);
      return newMessages;
    });
  };

  // Modified function to stop audio playback but keep captions
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setMessages([]); // Clear all pending messages
    setMessage(null); // Clear current message
    // Note: We don't clear currentMessageText here to keep the captions visible
  };

  useEffect(() => {
    if (messages.length > 0) {
      console.log("Setting current message:", messages[0]);
      setMessage(messages[0]);
      setCurrentMessageText(messages[0].text || ""); // Set current message text for captions
    } else {
      console.log("No more messages");
      setMessage(null);
      // Note: We don't clear currentMessageText here to keep the captions visible
    }
  }, [messages]);

  return (
    <SpeechContext.Provider
      value={{
        startRecording,
        stopRecording,
        recording,
        tts,
        message,
        onMessagePlayed,
        loading,
        currentMessageText, // Expose current message text for captions
        stopAudio, // Expose stop audio function
        setCurrentAudio, // Expose setCurrentAudio for the Avatar component
        messages, // Expose messages array for chat history
        setLoading, // Expose setLoading function
        setMessages, // Expose setMessages function
        currentImages, // Expose current images
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};