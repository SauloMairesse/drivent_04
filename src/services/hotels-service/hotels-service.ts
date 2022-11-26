import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository, { CreateEnrollmentParams } from "@/repositories/enrollment-repository";
import { notFoundError } from "@/errors";
import { Console } from "console";

async function getHotelsList(userId: number) {
  console.log("\n GET HOTELS LIST SERVICE");

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket= await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) { 
    throw notFoundError(); 
  }
  if(ticket.TicketType.includesHotel !== true || ticket.TicketType.isRemote !== false ) {
    throw notFoundError(); //preciso mudar
  }

  const hotelsList = await hotelsRepository.findHotels();
  console.log("\nHOTELS LIST, SERIVCE", hotelsList);
  
  return hotelsList;
}

async function getRoomsFromHotel(hotelId: number) {
  console.log("\n GET ROOM FROM HOTEL LIST SERVICE");

  const roomList = await hotelsRepository.findRoomsFromHotelId(hotelId);
  console.log("\n ROOMS HOTELS LIST, SERIVCE", roomList);

  return roomList;
}

const hotelsServices = {
  getHotelsList,
  getRoomsFromHotel
};

export default hotelsServices;
