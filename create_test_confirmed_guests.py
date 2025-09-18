#!/usr/bin/env python3
"""
Create test confirmed guests in Supabase database
This will demonstrate that the table planner now shows real data from database
"""

import requests
import json
import uuid

# Supabase configuration
SUPABASE_URL = "https://lzhyjbgelvyewsxaecsi.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aHlqYmdlbHZ5ZXdzeGFlY3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTUwOTcsImV4cCI6MjA3MzA3MTA5N30.EV3qo0Z69GIs-wD7Nljs2sCJA6fAN8Kfci0McjKhCaQ"

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("🎯 CREATING TEST CONFIRMED GUESTS IN DATABASE")
print("=" * 50)

# Test user ID (we'll use a generic test user)
TEST_USER_ID = "test-user-confirmed-guests"

# First, let's check if we have any users in profiles
print("1. Checking existing users...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?select=*",
    headers=headers
)

if response.status_code == 200:
    users = response.json()
    print(f"   Found {len(users)} users in profiles")
    if len(users) > 0:
        # Use first real user ID
        TEST_USER_ID = users[0]['user_id']
        print(f"   Using real user ID: {TEST_USER_ID}")
else:
    print(f"   Could not get users: {response.status_code}")
    print("   Using generic test user ID")

# Create test invitation unit first
print("\n2. Creating test invitation unit...")
unita_invito_data = {
    'id': str(uuid.uuid4()),
    'user_id': TEST_USER_ID,
    'nome_principale': 'Test Family',
    'created_at': '2024-01-15T10:00:00Z'
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/unita_invito",
    headers=headers,
    json=unita_invito_data
)

if response.status_code == 201:
    unita_created = response.json()[0]
    unita_id = unita_created['id']
    print(f"   ✅ Created invitation unit: {unita_id}")
else:
    print(f"   ❌ Failed to create invitation unit: {response.status_code}")
    print(f"   Response: {response.text}")
    # Try to get existing one
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/unita_invito?user_id=eq.{TEST_USER_ID}&limit=1",
        headers=headers
    )
    if response.status_code == 200 and len(response.json()) > 0:
        unita_id = response.json()[0]['id']
        print(f"   Using existing invitation unit: {unita_id}")
    else:
        print("   Cannot proceed without invitation unit")
        exit(1)

# Create confirmed guests
print("\n3. Creating confirmed guests...")

confirmed_guests = [
    {
        'nome_visualizzato': 'Marco Rossi',
        'cognome': 'Rossi',
        'gruppo': 'Famiglia dello sposo',
        'note': 'Vegetariano',
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    },
    {
        'nome_visualizzato': 'Anna Bianchi',
        'cognome': 'Bianchi', 
        'gruppo': 'Famiglia della sposa',
        'note': 'Senza glutine',
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    },
    {
        'nome_visualizzato': 'Luigi Verdi',
        'cognome': 'Verdi',
        'gruppo': 'Amici dello sposo',
        'note': None,
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    },
    {
        'nome_visualizzato': 'Francesca Romano',
        'cognome': 'Romano',
        'gruppo': 'Amici della sposa',
        'note': None,
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    },
    {
        'nome_visualizzato': 'Giuseppe Marino',
        'cognome': 'Marino',
        'gruppo': 'Famiglia dello sposo',
        'note': None,
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    },
    {
        'nome_visualizzato': 'Silvia Bertolini',
        'cognome': 'Bertolini',
        'gruppo': 'Colleghi',
        'note': 'Intollerante al lattosio',
        'confermato': True,
        'user_id': TEST_USER_ID,
        'unita_invito_id': unita_id
    }
]

created_count = 0
for guest in confirmed_guests:
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/invitati",
        headers=headers,
        json=guest
    )
    
    if response.status_code == 201:
        created_guest = response.json()[0]
        print(f"   ✅ Created: {guest['nome_visualizzato']} (ID: {created_guest['id']})")
        created_count += 1
    else:
        print(f"   ❌ Failed to create {guest['nome_visualizzato']}: {response.status_code}")
        print(f"      Response: {response.text}")

print(f"\n4. SUMMARY:")
print(f"   ✅ Created {created_count} confirmed guests")
print(f"   ✅ User ID: {TEST_USER_ID}")
print(f"   ✅ Invitation Unit ID: {unita_id}")

# Verify the creation
print("\n5. VERIFICATION - Querying confirmed guests...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/invitati?confermato=eq.true&user_id=eq.{TEST_USER_ID}&select=*",
    headers=headers
)

if response.status_code == 200:
    verified_guests = response.json()
    print(f"   ✅ Verified: {len(verified_guests)} confirmed guests in database")
    
    if len(verified_guests) > 0:
        print("\n6. SAMPLE DATA THAT TABLE PLANNER WILL RECEIVE:")
        for i, guest in enumerate(verified_guests[:3]):
            print(f"   Guest {i+1}:")
            print(f"      Name: {guest.get('nome_visualizzato')}")
            print(f"      Group: {guest.get('gruppo')}")
            print(f"      Confirmed: {guest.get('confermato')}")
            print(f"      Notes: {guest.get('note')}")
            print()
        
        print("🎉 SUCCESS! Table planner will now show REAL DATABASE DATA instead of mock data!")
        print(f"📝 To test, login with a user that has user_id: {TEST_USER_ID}")
    else:
        print("❌ No confirmed guests found after creation")
else:
    print(f"   ❌ Verification failed: {response.status_code}")
    print(f"   Response: {response.text}")

print("\n" + "=" * 50)
print("TEST COMPLETED")