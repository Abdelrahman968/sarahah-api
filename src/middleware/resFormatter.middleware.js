export const resFormatter = (_req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    return originalJson({ ...data });
  };

  next();
};
