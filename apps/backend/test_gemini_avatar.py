#!/usr/bin/env python3
"""
Test script to verify Gemini integration with the avatar project
"""

import requests
import json
import time

# Configuration
AVATAR_BACKEND_URL = "http://localhost:3000"

def test_gemini_avatar():
    """Test if the Gemini-powered avatar is working"""
    print("Testing Gemini Avatar Integration...")
    
    try:
        # Test TTS endpoint with a sample message
        test_data = {
            "message": "Hello, can you tell me about yourself?"
        }
        
        response = requests.post(f"{AVATAR_BACKEND_URL}/tts", json=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✓ Avatar response received")
            print(f"  Number of messages: {len(result.get('messages', []))}")
            
            if result.get('messages'):
                first_message = result['messages'][0]
                print(f"  First message text: {first_message.get('text', '')[:100]}...")
                print(f"  Facial expression: {first_message.get('facialExpression', 'N/A')}")
                print(f"  Animation: {first_message.get('animation', 'N/A')}")
            
            return True
        else:
            print(f"  ✗ Failed to get avatar response: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ✗ Error testing avatar: {e}")
        return False

def test_voices_endpoint():
    """Test if the voices endpoint is working"""
    print("\nTesting Voices Endpoint...")
    
    try:
        response = requests.get(f"{AVATAR_BACKEND_URL}/voices")
        if response.status_code == 200:
            print(f"  ✓ Voices endpoint working")
            return True
        else:
            print(f"  ✗ Voices endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ✗ Error testing voices endpoint: {e}")
        return False

def main():
    """Main test function"""
    print("Gemini Avatar Integration Test")
    print("=" * 50)
    
    # Test voices endpoint
    voices_ok = test_voices_endpoint()
    
    # Test avatar functionality
    avatar_ok = test_gemini_avatar()
    
    if voices_ok and avatar_ok:
        print("\n🎉 All tests passed! Gemini avatar integration is working correctly.")
    else:
        print("\n❌ Some tests failed.")
        if not voices_ok:
            print("  - Voices endpoint issues detected")
        if not avatar_ok:
            print("  - Avatar functionality issues detected")

if __name__ == "__main__":
    main()