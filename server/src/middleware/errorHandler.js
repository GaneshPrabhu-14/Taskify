export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be a valid JSON object." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: messages.join(" ") });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "The supplied resource ID is invalid." });
  }

  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred." });
}
