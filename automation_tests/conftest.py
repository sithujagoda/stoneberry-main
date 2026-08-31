import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:3000"

@pytest.fixture(scope="function")
def driver():
    """
    Setup Chrome WebDriver for testing.
    Keeps browser visible as per user's request.
    """
    options = Options()
    # options.add_argument("--headless=new") # Disabled for visible observation
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10) # 10 seconds implicit wait for elements to appear
    
    yield driver
    
    driver.quit()
