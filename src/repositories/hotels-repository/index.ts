import { prisma } from "@/config";

async function findHotels() {
  console.log("\n FIND HOTELS REPOSITORY \n");
  return prisma.enrollment.findMany();
}

const hotelsRepository = {
  findHotels
};

export default hotelsRepository;
