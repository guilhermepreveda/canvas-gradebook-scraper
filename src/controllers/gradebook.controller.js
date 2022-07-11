import AppError, { handleError } from "../errors/AppError.js";

import listJSONGradebookService from "../services/gradebook/listJSONGradebook.service.js";
import listCSVGradebookService from "../services/gradebook/listCSVGradebook.service.js";

import Requests from "../utils/Requests.js";

export default class GradebookController {
  async listCSV(req, res) {
    let signal = AbortSignal.timeout(30000);

    req.on("close", function (err) {
      Requests.cancelRequest();
    });

    try {
      const { course_id } = req.params;

      const gradebook = await listCSVGradebookService(course_id, signal);

      return res.status(200).send(gradebook);
    } catch (error) {
      if (error instanceof AppError) {
        handleError(error, res);
      }
    }
  }

  async listJSON(req, res) {
    const signal = AbortSignal.timeout(30000);

    try {
      if (req.timedout) return;

      const { course_id } = req.params;

      const gradebook = await listJSONGradebookService(course_id, signal);

      return res.status(200).send(gradebook);
    } catch (error) {
      if (error instanceof AppError) {
        handleError(error, res);
      }
    }
  }
}
