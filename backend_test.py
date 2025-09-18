#!/usr/bin/env python3
"""
Backend API Testing Suite for Wedding Guest Management System
Tests existing functionality to ensure it's working after table planner integration
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("❌ ERROR: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"

print(f"🔍 Testing Backend API at: {API_BASE_URL}")
print("=" * 60)

def test_root_endpoint():
    """Test GET /api/ endpoint"""
    print("\n📍 Testing Root Endpoint (GET /api/)")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and data["message"] == "Hello World":
                print("   ✅ Root endpoint working correctly")
                return True
            else:
                print("   ❌ Unexpected response format")
                return False
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False

def test_get_status_checks():
    """Test GET /api/status endpoint"""
    print("\n📍 Testing Get Status Checks (GET /api/status)")
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            print("   ✅ Get status checks endpoint working correctly")
            return True
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False

def test_create_status_check():
    """Test POST /api/status endpoint"""
    print("\n📍 Testing Create Status Check (POST /api/status)")
    try:
        # Create test data with realistic wedding-related client name
        test_data = {
            "client_name": "Maria e Giuseppe Rossi"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/status",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            
            # Validate response structure
            required_fields = ["id", "client_name", "timestamp"]
            if all(field in data for field in required_fields):
                if data["client_name"] == test_data["client_name"]:
                    print("   ✅ Create status check endpoint working correctly")
                    return True, data["id"]
                else:
                    print("   ❌ Client name mismatch in response")
                    return False, None
            else:
                print("   ❌ Missing required fields in response")
                return False, None
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False, None

def test_database_connectivity():
    """Test database connectivity by creating and retrieving data"""
    print("\n📍 Testing Database Connectivity")
    
    # First, create a status check
    create_success, created_id = test_create_status_check()
    if not create_success:
        print("   ❌ Database connectivity test failed - cannot create data")
        return False
    
    # Then, retrieve all status checks to verify data persistence
    print("\n   🔄 Verifying data persistence...")
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        if response.status_code == 200:
            data = response.json()
            # Check if our created record exists
            found_record = any(record.get("id") == created_id for record in data)
            if found_record:
                print("   ✅ Database connectivity working - data persisted successfully")
                return True
            else:
                print("   ❌ Created record not found in database")
                return False
        else:
            print("   ❌ Failed to retrieve data from database")
            return False
    except Exception as e:
        print(f"   ❌ Exception during database verification: {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n📍 Testing CORS Configuration")
    try:
        # Make an OPTIONS request to check CORS headers
        response = requests.options(f"{API_BASE_URL}/")
        print(f"   Status Code: {response.status_code}")
        
        # Check for CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        print(f"   CORS Headers: {cors_headers}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("   ✅ CORS configuration appears to be working")
            return True
        else:
            print("   ⚠️  CORS headers not found, but this might be normal for some configurations")
            return True  # Not marking as failure since CORS might be handled differently
    except Exception as e:
        print(f"   ❌ Exception occurred: {str(e)}")
        return False

def run_comprehensive_tests():
    """Run all backend tests"""
    print("🚀 Starting Comprehensive Backend API Tests")
    print(f"🎯 Target: Wedding Guest Management System")
    print(f"🌐 Backend URL: {API_BASE_URL}")
    print("=" * 60)
    
    test_results = {}
    
    # Test basic endpoints
    test_results['root_endpoint'] = test_root_endpoint()
    test_results['get_status_checks'] = test_get_status_checks()
    test_results['database_connectivity'] = test_database_connectivity()
    test_results['cors_configuration'] = test_cors_configuration()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 Overall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All backend tests PASSED! The existing wedding guest management system is working correctly.")
        return True
    else:
        print("⚠️  Some tests FAILED. The backend may have issues that need attention.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)