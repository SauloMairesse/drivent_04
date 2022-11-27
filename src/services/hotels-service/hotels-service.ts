import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository, { CreateEnrollmentParams } from "@/repositories/enrollment-repository";
import { enrollmentNotFound, noneTicketFound, ticketFoundNotValid } from "./erros";

async function getHotelsList(userId: number) {
  console.log("\n GET HOTELS LIST SERVICE", userId);

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) {
    throw enrollmentNotFound(); 
  }

  const ticket= await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) { 
    console.log("none Ticket Found");
    throw noneTicketFound(); 
  }
  if(ticket.TicketType.includesHotel !== true || ticket.TicketType.isRemote !== false || ticket.status !== "PAID") {
    console.log("Ticket Not Valid");
    throw ticketFoundNotValid(); //preciso mudar
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
