import pytest
import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAIVerification:
    def test_ai_verification_upload_workflow(self, driver, base_url):
        # We need to access /sell, which is protected.
        # Authenticate using an existing valid test account (seller@example.com) seeded from seed_db.py
        driver.get(f"{base_url}/login")
        
        email_input = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//input[@type='email']"))
        )
        # React race condition mitigation
        time.sleep(1)
        email_input.clear()
        email_input.send_keys("jagodasewmini@gmail.com")
        
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")
        password_input.clear()
        password_input.send_keys("123456")
        
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_btn.click()
        
        # Wait to see if we redirect OR if an error appears
        try:
            WebDriverWait(driver, 10).until(
                lambda d: "/login" not in d.current_url
            )
        except Exception:
            # Login failed for this credential
            try:
                error_el = driver.find_element(By.XPATH, "//*[contains(@class, 'text-red-700')]")
                pytest.fail(f"Login failed: {error_el.text}. Database may not be seeded.")
            except:
                pytest.fail("Login failed: Unknown error (no redirect, no error message)")

        # Navigate to Sell page
        driver.get(f"{base_url}/sell")
        
        time.sleep(1) # Allow redirect to happen
        if "login" in driver.current_url or "signin" in driver.current_url.lower():
            pytest.fail("Authentication failed or not persisted. Cannot access /sell.")
            
        # STEP 1: Fill out the initial gem form (Shape is required to proceed)
        try:
            shape_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Round')] | //button[contains(., 'Oval')] | //button[contains(., 'Brilliant')]"))
            )
            time.sleep(0.5) # ensure UI is ready
            shape_button.click()
            
            next_btn_1 = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
            next_btn_1.click()
            
            # STEP 2: Fill out dimensions and carat, price
            length_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Length']")))
            length_input.send_keys("5")
            driver.find_element(By.XPATH, "//input[@placeholder='Width']").send_keys("5")
            driver.find_element(By.XPATH, "//input[@placeholder='Height']").send_keys("3")
            driver.find_element(By.XPATH, "//input[contains(@placeholder, 'e.g. 4.25')]").send_keys("1.5")
            driver.find_element(By.XPATH, "//input[contains(@placeholder, 'e.g. 1500')]").send_keys("1000")
            
            next_btn_2 = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
            next_btn_2.click()
            
            # STEP 3: The AI Upload workflow
            sunlight_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(., 'Sunlight Image')]//input[@type='file']"))
            )
            
            # Construct absolute path to the test image
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            test_image_path = os.path.join(project_root, "frontend", "public", "images", "hero_rough.png")
            assert os.path.exists(test_image_path), "Test image hero_rough.png not found!"
            
            # Upload the image
            sunlight_input.send_keys(test_image_path)
            
            # Verify AI loading state appears
            ai_loading = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'AI is verifying image') or contains(text(), 'Analyzing image...')]"))
            )
            assert ai_loading.is_displayed()
            
            # Wait for verification to complete
            result_element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Gemstone Detected') or contains(text(), 'Not a Gemstone') or contains(text(), 'AI Verification Failed')]"))
            )
            assert result_element.is_displayed()
            
            if "Detected" in result_element.text:
                heatmap_toggle = driver.find_element(By.XPATH, "//button[contains(text(), 'AI View')]")
                assert heatmap_toggle.is_displayed()

        except Exception as e:
            pytest.fail(f"AI Verification workflow failed: {str(e)}")
