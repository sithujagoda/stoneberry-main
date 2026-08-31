import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestHomePage:
    def test_homepage_loads(self, driver, base_url):
        driver.get(base_url)
        # Verify title or key hero text
        assert "Stoneberry" in driver.title or driver.title == ""
        
        # Verify hero text
        hero_text = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'STONEBERRY GEM CO.')]"))
        )
        assert hero_text.is_displayed()

    def test_shop_now_navigation(self, driver, base_url):
        driver.get(base_url)
        shop_now_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Shop Now') or contains(., 'Shop Now')]"))
        )
        shop_now_btn.click()
        
        # Verify URL changed to /gems
        WebDriverWait(driver, 10).until(EC.url_contains("/gems"))
        assert "/gems" in driver.current_url

    def test_filter_tabs(self, driver, base_url):
        driver.get(base_url)
        # Click on 'Ruby' tab
        ruby_tab = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Ruby']"))
        )
        ruby_tab.click()
        
        # Verify the tab becomes active (black bg)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[text()='Ruby' and contains(@class, 'bg-black')]"))
        )
        assert "bg-black" in ruby_tab.get_attribute("class")
