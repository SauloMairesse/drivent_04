import { notFoundError } from "@/errors";
import bookingRepositor from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { enrollmentNotFound, roomIdInvalid, ticketInvalid } from "./error";

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

  const bookingId = await bookingRepositor.createBooking(userId, roomId);

  return bookingId;
}

async function verifyRoom(roomId: number) {
  const room = await roomRepository.findRoomById(roomId);
  const bookingsAlreadyDone = await bookingRepositor.findBookingByRoomId(roomId);

  if(!room || room.capacity >= bookingsAlreadyDone.length ) {
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

async function putBookingService(userId: number, roomId: number) {
  const bookingId = await verifyBooking(userId, roomId);

  await verifyRoom(roomId);

  const booking = await bookingRepositor.updateBooking(bookingId.id, roomId);

  return booking;
}

async function verifyBooking(userId: number, roomId: number) {
  const booking = await bookingRepositor.findBookingByRoomIdAndUserId(userId, roomId);
  if(!booking) {
    throw notFoundError();
  }

  return booking;
}

const bookingService = {
  getBooking,
  postBookingService,
  putBookingService
};

export default bookingService;
