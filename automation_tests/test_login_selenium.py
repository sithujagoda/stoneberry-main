import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_seller_login(driver, base_url):

    driver.get(f"{base_url}/login")

    wait = WebDriverWait(driver, 20)

    print("\nStarting seller login test...")
    print("Initial URL:", driver.current_url)

    # Email
    email_input = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//input[@type='email']")
        )
    )

    email_input.clear()
    email_input.send_keys("jagodasewmini@gmail.com")

    # Password
    password_input = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//input[@type='password']")
        )
    )

    password_input.clear()
    password_input.send_keys("123456")

    print("Email entered.")
    print("Password entered.")

    # Submit
    submit_button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit']")
        )
    )

    submit_button.click()

    print("Login button clicked.")

    # Give React/NextAuth time to process the request
    time.sleep(3)

    print("URL after login:", driver.current_url)

    # Check whether an error message appeared
    error_elements = driver.find_elements(
        By.XPATH,
        "//*[contains(@class, 'text-red-700')]"
    )

    if error_elements:
        for error in error_elements:
            if error.is_displayed() and error.text.strip():
                print("LOGIN ERROR:", error.text)

    # Wait up to 20 seconds for login to leave /login
    try:
        wait.until(
            lambda d: "/login" not in d.current_url
        )
    except Exception:
        print("\nLogin did not redirect within 20 seconds.")
        print("Final URL:", driver.current_url)

        # Print visible page text to help diagnose
        print("\nVisible page text:")
        print(driver.find_element(By.TAG_NAME, "body").text)

        # Take screenshot
        driver.save_screenshot(
            "selenium_login_failure.png"
        )

        pytest.fail(
            f"Seller login did not complete. "
            f"Final URL: {driver.current_url}"
        )

    print("\nLOGIN SUCCESS")
    print("Final URL:", driver.current_url)

    assert "/login" not in driver.current_url