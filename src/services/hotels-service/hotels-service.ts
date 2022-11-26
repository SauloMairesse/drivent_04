import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository, { CreateEnrollmentParams } from "@/repositories/enrollment-repository";
import { notFoundError } from "@/errors";

async function getHotelsList(userId: number) {
  console.log("\n GET HOTELS LIST SERVICE");
  //verificar se existe um ticket pago e com hospedagem
  //ticket => enrollmentId => userId

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket= await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) { 
    throw notFoundError(); 
  }
  if(ticket.TicketType.includesHotel !== true || ticket.TicketType.isRemote !== false ) {
    throw notFoundError(); //preciso mudar
  }

  const hotelsList = await hotelsRepository.findHotels();
  
  return hotelsList;
}

const hotelsServices = {
  getHotelsList
};

export default hotelsServices;
