import CanvasApi from "../../api/Canvas.api.js";

import Puppeteer from "../../utils/Puppeteer.js";
import Formatters from "../../utils/Formatters.js";

export default async function listGradebookService(course_id) {
  const { browser, page } = await Puppeteer.startBrowser();

  const { _normandy_session, user_id } = await Puppeteer.loginToCanvas(page);

  const attachment_id = await Puppeteer.gradebookCSVRequest(page, course_id);

  const csvResponse = await CanvasApi.getGradebook(
    _normandy_session,
    user_id,
    attachment_id
  );

  await Puppeteer.closeBrowser(browser);

  const gradesArray = Formatters.csvToArray(csvResponse);

  return gradesArray;
}
