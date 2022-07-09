import AppError, { handleError } from "../errors/AppError.js";

import listJSONGradebookService from "../services/gradebook/listJSONGradebook.service.js";
import listCSVGradebookService from "../services/gradebook/listCSVGradebook.service.js";

export default class GradebookController {
  async listCSV(req, res) {
    try {
      const { course_id } = req.params;

      const gradebook = await listCSVGradebookService(course_id);

      return res.status(200).send(gradebook);
    } catch (error) {
      if (error instanceof AppError) {
        handleError(error, res);
      }
    }
  }

  async listJSON(req, res) {
    try {
      const { course_id } = req.params;

      const gradebook = await listJSONGradebookService(course_id);

      return res.status(200).send(gradebook);
    } catch (error) {
      if (error instanceof AppError) {
        handleError(error, res);
      }
    }
  }
}
