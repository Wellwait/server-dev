class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.statusCode = code;
    this.status =
      code >= 400 && code < 500 ? "CLIENT_ERROR" : "INTERNAL_SERVER_ERROR";
    this.isOperational = true;

    console.log(Error.captureStackTrace(this, this.constructor));
  }

  static badRequest(msg) {
    return new ApiError(400, msg);
  }

  static notFound(msg) {
    return new ApiError(404, msg);
  }

  static unauthorized(msg) {
    return new ApiError(401, msg);
  }

  static internalServerError(msg) {
    return new ApiError(500, msg);
  }
}

export default ApiError;
