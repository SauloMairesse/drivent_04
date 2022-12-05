import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createHotel,
  createRoomWithHotelId,
  createBooking
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe ("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should respond with status 404 when user doesnt have booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 and a list of booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdBooking = await createBooking(user.id, createdRoom.id);
  
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.OK);
  
      expect(response.body).toEqual(
        {
          id: createdBooking.id,
          Room: {
            id: createdRoom.id,
            capacity: createdRoom.capacity,
            hotelId: createdRoom.hotelId,
            name: createdRoom.name,
            createdAt: createdRoom.createdAt.toISOString(),
            updatedAt: createdRoom.updatedAt.toISOString()
          }
        }
      );
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should response error 500 when body is wrong, to roomId less than 1 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
  
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should response error 500 when body is wrong, to roomId less than 0 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: -1 });
  
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should response error 404 when body is valid, roomId inside limits but room doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
        
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      
      const body = { roomId: createdRoom.id+1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should response error 403 when body is valid, there is a room, but it is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
        
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      await createBooking(user.id, createdRoom.id);
      await createBooking(user.id, createdRoom.id);
      const createdBooking = await createBooking(user.id, createdRoom.id);
      
      const body = { roomId: createdRoom.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should response error 403 when body is valid, room is available, but invalid ticket by enrollment NotFound", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      
      const body = { roomId: createdRoom.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should response error 403 when body is valid, room is available, but ticket is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBooking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: createdRoom.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should response error 403 when body is valid, room is available, but ticket doesnt Exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
        
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBooking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: createdRoom.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should response 200 in case of sucessfull", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      const body = { roomId: createdRoom.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
}); 1;

describe("PUT /booking/bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should response error 500 when bookingId was not send", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
     
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      const body = { roomId: createdRoom.id };
  
      const response = await server.put("/booking/").set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
    });
    it("should response error 404 when bookingId is 0", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      const body = { roomId: createdRoom.id };
      const bookinId = 0;

      const response = await server.put(`/booking/${bookinId}`).set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should response 404 in case of bookingId is valid but not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      const  createdBookingNotFound = 1; 
      const body = { roomId: createdRoom.id };
  
      const response = await server.put(`/booking/${createdBookingNotFound}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should response 400 in case of bookingId does not belong to user", async () => {
      const user = await createUser();
      const strangerUser = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBookingFromAnotherUser = await createBooking(strangerUser.id, createdRoom.id);

      const body = { roomId: createdRoom.id };
  
      const response = await server.put(`/booking/${createdBookingFromAnotherUser.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should response error 500 when body is wrong, room less than 1 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBooking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: 0 };
  
      const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should response error 500 when body is wrong, to roomId less than 0 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBooking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: -1 };
  
      const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should response error 404 when body is valid, roomId inside limits but room doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const createdBooking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: createdRoom.id+1 };
  
      const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should response error 403 when body is valid, there is a room, but it is full", async () => {
      const user = await createUser();
      const strangerUser = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const originalRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const destinationRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      await createBooking(strangerUser.id, destinationRoom.id);
      await createBooking(strangerUser.id, destinationRoom.id);
      await createBooking(strangerUser.id, destinationRoom.id);

      const createdBooking = await createBooking(user.id, originalRoom.id);

      const body = { roomId: destinationRoom.id };
  
      const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should response 200 in case of sucessfull", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const originalRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies
      const destinationRoom = await createRoomWithHotelId(createdHotel.id); //room of 3 vacancies

      const createdBooking = await createBooking(user.id, originalRoom.id);

      const body = { roomId: destinationRoom.id };
  
      const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});
