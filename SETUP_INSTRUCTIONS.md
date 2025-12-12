# Avatar Project Setup Instructions

This document provides detailed instructions on how to set up and run the talking avatar project from the repository.

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **npm** or **yarn** package manager
3. **API Keys**:
   - Gemini API key (recommended) or OpenAI API key
   - Optional: Google Cloud Speech-to-Text credentials
   - Optional: Azure Speech Services credentials

## Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/asanchezyali/talking-avatar-with-ai.git
cd adam-project
```

### 2. Install Backend Dependencies
```bash
cd apps/backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `apps/backend` directory with the following content:
```env
# GEMINI (Primary LLM - Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Alternative: OPENAI (If not using Gemini)
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-3.5-turbo

# Optional: Google Cloud Speech-to-Text
# GOOGLE_APPLICATION_CREDENTIALS=path_to_your_google_credentials.json

# Optional: Azure Speech Services
# AZURE_SPEECH_KEY=your_azure_speech_key
# AZURE_SPEECH_REGION=your_azure_region
```

Replace the placeholder values with your actual API keys.

Note: Eleven Labs API keys are no longer required as the project now uses local TTS.

### 4. Install Rhubarb Lip Sync (Required for Lip Syncing)
1. Download Rhubarb Lip Sync from: https://github.com/DanielSWolf/rhubarb-lip-sync
2. Extract the contents
3. Copy the `rhubarb` executable to `apps/backend/bin/` directory

### 5. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 6. Run the Applications

#### Start the Backend Server
```bash
cd ../backend
npm start
```
The backend will be available at http://localhost:3000

#### Start the Frontend Application
```bash
cd ../frontend
npm start
```
The frontend will be available at http://localhost:5173

## API Endpoints

### Backend Endpoints
- `POST /tts` - Text to speech with avatar animations
- `POST /sts` - Speech to text with avatar animations
- `GET /voices` - Get available voices

## Speech-to-Text Options

The avatar supports multiple STT providers in order of preference:
1. **Google Cloud Speech-to-Text** - Most accurate, requires Google credentials
2. **Local Whisper.cpp** - Privacy-focused, runs locally
3. **Azure Speech Services** - Good alternative, requires Azure credentials
4. **Fallback** - Simple placeholder transcription

## Text-to-Speech Options

The avatar now uses local TTS solutions that work without API keys:
1. **Windows PowerShell TTS** - Uses built-in Windows SpeechSynthesizer (.NET)
2. **macOS 'say' command** - Uses built-in macOS TTS
3. **Linux espeak** - Uses espeak command-line tool
4. **Fallback** - Silent placeholder audio

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure all required API keys are set in the `.env` file
2. **Rhubarb Lip Sync Not Found**: Make sure the Rhubarb executable is in the `bin` directory
3. **Port Conflicts**: If ports 3000 or 5173 are in use, modify the server configurations

### Error Messages

- **"Missing API key"**: Check your `.env` file configuration
- **"Rhubarb not found"**: Verify Rhubarb Lip Sync is installed in the `bin` directory

## Customization

### Avatar Appearance
The avatar model files are located in `apps/frontend/public/models/`:
- `avatar.glb` - 3D avatar model
- `animations.glb` - Avatar animations

## Architecture

### Backend
- Built with Node.js and Express
- Uses Gemini or OpenAI for text generation
- Uses local TTS for text-to-speech (no API keys required)
- Uses Rhubarb Lip Sync for lip syncing
- Supports multiple STT providers

### Frontend
- Built with React and Three.js
- Uses React Three Fiber for 3D rendering
- Uses React Three Drei for 3D helpers

## Contributing
Feel free to fork the repository and submit pull requests for improvements.

## License
This project is licensed under the MIT License.