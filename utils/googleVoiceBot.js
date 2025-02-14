
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;


import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { captureAudio } from "./audioCapture.js";
import { startRealTimeCall } from "./realTimeCall.js";

dotenv.config();

export const initiateCall = async (phoneNumber, assistant) => {
  console.log(`📞 Initiating call to: ${phoneNumber}`);

  const browser = await puppeteer.launch({
    headless: false, // Open in normal mode for debugging
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Use the actual Chrome browser
    userDataDir: "C:\\Users\\studo\\Downloads\\Chrome\\User Data\\Profile 1", // Path to your Chrome profile
    args: [
      "--use-fake-ui-for-media-stream",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to Google Voice...");
    await page.goto("https://voice.google.com/u/0/calls", { waitUntil: "networkidle2" });

    // Use a stable selector
    const inputSelector = 'input[placeholder="Enter a name or number"]';
    console.log("⏳ Waiting for the dialer input field...");
    await page.waitForSelector(inputSelector, { visible: true, timeout: 60000 });

    console.log("📞 Dialer field is ready. Typing the phone number...");
    await page.type(inputSelector, phoneNumber);

    console.log("📞 Pressing Enter to initiate the call...");
    await page.keyboard.press("Enter");
    // Wait for the call to connect
    console.log("📞 Waiting for the call to connect...");

    // Wait for a few seconds to let the call start
    await new Promise(resolve => setTimeout(resolve, 9000));
    // captureAudio(assistant);

    startRealTimeCall(assistant);

    console.log(`✅ Call to ${phoneNumber} initiated successfully!`);

    // **Keep browser open until the call ends**
    console.log("⏳ Waiting for the call to end...");
    await page.waitForFunction(() => {
      return !document.querySelector('div[aria-label="End call"]');
    }, { timeout: 600000 }); // Wait up to 10 minutes for the call to end

    console.log("📞 Call ended. Closing browser...");
    // await browser.close();
  } catch (error) {
    console.error("❌ Google Voice automation failed:", error);
    // await browser.close();
    throw new Error("Google Voice automation failed");
  } 
};

