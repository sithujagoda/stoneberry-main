import pytest
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestGemsPages:

    def test_gem_catalog_loads(self, driver, base_url):
        driver.get(f"{base_url}/gems")

        # Wait until at least one real gemstone link is available
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//a[contains(@href, '/gems/')]"
                )
            )
        )

        links = driver.find_elements(
            By.XPATH,
            "//a[contains(@href, '/gems/')]"
        )

        assert len(links) > 0


    def test_gem_search_and_filter(self, driver, base_url):
        driver.get(f"{base_url}/gems/browse")

        try:
            # Search icon in navbar
            search_icon = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (
                        By.XPATH,
                        "//button[@title='Search Gemstones' or @title='Search']"
                    )
                )
            )

            search_icon.click()

            # Search input
            search_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//input[contains(@placeholder, 'Search gems')]"
                    )
                )
            )

            search_input.clear()
            search_input.send_keys("Sapphire")

            # Submit search
            search_input.submit()

            # Allow UI to update
            time.sleep(2)

            # Verify search banner
            search_banner = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//*[contains(text(), 'Searching for:')]"
                    )
                )
            )

            assert "Sapphire" in search_banner.text

        except Exception as e:
            pytest.fail(f"Search workflow failed: {str(e)}")


    def test_gem_details_and_tes(self, driver, base_url):

        # Open gemstone catalog
        driver.get(f"{base_url}/gems")

        # Wait for an actual gemstone link.
        # Exclude /gems/browse because that is the catalog page.
        gem_link = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//a[contains(@href, '/gems/') and "
                    "not(contains(@href, '/gems/browse'))]"
                )
            )
        )

        # Get the actual gemstone URL
        gem_url = gem_link.get_attribute("href")

        print(f"\nOpening gemstone: {gem_url}")

        assert gem_url is not None
        assert "/gems/" in gem_url

        # Open the actual gemstone
        driver.get(gem_url)

        # Wait for page to finish loading
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script(
                "return document.readyState"
            ) == "complete"
        )

        print("Gem detail page:", driver.current_url)

        # Get visible page text
        body_text = driver.find_element(
            By.TAG_NAME,
            "body"
        ).text

        assert len(body_text.strip()) > 0

        # Look for Trust Evidence Score
        tes_elements = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Trust Evidence Score')]"
        )

        # Look for Add to Cart
        cart_elements = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Add to Cart')]"
        )

        print(
            f"Trust Evidence Score elements: {len(tes_elements)}"
        )

        print(
            f"Add to Cart elements: {len(cart_elements)}"
        )

        # At least one expected detail-page feature should exist
        assert len(tes_elements) > 0 or len(cart_elements) > 0, (
            "Gem detail page loaded, but neither "
            "'Trust Evidence Score' nor 'Add to Cart' "
            "was found."
        )