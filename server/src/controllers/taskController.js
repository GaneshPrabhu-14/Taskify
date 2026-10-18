import mongoose from "mongoose";
import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const taskFields = ["title", "description", "status", "priority", "dueDate", "tags"];

function pickTaskFields(body) {
  return Object.fromEntries(
    taskFields
      .filter((field) => field in body)
      .map((field) => [field, body[field]])
  );
}

function isValidTaskInput(body) {
  if (
    "title" in body &&
    (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 120)
  ) return false;
  if (
    "description" in body &&
    (typeof body.description !== "string" || body.description.length > 2000)
  ) return false;
  if (
    "status" in body &&
    !["todo", "in-progress", "completed"].includes(body.status)
  ) return false;
  if ("priority" in body && !["low", "medium", "high"].includes(body.priority)) return false;
  if (
    "tags" in body &&
    (!Array.isArray(body.tags) ||
      body.tags.length > 10 ||
      body.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.trim().length > 30))
  ) return false;
  if (
    "dueDate" in body &&
    body.dueDate !== null &&
    (typeof body.dueDate !== "string" || Number.isNaN(Date.parse(body.dueDate)))
  ) return false;
  return true;
}

export const listTasks = asyncHandler(async (req, res) => {
  const query = { owner: req.user.id };
  const { status, priority, search } = req.query;

  if (status && !["todo", "in-progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "The supplied task status filter is invalid." });
  }
  if (priority && !["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({ message: "The supplied task priority filter is invalid." });
  }
  if (search !== undefined && (typeof search !== "string" || search.length > 100)) {
    return res.status(400).json({ message: "Search must be a string of at most 100 characters." });
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Provide a valid JSON object." });
  }
  if (!isValidTaskInput(req.body) || typeof req.body.title !== "string") {
    return res.status(400).json({ message: "Provide a valid task title and task fields." });
  }
  const task = await Task.create({ ...pickTaskFields(req.body), owner: req.user.id });
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The supplied task ID is invalid." });
  }
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    !isValidTaskInput(req.body) ||
    Object.keys(pickTaskFields(req.body)).length === 0
  ) {
    return res.status(400).json({ message: "Provide at least one valid task field to update." });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: pickTaskFields(req.body) },
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The supplied task ID is invalid." });
  }
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ message: "Task deleted successfully." });
});
