import { serverError } from "../util.js";
import ApiError from "./apiError.js";

function apiRequestHandler(fn) {
  console.log("IN OP");
  return function (request, response, next) {
    return fn(request, response, next).catch((e) => {
      console.log("LKOP");
      console.log(e.stack);
      console.log(e.code);
      if (e.code === "ER_DUP_ENTRY") {
        return next(
          ApiError.badRequest(
            `Duplicate entry detected. Please verify the information entered or consult with an administrator for assistance.`
          )
        );
      }
      return next(e);
    });
  };
}

function errorHandler(err, req, res, next) {
  console.error("err.message");
  console.error(err.message);

  if (err instanceof ApiError) {
    if (err.statusCode == 400) {
      res
        .status(err.statusCode)
        .json(serverError("BAD_REQUEST", err.message, err.stack));
    } else {
      res
        .status(err.statusCode)
        .json(serverError("INTERNAL_SERVER_ERROR", err.message, err.stack));
    }
  } else {
    res
      .status(500)
      .json(serverError("INTERNAL_SERVER_ERROR", err.message, err.stack));
  }
}

export { errorHandler, apiRequestHandler };
