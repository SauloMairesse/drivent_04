import supertest from "supertest";
import app, { init } from "@/app";
import { application } from "express";
import httpStatus from "http-status";

import {  createEnrollmentWithAddress, 
  createPayment, 
  createTicket, 
  createTicketType, 
  createTicketTypeValidy, 
  createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("Testando Router /hotels/", () => {
  it("GET Hotels list fail by token invalid ", async () => {
    const response = await server.get("/hotels/").set("Authorization", "Bearer ");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("GET Hotels fail by none enrollment", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get("/hotels/").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
    expect(response.body.message).toBe("user doesnt have enrollment");
  });

  it("GET Hotels fail by none ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment =  await createEnrollmentWithAddress(user);

    const response = await server.get("/hotels/").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
    expect(response.body.message).toBe("There is no ticket");
  });

  it("GET Hotels fail by invalid token", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment =  await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels/").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
    expect(response.body.message).toBe("The ticket found is invalid");
  });

  it("GET Hotels list sucessefully ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment =  await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeValidy();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels/").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.OK);
  });
});
