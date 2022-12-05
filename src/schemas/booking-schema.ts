import Joi from "joi";

export const postBodyBooking = Joi.object({
  roomId: Joi.number().greater(0).integer().required()
});
