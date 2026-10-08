export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          code: issue.code || "Unknown",
          field: issue.path.join(".") || "Unknown",
          message: issue.message || "Unknown",
        })),
      });
    }

    req.validate = result.data;

    next();
  };
};
