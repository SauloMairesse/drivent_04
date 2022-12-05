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

export function bookingDoesNotBelongToUser(): ApplicationError {
  return {
    name: "bookingDoesNotBelongToUser",
    message: "booking does not belong to user",
  };
}

export function bookingIdInvalid(): ApplicationError {
  return {
    name: "bookingIdInvalid",
    message: "bookingIdInvalid does not belong to user",
  };
}
