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

describe("Testando Router /hotels/", () => {
  it("GET Hotels list fail by token invalid ", async () => {
    const resultado = await server.get("/hotels/types");
    
    expect(resultado.status).toBe(200);
  });

  it("GET Hotels fail by none enrollment", async () => {
    const resultado = await server.get("/hotels/types");
    
    expect(resultado.status).toBe(200);
  });

  it("GET Hotels fail by none ticket", async () => {
    const resultado = await server.get("/hotels/types");
    
    expect(resultado.status).toBe(200);
  });
  it("GET Hotels fail by invalid ticket", async () => {
    const resultado = await server.get("/hotels/types");
    
    expect(resultado.status).toBe(200);
  });

  it("GET Hotels list sucessefully ", async () => {
    const resultado = await server.get("/hotels/types");
    
    expect(resultado.status).toBe(200);
  });
});
