from playwright.sync_api import sync_playwright

def verify_worker_history():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming it's running on port 3000)
        page.goto("http://localhost:3000")

        # Wait for the Authenticator to load
        page.wait_for_selector('div[data-amplify-authenticator]')

        # Screenshot the initial state
        page.screenshot(path="verification/01_initial_load.png")

        # Since I cannot easily log in without real credentials in this environment
        # (and creating a user requires backend interaction),
        # I will check if the structure is sound.

        # However, looking at App.tsx, the Dashboard is only rendered INSIDE the Authenticator.
        # {({ signOut, user }) => (
        #   <Dashboard user={user} signOut={signOut} />
        # )}

        # If I can't bypass the authenticator, I can't see the dashboard.
        # I will create a temporary test wrapper to render WorkerHistory directly
        # or render Dashboard with a mock user.

        browser.close()

if __name__ == "__main__":
    verify_worker_history()
