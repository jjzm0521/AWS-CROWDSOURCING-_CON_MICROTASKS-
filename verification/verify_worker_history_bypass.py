from playwright.sync_api import sync_playwright

def verify_worker_history():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        # Navigate to the app (assuming it's running on port 3000)
        page.goto("http://localhost:3000")

        # Wait for the Dashboard to load (look for "Soy Worker")
        page.wait_for_selector('text=Soy Worker')

        # Try to hide the overlay if it exists
        page.add_style_tag(content="#webpack-dev-server-client-overlay { display: none !important; }")

        # Click on "Historial"
        page.click('text=Historial')

        # Wait for the history table to appear (look for "Historial de Trabajo")
        page.wait_for_selector('text=Historial de Trabajo')

        # Screenshot the history view
        page.screenshot(path="verification/02_worker_history.png")

        browser.close()

if __name__ == "__main__":
    verify_worker_history()
