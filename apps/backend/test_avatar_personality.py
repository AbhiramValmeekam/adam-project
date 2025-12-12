#!/usr/bin/env python3
"""
Test script to verify the avatar's new personality and expressions
"""

import requests
import json

# Configuration
AVATAR_BACKEND_URL = "http://localhost:3000"

def test_various_topics():
    """Test the avatar with various topics to check expressions"""
    print("Testing Avatar Personality and Expressions")
    print("=" * 50)
    
    test_cases = [
        {
            "message": "Tell me a joke",
            "expected_expression": "funnyFace or smile"
        },
        {
            "message": "Explain quantum physics",
            "expected_expression": "default or thoughtful"
        },
        {
            "message": "What is the weather like?",
            "expected_expression": "default"
        },
        {
            "message": "That's amazing!",
            "expected_expression": "surprised or smile"
        },
        {
            "message": "I'm feeling sad today",
            "expected_expression": "sad"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: '{test_case['message']}'")
        try:
            response = requests.post(f"{AVATAR_BACKEND_URL}/tts", json={"message": test_case['message']})
            
            if response.status_code == 200:
                result = response.json()
                messages = result.get('messages', [])
                
                if messages:
                    first_message = messages[0]
                    text = first_message.get('text', '')
                    expression = first_message.get('facialExpression', 'unknown')
                    animation = first_message.get('animation', 'unknown')
                    
                    print(f"   Text: {text[:100]}...")
                    print(f"   Expression: {expression}")
                    print(f"   Animation: {animation}")
                    print(f"   ✅ Response received")
                else:
                    print(f"   ❌ No messages in response")
            else:
                print(f"   ❌ HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_default_messages():
    """Test default messages"""
    print("\n\nTesting Default Messages")
    print("=" * 30)
    
    try:
        # Test with empty message to trigger default messages
        response = requests.post(f"{AVATAR_BACKEND_URL}/tts", json={"message": ""})
        
        if response.status_code == 200:
            result = response.json()
            messages = result.get('messages', [])
            
            if messages:
                print(f"   ✅ Default messages received: {len(messages)} messages")
                for i, msg in enumerate(messages):
                    print(f"   Message {i+1}: {msg.get('text', '')[:50]}...")
                    print(f"   Expression: {msg.get('facialExpression', 'unknown')}")
            else:
                print(f"   ❌ No default messages")
        else:
            print(f"   ❌ HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def main():
    """Main test function"""
    print("Avatar Personality Test")
    print("=" * 50)
    
    # Test various topics
    test_various_topics()
    
    # Test default messages
    test_default_messages()
    
    print("\n🎉 Test completed! Check the avatar in your browser to see the expressions.")

if __name__ == "__main__":
    main()