#!/usr/bin/env python3
"""
Database Inspection - Check all data in invitati table
"""

import requests
import json

SUPABASE_URL = "https://lzhyjbgelvyewsxaecsi.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aHlqYmdlbHZ5ZXdzeGFlY3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTUwOTcsImV4cCI6MjA3MzA3MTA5N30.EV3qo0Z69GIs-wD7Nljs2sCJA6fAN8Kfci0McjKhCaQ"

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

print("🔍 INSPECTING INVITATI TABLE")
print("=" * 50)

# Check all guests (regardless of confirmation status)
print("\n1. ALL GUESTS IN DATABASE:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/invitati?select=*",
    headers=headers
)

if response.status_code == 200:
    all_guests = response.json()
    print(f"   Total guests: {len(all_guests)}")
    
    if len(all_guests) > 0:
        # Analyze confirmation status
        confirmed = [g for g in all_guests if g.get('confermato') == True]
        unconfirmed = [g for g in all_guests if g.get('confermato') == False]
        null_status = [g for g in all_guests if g.get('confermato') is None]
        
        print(f"   ✅ Confirmed (confermato = TRUE): {len(confirmed)}")
        print(f"   ❌ Unconfirmed (confermato = FALSE): {len(unconfirmed)}")
        print(f"   ❓ Unknown status (confermato = NULL): {len(null_status)}")
        
        # Show sample data
        print("\n2. SAMPLE GUEST DATA:")
        for i, guest in enumerate(all_guests[:5]):
            print(f"   Guest {i+1}:")
            print(f"      ID: {guest.get('id')}")
            print(f"      Name: {guest.get('nome_visualizzato')}")
            print(f"      Confirmed: {guest.get('confermato')}")
            print(f"      Group: {guest.get('gruppo')}")
            print(f"      User ID: {guest.get('user_id')}")
            print()
        
        # Check if we can manually confirm some guests for testing
        if len(unconfirmed) > 0 or len(null_status) > 0:
            print("3. POTENTIAL FIX:")
            print("   💡 There are unconfirmed guests that could be confirmed for testing")
            print(f"   💡 Consider updating some guests to confermato = TRUE")
    else:
        print("   ⚠️  No guests found in database at all")
else:
    print(f"   ❌ Failed to query database: {response.status_code}")
    print(f"   Response: {response.text}")

# Check other related tables
print("\n4. CHECKING RELATED TABLES:")

# Check unita_invito table
print("\n   UNITA_INVITO table:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/unita_invito?select=*",
    headers=headers
)
if response.status_code == 200:
    unita_data = response.json()
    print(f"      Records: {len(unita_data)}")
else:
    print(f"      Error: {response.status_code}")

# Check profiles table
print("\n   PROFILES table:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?select=*",
    headers=headers
)
if response.status_code == 200:
    profiles_data = response.json()
    print(f"      Records: {len(profiles_data)}")
    if len(profiles_data) > 0:
        print(f"      Sample user_id: {profiles_data[0].get('user_id')}")
else:
    print(f"      Error: {response.status_code}")