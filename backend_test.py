import requests
import sys
import json
from datetime import datetime

class ScoutManagementAPITester:
    def __init__(self, base_url="https://scoutmanager-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@scout.com", "password": "demo123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
        
        # Test user login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": "user@scout.com", "password": "demo123"}
        )
        if success and 'token' in response:
            self.user_token = response['token']
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@scout.com", "password": "wrong"}
        )
        
        # Test user registration
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@scout.com"
        self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "password": "testpass123",
                "role": "user"
            }
        )

    def test_user_endpoints(self):
        """Test user-related endpoints"""
        print("\n👤 Testing User Endpoints...")
        
        if not self.admin_token:
            self.log_test("User Endpoints", False, "No admin token available")
            return
        
        # Test get current user profile
        self.run_test(
            "Get Current User Profile",
            "GET",
            "users/me",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test get all users (admin only)
        self.run_test(
            "Get All Users (Admin)",
            "GET",
            "users",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test get all users with user token (should fail)
        if self.user_token:
            self.run_test(
                "Get All Users (User - Should Fail)",
                "GET",
                "users",
                403,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

    def test_event_endpoints(self):
        """Test event-related endpoints"""
        print("\n📅 Testing Event Endpoints...")
        
        if not self.admin_token:
            self.log_test("Event Endpoints", False, "No admin token available")
            return
        
        # Test get events
        success, events_response = self.run_test(
            "Get All Events",
            "GET",
            "events",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test create event
        test_event_name = f"Test Event {datetime.now().strftime('%H%M%S')}"
        success, create_response = self.run_test(
            "Create Event (Admin)",
            "POST",
            "events",
            200,
            data={
                "event_name": test_event_name,
                "date": "2025-08-15",
                "description": "Test event for API testing"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test create event with user token (should fail)
        if self.user_token:
            self.run_test(
                "Create Event (User - Should Fail)",
                "POST",
                "events",
                403,
                data={
                    "event_name": "User Event",
                    "date": "2025-08-20",
                    "description": "Should fail"
                },
                headers={"Authorization": f"Bearer {self.user_token}"}
            )
        
        # Test assign user to event
        if success:
            self.run_test(
                "Assign User to Event",
                "POST",
                f"events/{test_event_name}/assign-user",
                200,
                params={"user_email": "user@scout.com"},
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            # Test duplicate assignment (should fail)
            self.run_test(
                "Assign User to Event (Duplicate - Should Fail)",
                "POST",
                f"events/{test_event_name}/assign-user",
                400,
                params={"user_email": "user@scout.com"},
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
        
        # Test join event as admin
        if success:
            self.run_test(
                "Join Event as Admin",
                "POST",
                f"events/{test_event_name}/join",
                200,
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )

    def test_achievement_endpoints(self):
        """Test achievement-related endpoints"""
        print("\n🏆 Testing Achievement Endpoints...")
        
        if not self.admin_token:
            self.log_test("Achievement Endpoints", False, "No admin token available")
            return
        
        # Test add achievement
        test_achievement = f"Test Badge {datetime.now().strftime('%H%M%S')}"
        self.run_test(
            "Add Achievement to User",
            "POST",
            "users/user@scout.com/achievements",
            200,
            data={"achievement": test_achievement},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test add achievement with user token (should fail)
        if self.user_token:
            self.run_test(
                "Add Achievement (User - Should Fail)",
                "POST",
                "users/user@scout.com/achievements",
                403,
                data={"achievement": "Should Fail Badge"},
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

    def test_stats_endpoints(self):
        """Test statistics endpoints"""
        print("\n📊 Testing Statistics Endpoints...")
        
        if not self.admin_token:
            self.log_test("Stats Endpoints", False, "No admin token available")
            return
        
        # Test get stats
        self.run_test(
            "Get Statistics (Admin)",
            "GET",
            "stats",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        # Test get stats with user token (should fail)
        if self.user_token:
            self.run_test(
                "Get Statistics (User - Should Fail)",
                "GET",
                "stats",
                403,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

    def test_unauthorized_access(self):
        """Test unauthorized access scenarios"""
        print("\n🚫 Testing Unauthorized Access...")
        
        # Test accessing protected endpoints without token
        self.run_test(
            "Access Protected Endpoint (No Token)",
            "GET",
            "users/me",
            401
        )
        
        # Test with invalid token
        self.run_test(
            "Access with Invalid Token",
            "GET",
            "users/me",
            401,
            headers={"Authorization": "Bearer invalid_token"}
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Scout Management API Tests...")
        print(f"Testing against: {self.base_url}")
        
        self.test_auth_endpoints()
        self.test_user_endpoints()
        self.test_event_endpoints()
        self.test_achievement_endpoints()
        self.test_stats_endpoints()
        self.test_unauthorized_access()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ScoutManagementAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())