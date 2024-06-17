class APPError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    (this.status = `${statusCode}`.startsWith("4") ? "Fail" : "error"),
      (this.isOpertional = true);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default APPError;
