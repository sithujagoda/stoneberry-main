import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAuthPages:
    def test_login_validation_errors(self, driver, base_url):
        driver.get(f"{base_url}/login")
        
        # Ensure form is loaded
        submit_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
        )
        
        # We can't actually trigger HTML5 required errors via simple .click() sometimes without JS, 
        # but let's just make sure the inputs exist and are required.
        email_input = driver.find_element(By.XPATH, "//input[@type='email']")
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")
        
        assert email_input.get_attribute("required") is not None
        assert password_input.get_attribute("required") is not None
        
        # Attempt to fill with invalid email to trigger form validation
        email_input.send_keys("invalid_email")
        submit_btn.click()
        
        # The browser should prevent submission, we verify we are still on login page
        assert "/login" in driver.current_url

    def test_register_validation_errors(self, driver, base_url):
        driver.get(f"{base_url}/register")
        
        # Find required inputs
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
        )
        password_input = driver.find_element(By.XPATH, "//input[@type='password' and @placeholder='Your Password']")
        
        assert email_input.get_attribute("required") is not None
        assert password_input.get_attribute("required") is not None
        
    def test_protected_routes_redirect(self, driver, base_url):
        # Array of routes that should redirect unauthenticated users to /login
        protected_routes = ["/sell", "/messages", "/profile", "/notifications"]
        
        for route in protected_routes:
            driver.get(f"{base_url}{route}")
            
            # Since we are not logged in, it should redirect to login
            # Check if URL contains 'login' or wait for redirect
            WebDriverWait(driver, 10).until(
                lambda d: "/login" in d.current_url or "api/auth/signin" in d.current_url
            )
            assert "login" in driver.current_url.lower() or "signin" in driver.current_url.lower()
