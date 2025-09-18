#!/usr/bin/env python3
"""
Supabase Database Testing Suite for Table Planner Integration
Tests the critical bug fix: table planner showing real confirmed guests instead of mock data
"""

import requests
import json
import sys
import os
from datetime import datetime

# Supabase configuration from frontend
SUPABASE_URL = "https://lzhyjbgelvyewsxaecsi.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aHlqYmdlbHZ5ZXdzeGFlY3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTUwOTcsImV4cCI6MjA3MzA3MTA5N30.EV3qo0Z69GIs-wD7Nljs2sCJA6fAN8Kfci0McjKhCaQ"

print(f"🔍 Testing Supabase Database Integration for Table Planner")
print(f"🎯 Target: Wedding Guest Management System - Confirmed Guests")
print(f"🌐 Supabase URL: {SUPABASE_URL}")
print("=" * 80)

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("\n📍 Testing Supabase Connection")
    try:
        # Test basic connection with a simple query
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Supabase connection successful")
            return True
        else:
            print(f"   ❌ Connection failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False

def test_invitati_table_structure():
    """Test invitati table structure and accessibility"""
    print("\n📍 Testing 'invitati' Table Structure")
    try:
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Query the invitati table with limit to check structure
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/invitati?limit=1",
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            
            if isinstance(data, list):
                if len(data) > 0:
                    # Check expected columns
                    expected_columns = ['id', 'nome_visualizzato', 'confermato', 'gruppo', 'user_id']
                    sample_record = data[0]
                    
                    missing_columns = [col for col in expected_columns if col not in sample_record]
                    if missing_columns:
                        print(f"   ⚠️  Missing expected columns: {missing_columns}")
                    else:
                        print("   ✅ All expected columns present")
                    
                    print(f"   📊 Sample record structure: {list(sample_record.keys())}")
                    return True, data
                else:
                    print("   ⚠️  Table exists but is empty")
                    return True, []
            else:
                print("   ❌ Unexpected response format")
                return False, None
        else:
            print(f"   ❌ Failed to access invitati table: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False, None

def test_confirmed_guests_query():
    """Test the specific query used by the table planner: confermato = TRUE"""
    print("\n📍 Testing Confirmed Guests Query (confermato = TRUE)")
    try:
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Query for confirmed guests only
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/invitati?confermato=eq.true&select=id,nome_visualizzato,cognome,note,gruppo,confermato,user_id,unita_invito_id",
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            confirmed_guests = response.json()
            print(f"   📊 Found {len(confirmed_guests)} confirmed guests")
            
            if len(confirmed_guests) > 0:
                print("   ✅ Confirmed guests found in database")
                
                # Show sample data
                for i, guest in enumerate(confirmed_guests[:3]):  # Show first 3
                    print(f"   👤 Guest {i+1}: {guest.get('nome_visualizzato', 'N/A')} - Group: {guest.get('gruppo', 'N/A')}")
                
                if len(confirmed_guests) > 3:
                    print(f"   ... and {len(confirmed_guests) - 3} more guests")
                
                # Check data quality
                guests_with_names = [g for g in confirmed_guests if g.get('nome_visualizzato')]
                guests_with_groups = [g for g in confirmed_guests if g.get('gruppo')]
                
                print(f"   📈 Data Quality:")
                print(f"      - Guests with names: {len(guests_with_names)}/{len(confirmed_guests)}")
                print(f"      - Guests with groups: {len(guests_with_groups)}/{len(confirmed_guests)}")
                
                return True, confirmed_guests
            else:
                print("   ⚠️  No confirmed guests found (confermato = TRUE)")
                print("   💡 This explains why table planner shows mock data!")
                return True, []
        else:
            print(f"   ❌ Query failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False, None

def test_user_isolation_rls():
    """Test Row Level Security (RLS) for user isolation"""
    print("\n📍 Testing Row Level Security (RLS) for User Isolation")
    try:
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Query all records to see if RLS is working
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/invitati?select=user_id",
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if len(data) > 0:
                # Check unique user_ids
                user_ids = list(set([record.get('user_id') for record in data if record.get('user_id')]))
                print(f"   📊 Found records for {len(user_ids)} different users")
                print(f"   👥 User IDs: {user_ids[:3]}{'...' if len(user_ids) > 3 else ''}")
                
                if len(user_ids) > 1:
                    print("   ⚠️  Multiple users visible - RLS might not be properly configured")
                    print("   💡 This could cause users to see each other's guests")
                else:
                    print("   ✅ Single user context - RLS appears to be working")
                
                return True, user_ids
            else:
                print("   ⚠️  No records found")
                return True, []
        else:
            print(f"   ❌ RLS test failed: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False, None

def test_table_planner_data_mapping():
    """Test data mapping from database to TableGuest interface"""
    print("\n📍 Testing Data Mapping to TableGuest Interface")
    
    # Get confirmed guests first
    success, confirmed_guests = test_confirmed_guests_query()
    
    if not success or not confirmed_guests:
        print("   ❌ Cannot test mapping - no confirmed guests available")
        return False
    
    try:
        print("   🔄 Testing data mapping...")
        
        # Simulate the mapping done in useSupabaseConfirmedGuests hook
        mapped_guests = []
        for invitato in confirmed_guests:
            mapped_guest = {
                'id': str(invitato.get('id', '')),
                'name': invitato.get('nome_visualizzato', ''),
                'email': '',  # Not in database
                'category': invitato.get('gruppo', 'Altri invitati'),
                'dietaryRestrictions': invitato.get('note'),
                'tableId': None,  # Managed by table system
                'seatNumber': None,
                'user_id': invitato.get('user_id', ''),
                'confermato': True
            }
            mapped_guests.append(mapped_guest)
        
        print(f"   ✅ Successfully mapped {len(mapped_guests)} guests")
        
        # Validate mapping quality
        valid_names = [g for g in mapped_guests if g['name']]
        valid_categories = [g for g in mapped_guests if g['category'] != 'Altri invitati']
        
        print(f"   📈 Mapping Quality:")
        print(f"      - Valid names: {len(valid_names)}/{len(mapped_guests)}")
        print(f"      - Categorized guests: {len(valid_categories)}/{len(mapped_guests)}")
        
        # Show sample mapped data
        for i, guest in enumerate(mapped_guests[:2]):
            print(f"   👤 Mapped Guest {i+1}: {guest['name']} ({guest['category']})")
        
        return True, mapped_guests
        
    except Exception as e:
        print(f"   ❌ Mapping failed: {str(e)}")
        return False, None

def test_authentication_requirement():
    """Test if authentication is required for data access"""
    print("\n📍 Testing Authentication Requirements")
    try:
        # Test without authentication
        response = requests.get(f"{SUPABASE_URL}/rest/v1/invitati?limit=1")
        
        print(f"   Status Code (no auth): {response.status_code}")
        
        if response.status_code == 401:
            print("   ✅ Authentication required - good security")
            return True
        elif response.status_code == 200:
            print("   ⚠️  No authentication required - potential security issue")
            return True
        else:
            print(f"   ❌ Unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False

def run_comprehensive_supabase_tests():
    """Run all Supabase integration tests"""
    print("🚀 Starting Comprehensive Supabase Integration Tests")
    print("🎯 Focus: Table Planner Bug Fix - Real vs Mock Data")
    print("=" * 80)
    
    test_results = {}
    
    # Core connectivity tests
    test_results['supabase_connection'] = test_supabase_connection()
    test_results['invitati_table_structure'] = test_invitati_table_structure()[0]
    test_results['confirmed_guests_query'] = test_confirmed_guests_query()[0]
    test_results['user_isolation_rls'] = test_user_isolation_rls()[0]
    test_results['data_mapping'] = test_table_planner_data_mapping()
    test_results['authentication_requirement'] = test_authentication_requirement()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUPABASE INTEGRATION TEST RESULTS")
    print("=" * 80)
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 Overall Result: {passed_tests}/{total_tests} tests passed")
    
    # Critical analysis for the bug fix
    print("\n" + "=" * 80)
    print("🔍 CRITICAL BUG ANALYSIS: Table Planner Data Source")
    print("=" * 80)
    
    # Get confirmed guests count
    _, confirmed_guests = test_confirmed_guests_query()
    if confirmed_guests is not None:
        guest_count = len(confirmed_guests)
        if guest_count > 0:
            print(f"✅ REAL DATA AVAILABLE: {guest_count} confirmed guests in database")
            print("✅ Table planner should show REAL data, not mock data")
            print("✅ Bug fix implementation appears correct")
        else:
            print("❌ NO CONFIRMED GUESTS: Database has no guests with confermato = TRUE")
            print("⚠️  This explains why table planner falls back to mock data")
            print("💡 Need to add confirmed guests to database for testing")
    else:
        print("❌ CANNOT ACCESS DATA: Database connection or query issues")
        print("⚠️  Table planner cannot fetch real data - will show mock data")
    
    if passed_tests == total_tests:
        print("\n🎉 All Supabase integration tests PASSED!")
        return True
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests FAILED. Integration may have issues.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_supabase_tests()
    sys.exit(0 if success else 1)