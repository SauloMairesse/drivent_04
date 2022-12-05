import { prisma } from "@/config";

async function createRoom(name: string, capacity: number, hotelId: number) {
  return prisma.room.create({
    data: {
      name: name,
      capacity: capacity,
      hotelId: hotelId
    }
  });
}

async function findRoomById( roomId: number ) {
  return prisma.room.findUnique({
    where: {
      id: roomId
    },
    include: {
      Hotel: true
    }
  });
}

const roomRepository = {
  createRoom,
  findRoomById
};

export default roomRepository;
