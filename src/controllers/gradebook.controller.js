import AppError, { handleError } from "../errors/AppError.js";

import listGradebookService from "../services/gradebook/listGradebook.service.js";

export default class GradebookController {
  async list(req, res) {
    try {
      const { course_id } = req.params;

      const gradebook = await listGradebookService(course_id);

      return res.status(200).send(gradebook);
    } catch (error) {
      if (error instanceof AppError) {
        handleError(error, res);
      }
    }
  }
}
