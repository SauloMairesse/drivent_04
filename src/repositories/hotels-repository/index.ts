import { prisma } from "@/config";

async function findHotels() {
  console.log("\n FIND HOTELS REPOSITORY \n");
  return prisma.hotel.findMany();
}

async function findRoomsFromHotelId( hotelId: number ) {
  console.log("\n FIND ROOMS FROM HOTELS REPOSITORY \n");
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
