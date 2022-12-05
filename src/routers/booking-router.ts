import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { postBodyBooking } from "@/schemas/booking-schema";
import { getBookingController, postBookingController, putBookingController } from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken )
  .get("/", getBookingController )
  .post("/", validateBody(postBodyBooking), postBookingController )
  .put("/:bookingId", validateBody(postBodyBooking), putBookingController );
export { bookingRouter };
