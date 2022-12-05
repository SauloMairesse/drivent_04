import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service.ts";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBookingController(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function postBookingController(req: AuthenticatedRequest, res: Response) {
  const roomId: number  = req.body.roomId;
  const { userId } = req;

  try {
    const bookingId = await bookingService.postBookingService(userId, roomId);

    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    if (error.name === "roomIdInvalid") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "enrolllmentOfUserNotFound") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "ticketInvalid") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function putBookingController(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const variable = await bookingService.putBookingService(userId, roomId);

    return res.status(httpStatus.OK).send(variable);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "roomIdInvalid") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
