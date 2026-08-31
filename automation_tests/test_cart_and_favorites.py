import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestCartAndFavorites:
    def test_cart_unauthenticated_redirect(self, driver, base_url):
        driver.get(f"{base_url}/cart")
        
        # Wait for redirect to login
        WebDriverWait(driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        assert "/login" in driver.current_url

    def test_favorites_unauthenticated_redirect(self, driver, base_url):
        driver.get(f"{base_url}/favorites")
        
        # Wait for redirect to login
        WebDriverWait(driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        assert "/login" in driver.current_url
