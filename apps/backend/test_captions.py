#!/usr/bin/env python3
"""
Test script to verify the avatar's live captions functionality
"""

import requests
import json

# Configuration
AVATAR_BACKEND_URL = "http://localhost:3000"

def test_captions():
    """Test the avatar with a message to check captions"""
    print("Testing Avatar Live Captions")
    print("=" * 30)
    
    test_message = "Hello! This is a test of the live caption system. The avatar should display these words as captions while speaking."
    
    try:
        response = requests.post(f"{AVATAR_BACKEND_URL}/tts", json={"message": test_message})
        
        if response.status_code == 200:
            result = response.json()
            messages = result.get('messages', [])
            
            if messages:
                first_message = messages[0]
                text = first_message.get('text', '')
                expression = first_message.get('facialExpression', 'unknown')
                animation = first_message.get('animation', 'unknown')
                
                print(f"Text: {text}")
                print(f"Expression: {expression}")
                print(f"Animation: {animation}")
                print(f"✅ Response received - Captions should appear in the frontend")
                return True
            else:
                print(f"❌ No messages in response")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("Avatar Live Captions Test")
    print("=" * 30)
    
    success = test_captions()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("Open http://localhost:5174/ in your browser to see the live captions.")
    else:
        print("\n❌ Test failed!")

if __name__ == "__main__":
    main()