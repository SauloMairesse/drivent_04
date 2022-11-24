import supertest from "supertest";
import app, { init } from "@/app";
import httpStatus from "http-status";
import { createEvent } from "../factories";
import { cleanDb } from "../helpers";
import { application } from "express";

// beforeAll(async () => {
//   await init();
//   await cleanDb();
// });

const server = supertest(app);

describe("Testando Router /hotels/types", () => {
  it("GET ", async () => {
    const resultado = await server.get("/hotels/types");
    // expect().toBe();
  });
});
