import { Router } from "express";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.route("/").get(listTasks).post(createTask);
router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
