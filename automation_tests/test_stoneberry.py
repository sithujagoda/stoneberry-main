import time
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


BASE_URL = "http://localhost:3000"


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(options=options)

    yield driver

    driver.quit()


def test_gemstone_catalog_loads(driver):
    """Verify that the gemstone catalog page loads."""

    driver.get(f"{BASE_URL}/gemstones")

    wait = WebDriverWait(driver, 15)

    # Wait for page to load
    wait.until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(2)

    print("\nCurrent URL:", driver.current_url)
    print("Page title:", driver.title)

    # Make sure we didn't get a completely blank/error page
    assert driver.current_url.startswith(BASE_URL)

    # Find image elements
    images = driver.find_elements(By.TAG_NAME, "img")

    print("Images found:", len(images))

    assert len(images) > 0, "No images were found on the gemstone page"


def test_gemstone_images_load(driver):
    """Verify gemstone images actually load in the browser."""

    driver.get(f"{BASE_URL}/gemstones")

    wait = WebDriverWait(driver, 15)

    wait.until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(3)

    images = driver.find_elements(By.TAG_NAME, "img")

    assert len(images) > 0, "No gemstone images found"

    loaded_images = 0
    broken_images = 0

    for index, image in enumerate(images):
        src = image.get_attribute("src")

        if not src:
            print(f"Image {index}: no src")
            broken_images += 1
            continue

        is_loaded = driver.execute_script(
            """
            return arguments[0].complete &&
                   arguments[0].naturalWidth > 0;
            """,
            image,
        )

        print(
            f"Image {index}: "
            f"{'LOADED' if is_loaded else 'BROKEN'} "
            f"{src}"
        )

        if is_loaded:
            loaded_images += 1
        else:
            broken_images += 1

    print("\nLoaded images:", loaded_images)
    print("Broken images:", broken_images)

    assert loaded_images > 0, "No images successfully loaded"


def test_open_gemstone(driver):
    """Verify that clicking a gemstone opens its detail page."""

    driver.get(f"{BASE_URL}/gemstones")

    wait = WebDriverWait(driver, 15)

    wait.until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(3)

    # Look for links that point to gemstone detail pages
    gemstone_links = driver.find_elements(
        By.CSS_SELECTOR,
        'a[href*="/gems/"]'
    )

    print("\nGemstone links found:", len(gemstone_links))

    assert len(gemstone_links) > 0, (
        "No gemstone detail links were found"
    )

    first_link = gemstone_links[0]

    href = first_link.get_attribute("href")

    print("Opening:", href)

    driver.execute_script(
        "arguments[0].scrollIntoView({block: 'center'});",
        first_link,
    )

    time.sleep(1)

    driver.execute_script(
        "arguments[0].click();",
        first_link,
    )

    wait.until(
        lambda d: "/gems/" in d.current_url
    )

    print("Detail page:", driver.current_url)

    assert "/gems/" in driver.current_url


def test_gemstone_detail_image(driver):
    """Verify gemstone detail page contains a successfully loaded image."""

    driver.get(f"{BASE_URL}/gems/3")

    wait = WebDriverWait(driver, 15)

    wait.until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(3)

    print("\nDetail page:", driver.current_url)

    # Make sure the old error page isn't displayed
    page_text = driver.find_element(By.TAG_NAME, "body").text

    assert "Error Sourcing Gem" not in page_text, (
        "Gemstone detail page shows 'Error Sourcing Gem'"
    )

    images = driver.find_elements(By.TAG_NAME, "img")

    print("Detail page images:", len(images))

    loaded_images = []

    for image in images:
        src = image.get_attribute("src")

        if not src:
            continue

        is_loaded = driver.execute_script(
            """
            return arguments[0].complete &&
                   arguments[0].naturalWidth > 0;
            """,
            image,
        )

        if is_loaded:
            loaded_images.append(src)

    print("Successfully loaded detail images:")

    for src in loaded_images:
        print("  ", src)

    assert len(loaded_images) > 0, (
        "No gemstone images successfully loaded on detail page"
    )