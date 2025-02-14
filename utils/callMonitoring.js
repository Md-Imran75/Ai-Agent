import puppeteer from "puppeteer";

// This function checks if the Google Voice call is still active
export const checkCallStatus = async () => {
  console.log("📡 Checking Google Voice call status...");
  const browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:9222" });

  try {
    const pages = await browser.pages();
    const voicePage = pages.find((page) => page.url().includes("voice.google.com"));

    if (!voicePage) {
      console.log("🚨 Google Voice tab not found. Call may have ended.");
      return false;
    }

    // Check if the "End Call" button is still visible
    const callActive = await voicePage.$('[aria-label="End call"]');
    return callActive !== null;
  } catch (error) {
    console.error("❌ Error checking call status:", error);
    return false;
  } finally {
    await browser.disconnect();
  }
};
