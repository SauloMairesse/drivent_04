import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsFromHotelId( hotelId: number ) {
  return prisma.room.findMany({
    where: {
      hotelId: hotelId
    }
  });
}

const hotelsRepository = {
  findHotels,
  findRoomsFromHotelId
};

export default hotelsRepository;
