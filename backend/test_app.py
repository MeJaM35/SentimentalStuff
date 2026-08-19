import os
import json
from fastapi.testclient import TestClient
from main import app

def run_test():
    with TestClient(app) as client:
        print("1. Registering user...")
        register_res = client.post(
            "/auth/register", 
            json={"email": "test@test.com", "password": "password", "is_active": True, "is_superuser": False, "is_verified": False}
        )
        print("Register response:", register_res.status_code)

        print("\n2. Logging in to get JWT...")
        login_res = client.post(
            "/auth/jwt/login", 
            data={"username": "test@test.com", "password": "password"}
        )
        print("Login response:", login_res.status_code)
        
        if login_res.status_code != 200:
            print("Login failed:", login_res.json())
            return

        token = login_res.json()["access_token"]
        print(f"Token obtained: {token[:20]}...")

        print("\n3. Testing the Orchestration Logic (/analyze endpoint)...")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Mock conversation transcript
        transcript = """
Agent: Hello, thank you for calling support. How can I help you today?
Customer: I am extremely frustrated! I've been waiting on hold for 20 minutes and my software keeps crashing every time I try to save a file. This is unacceptable!
Agent: I am so sorry to hear that you're experiencing this issue, and I apologize for the long wait. I understand how frustrating it must be to lose your work. Let's get this fixed for you right away. Could you tell me what error code you are seeing?
Customer: There is no error code, it just closes! 
Agent: Okay, no problem. Let's try clearing your application cache. Go to Settings > Preferences > Advanced and click 'Clear Cache'.
Customer: Okay, I did that. Let me try saving... Oh, wow. It actually saved. 
Agent: I'm glad to hear that! Is there anything else I can assist you with today?
Customer: No, that's all. Thank you for your help.
Agent: You're welcome. Have a wonderful rest of your day!
"""
        
        files = {"file": ("conversation.txt", transcript, "text/plain")}
        
        analyze_res = client.post("/analyze", headers=headers, files=files)
        print("Analyze response status:", analyze_res.status_code)
        
        if analyze_res.status_code == 200:
            print("\n--- FINAL AI DASHBOARD JSON OUTPUT ---")
            print(json.dumps(analyze_res.json(), indent=2))
        else:
            print("Analyze failed:", analyze_res.text)

if __name__ == "__main__":
    run_test()
