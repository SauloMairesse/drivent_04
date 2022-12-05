import { ApplicationError } from "@/protocols";

export function ticketInvalid(): ApplicationError {
  return {
    name: "ticketInvalid",
    message: "Ticket Invalid",
  };
}

export function enrollmentNotFound(): ApplicationError {
  return {
    name: "enrollmentOfUserNotFound",
    message: "Enrollment Of User Not Found",
  };
}

export function roomIdInvalid(): ApplicationError {
  return {
    name: "roomIdInvalid",
    message: "RoomId invalid",
  };
}
