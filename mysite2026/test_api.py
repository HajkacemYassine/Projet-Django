import requests
import json

BASE_URL = "http://localhost:8000"

# 1. Login pour obtenir le token
print("1. Connexion...")
login_response = requests.post(f"{BASE_URL}/blood-api/auth/login/", json={
    "username": "admin",  # Changez avec votre username
    "password": "admin"   # Changez avec votre password
})

if login_response.status_code != 200:
    print(f"Erreur login: {login_response.status_code}")
    print(login_response.text)
    exit()

token = login_response.json().get('access')
print(f"Token obtenu: {token[:20]}...")

# 2. Tester la prédiction
print("\n2. Test prédiction...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

predict_response = requests.post(
    f"{BASE_URL}/ml-api/predict-with-alerts/",
    headers=headers,
    json={"ville": "Tunis", "auto_create_demand": True}
)

print(f"Status: {predict_response.status_code}")
print(f"Response: {json.dumps(predict_response.json(), indent=2)}")

if predict_response.status_code == 200:
    print("\n✅ SUCCESS!")
else:
    print(f"\n❌ ERROR {predict_response.status_code}")
