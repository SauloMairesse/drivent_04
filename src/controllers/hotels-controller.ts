import { AuthenticatedRequest } from "@/middlewares";
import hotelsServices from "@/services/hotels-service/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  console.log("\n GET HOTELS CONTROLER \n");

  try {
    await hotelsServices.getHotelsList(userId);

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
