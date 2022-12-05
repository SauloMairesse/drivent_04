import { prisma } from "@/config";

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId
    }
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    },
    include: {
      Room: true
    }
  });
}

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId: roomId
    }
  });
}

async function findBookingByRoomIdAndUserId(userId: number, roomId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId,
      roomId: roomId
    }
  });
}

async function updateBooking(bookingId: number, newRoomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId: newRoomId
    }
  });
}

const bookingRepositor = {
  createBooking,
  findBookingByRoomId,
  findBookingByUserId,
  updateBooking,
  findBookingByRoomIdAndUserId
};

export default bookingRepositor;
