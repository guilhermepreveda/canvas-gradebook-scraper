import puppeteer from "puppeteer";
import fetch from "node-fetch";

import AppError from "../errors/AppError.js";
import CanvasApi from "../api/Canvas.api.js";

import { canvasUrl, login, password } from "../config.js";

export default class Puppeteer {
  static selectors = {
    USERNAME_SELECTOR: "#pseudonym_session_unique_id",
    PASSWORD_SELECTOR: "#pseudonym_session_password",
    CTA_SELECTOR: ".Button.Button--login",
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
        ({ name }) => name === "_normandy_session" || "_legacy_normandy_session"
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

  static async gradebookCSVRequest(course_id) {
    try {
      // console.log("1. Going to gradebook CSV request page");
      const response = await fetch(
        `${canvasUrl}/courses/${course_id}/gradebook_csv`,
        {
          headers: {
            accept:
              "application/json+canvas-string-ids, application/json, text/plain, */*",
            "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua":
              '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-csrf-token":
              "hcjM9nWxcV6v/V2FVBl/AWejowUTTpASGRh/qkBq35C9poauNtgrHZfJMNcyeDxlLenZcld8yWttYRLfBQWR4g==",
            "x-requested-with": "XMLHttpRequest",
            cookie:
              "_legacy_normandy_session=vcRHoOREJCFwVLSOOrD8fA+yRuOHXtTyVuQDm9VeFngKBOCZdCjXJBQPkBN7nRGyP4jWkcE3Lzjbwa82qhHn98jSQ5qW8Rau5R0Aiy8Iu0zjCQDlfsKlSHzBlucPsWSDKbLj3Ied1xvwmAy1ZDiXRAigaT6acvu8v7F9Prazjd6OpUt3Wq8WCP82M8kJN8fwPT9IETr4kXs1Wan8UqdTYYFpNTUWPPYHMK33Uw5JoNonp0RYYrtxm_2PCjaDUdjo6I_35xn8cMXxM5uL8b4YIuAwK8V_adlz1jIJVS5s0ffIFUDpHG8zhc6285wnoDyRkts3fs-_szH7ztyVgFqHVAi_3B9A6ke0cwOPnS5h5jbuq1CxJ8PkAjka8sNfbj7YfzvWtTKbQkC6S5Yjr9xc6IkiQbIfPVFL8Fmom8p4DTQor_nRHB_8jGT_GYgjhK7Lay7OJwd81KRTQ-2kq0thM22Xfojz1qxwK2KZqncmwEsqYl9SbUDRRXR9utr0nV1YydpVEHPqXV4C3ng3BqnznK_.TilF6UUgHwcsslHx_BXXhslP680.YtoDkw; _csrf_token=hcjM9nWxcV6v%2FV2FVBl%2FAWejowUTTpASGRh%2FqkBq35C9poauNtgrHZfJMNcyeDxlLenZcld8yWttYRLfBQWR4g%3D%3D",
            Referer: `${canvasUrl}/courses/${course_id}/gradebook`,
            "Referrer-Policy": "no-referrer-when-downgrade",
          },
          method: "POST",
        }
      );

      const responseJSON = await response.json();

      return responseJSON.attachment_id;
    } catch (err) {
      // console.log("> An error has occurred");
      throw new AppError("Course not found", 404);
    }
  }
}
