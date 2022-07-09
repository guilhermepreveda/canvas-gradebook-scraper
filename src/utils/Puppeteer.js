import puppeteer from "puppeteer";

import AppError from "../errors/AppError.js";
import CanvasApi from "../api/Canvas.api.js";

import { canvasUrl, login, password } from "../config.js";

export default class Puppeteer {
  static selectors = {
    USERNAME_SELECTOR: "#pseudonym_session_unique_id",
    PASSWORD_SELECTOR: "#pseudonym_session_password",
    CTA_SELECTOR: "Button.Button--login",
    DOWNLOAD_BUTTON_SELECTOR: "#content > div > span > a",
  };

  static async startBrowser() {
    // console.log("==== startBrowser() ==========");

    // console.log("1. Starting browser");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    // console.log("2. Starting new page");
    const page = await browser.newPage();

    // console.log("3. Returning browser and page");
    return { browser, page };
  }

  static async closeBrowser(browser) {
    // console.log("==== closeBrowser(browser) ==========");

    // console.log("1. Closing browser");
    await browser.close();
  }

  static async loginToCanvas(page) {
    // console.log("==== loginToCanvas(page) ==========");

    try {
      // console.log("1. Going to login page");
      await page.goto(`${canvasUrl}/login`);

      // console.log("2. Selecting login input");
      await page.click(Puppeteer.selectors.USERNAME_SELECTOR);

      // console.log("3. Typing the login");
      await page.keyboard.type(login);

      // console.log("4. Selecting password input");
      await page.click(Puppeteer.selectors.PASSWORD_SELECTOR);

      // console.log("5. Typing the password");
      await page.keyboard.type(password);

      // console.log("6. Waiting for Promise");
      await Promise.all([
        // console.log("6.1. Clicking the login button"),
        page.click(Puppeteer.selectors.CTA_SELECTOR),

        //console.log("6.2. Waiting for the page to load"),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);

      // console.log("7. Getting the cookies from the page");
      const cookies = await page.cookies();

      // console.log("8. Finding the _normandy_session cookie");
      const _normandy_session = cookies.find(
        ({ name }) => name === "_normandy_session"
      );

      // console.log("9. Checking if the _normandy_session cookie exists");
      if (!_normandy_session) {
        throw Error;
      }

      // console.log(
      //   "10. Calling the CanvasApi.getUserId(_normandy_session.value) method"
      // );
      const user_id = await CanvasApi.getUserId(_normandy_session.value);

      // console.log("11. Taking a screenshot of the page");
      // await page.screenshot({ path: "./src/screenshots/loginPage.png" });

      // console.log("12. Returning _normandy_session and user_id");
      return { _normandy_session, user_id };
    } catch (err) {
      // console.log("> An error has occurred");
      throw new AppError("Login failed", 400);
    }
  }

  static async gradebookCSVRequest(page, course_id) {
    // console.log("==== gradebookCSVRequest(page, course_id) ==========");

    try {
      // console.log("1. Going to gradebook CSV request page");
      await page.goto(`${canvasUrl}/courses/${course_id}/gradebook_csv`);

      // console.log("2. Evaluating gradebook CSV request page");
      const requestJSON = await page.evaluate(() => {
        // console.log("2.1. Selecting and formatting the page response");

        // 1 => while(1);{"attachment_id":25684,"progress_id":2253}
        // 2 => ["while(1)", "{"attachment_id":25684,"progress_id":2253}"]
        // 3 => "{"attachment_id":25684,"progress_id":2253}"
        const response = document.querySelector("pre").innerText.split(";")[1];

        // console.log("2.2. Converting and returning the page response to JSON formatting");

        // 4 => {"attachment_id":25684,"progress_id":2253}
        return JSON.parse(response);
      });

      // console.log("3. Taking a screenshot of the page");
      await page.screenshot({ path: "./src/screenshots/csvRequestPage.png" });

      // console.log("4. Returning requestJSON.attachment_id");
      return requestJSON.attachment_id;
    } catch (err) {
      // console.log("> An error has occurred");
      throw new AppError("Course not found", 404);
    }
  }
}
