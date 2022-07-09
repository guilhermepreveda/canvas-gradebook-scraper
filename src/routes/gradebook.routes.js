import { Router } from "express";

import GradebookController from "../controllers/gradebook.controller.js";

const gradebookController = new GradebookController();

const gradebookRoutes = Router();

gradebookRoutes.get("/:course_id", gradebookController.list);

export default gradebookRoutes;
