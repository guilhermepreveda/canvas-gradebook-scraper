import CanvasApi from "../../api/Canvas.api.js";

import Puppeteer from "../../utils/Puppeteer.js";
import Formatters from "../../utils/Formatters.js";

export default async function listGradebookService(course_id) {
  // console.log("==== listGradebookService(course_id) ==========");

  // console.log("1. Starting browser with Puppeteer.startBrowser()");
  const { browser, page } = await Puppeteer.startBrowser();

  // console.log("2. Logging to Canvas with Puppeteer.loginToCanvas(page)");
  const { _normandy_session, user_id } = await Puppeteer.loginToCanvas(page);

  // console.log("3. Requesting a csv gradebook generation with Puppeteer.gradebookCSVRequest(page, course_id)");
  const attachment_id = await Puppeteer.gradebookCSVRequest(page, course_id);

  // console.log("4. Getting the csv gradebook with CanvasApi.getGradebook(_normandy_session, user_id, attachment_id)");
  const csvResponse = await CanvasApi.getGradebook(
    _normandy_session,
    user_id,
    attachment_id
  );

  // console.log("5. Closing browser with Puppeteer.closeBrowser(browser)");
  await Puppeteer.closeBrowser(browser);

  // console.log("6. Converting the gradebook csv to array with Formatters.csvToArray(csvResponse)");
  const gradesArray = Formatters.csvToArray(csvResponse);

  // console.log("7. Returning the gradebook array to the user;
  return gradesArray;
}
