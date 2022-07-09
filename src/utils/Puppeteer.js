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
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    return { browser, page };
  }

  static async closeBrowser(browser) {
    return browser.close();
  }

  static async loginToCanvas(page) {
    try {
      await page.goto(`${canvasUrl}/login`);

      await page.click(Puppeteer.selectors.USERNAME_SELECTOR);
      await page.keyboard.type(login);

      await page.click(Puppeteer.selectors.PASSWORD_SELECTOR);
      await page.keyboard.type(password);

      await Promise.all([
        page.click(Puppeteer.selectors.CTA_SELECTOR),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);

      const cookies = await page.cookies();

      const _normandy_session = cookies.find(
        ({ name }) => name === "_normandy_session"
      );

      if (!_normandy_session) {
        throw Error;
      }

      const user_id = await CanvasApi.getUserId(_normandy_session.value);

      // await page.screenshot({ path: "./src/screenshots/loginPage.png" });

      return { _normandy_session, user_id };
    } catch (err) {
      throw new AppError("Login failed", 400);
    }
  }

  static async gradebookCSVRequest(page, course_id) {
    try {
      await page.goto(`${canvasUrl}/courses/${course_id}/gradebook_csv`);

      const requestJSON = await page.evaluate(() => {
        // 1 => while(1);{"attachment_id":25684,"progress_id":2253}
        // 2 => ["while(1)", "{"attachment_id":25684,"progress_id":2253}"]
        // 3 => "{"attachment_id":25684,"progress_id":2253}"
        const response = document.querySelector("pre").innerText.split(";")[1];

        // 4 => {"attachment_id":25684,"progress_id":2253}
        return JSON.parse(response);
      });

      await page.screenshot({ path: "./src/screenshots/csvRequestPage.png" });

      return requestJSON.attachment_id;
    } catch (err) {
      throw new AppError("Course not found", 404);
    }
  }
}
