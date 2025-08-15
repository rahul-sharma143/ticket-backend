import Joi from "joi";

export const validateCreateShow = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    start_time: Joi.date().iso().min("now").required(),
    total_seats: Joi.number().integer().min(1).max(10000).required(),
    price: Joi.number().positive().required(),
    type: Joi.string().valid("trip", "show").optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details[0].message,
    });
  }

  next();
};

export const validateCreateBooking = (req, res, next) => {
  const schema = Joi.object({
    showId: Joi.number().integer().positive().required(),
    seatsRequested: Joi.number().integer().min(1).max(50).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details[0].message,
    });
  }

  next();
};

export const validateBookingId = (req, res, next) => {
  const schema = Joi.object({
    bookingId: Joi.string().uuid().required(),
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID format",
    });
  }

  next();
};
