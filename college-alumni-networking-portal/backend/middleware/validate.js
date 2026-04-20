/**
 * Express middleware factory for Joi schemas.
 * Validates req[property] and assigns validated value back.
 */
export const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({ message });
    }
    req[property] = value;
    return next();
  };
