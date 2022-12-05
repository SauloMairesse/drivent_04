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
  }
}

export async function postBookingController(req: AuthenticatedRequest, res: Response) {
  const roomId: number  = req.body.roomId;
  const { userId } = req;

  try {
    const booking = await bookingService.postBookingService(userId, roomId);

    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "roomIdInvalid") {
      return res.status(httpStatus.FORBIDDEN).send(error);
    }
    if (error.name === "enrollmentOfUserNotFound") {
      return res.status(httpStatus.FORBIDDEN).send(error);
    }
    if (error.name === "ticketInvalid") {
      return res.status(httpStatus.FORBIDDEN).send(error);
    }
  }
}

export async function putBookingController(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = req.params.bookingId;
  const { roomId } = req.body;

  try {
    const booking = await bookingService.putBookingService(userId, Number(bookingId), Number(roomId));
    return res.status(httpStatus.OK).send({ bookingId: booking.id } );
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "bookingDoesNotBelongToUser") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    if (error.name === "roomIdInvalid") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (error.name === "bookingIdInvalid") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
  }
}
