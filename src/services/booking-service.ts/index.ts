import { notFoundError } from "@/errors";
import bookingRepositor from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { BAD_REQUEST } from "http-status";
import { bookingDoesNotBelongToUser, bookingIdInvalid, enrollmentNotFound, roomIdInvalid, ticketInvalid } from "./error";

async function getBooking(userId: number) {
  const booking = await bookingRepositor.findBookingByUserId(userId);
  
  if(!booking) { 
    throw notFoundError();
  }

  return { 
    id: booking.id,
    Room: booking.Room
  };
}

async function postBookingService(userId: number, roomId: number) {
  await verifyRoom(roomId);
  await verifyTicketOfUser(userId);

  const booking = await bookingRepositor.createBooking(userId, roomId);

  return booking;
}

async function verifyRoom(roomId: number) {
  const room = await roomRepository.findRoomById(roomId);
  if(!room) {
    throw notFoundError();
  }

  const bookingsAlreadyDone = await bookingRepositor.findBookingByRoomId(roomId);
  if( room.capacity <= bookingsAlreadyDone.length ) {
    throw roomIdInvalid();
  }
}

async function verifyTicketOfUser(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) { 
    throw enrollmentNotFound(); 
  }

  const ticket = await ticketRepository.getTicketWithTypeByEnrollmentId(enrollment.id);
  if(!ticket || ticket.TicketType.includesHotel !== true || ticket.TicketType.isRemote !== false || ticket.status !== "PAID") {
    throw ticketInvalid();
  }
}

async function putBookingService(userId: number, bookingId: number, roomId: number) {
  await verifyBooking(bookingId, userId);
  await verifyRoom(roomId);

  const booking = await bookingRepositor.updateBooking(bookingId, roomId);

  return booking;
}

async function verifyBooking(bookingId: number, userId: number) {
  if(bookingId <= 0 ) {
    throw bookingIdInvalid();
  }

  const booking = await bookingRepositor.findBookingById(bookingId);
  
  if(!booking) {
    throw notFoundError();
  }
  if(booking.userId !== userId) {
    throw bookingDoesNotBelongToUser();
  }
}

const bookingService = {
  getBooking,
  postBookingService,
  putBookingService
};

export default bookingService;
