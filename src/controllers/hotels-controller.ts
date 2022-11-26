import { AuthenticatedRequest } from "@/middlewares";
import hotelsServices from "@/services/hotels-service/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  console.log("\n GET HOTELS CONTROLER \n");

  try {
    const hotels = await hotelsServices.getHotelsList(userId);
    console.log("\n hotels from getHotels in controller", hotels);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getRoomsFromHotel(req: AuthenticatedRequest, res: Response) {
  const hotelId  = Number(req.params.hotelId);
  console.log("GET ROOMS FROM HOTEL CONTROLLER");

  try {
    const rooms = await hotelsServices.getRoomsFromHotel(hotelId);
    console.log("\n room from getRoomsFromHotel in controller", rooms);

    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
