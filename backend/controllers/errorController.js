import AppError from "../utils/AppError.js";

const sendErrorProd = (err, res) => {
  if (err.isOpertional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("error: ", err);
    res.status(500).json({
      status: "error",
      message: `something went very wrong`,
    });
  }
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleDuplicateFieldError = (err) => {
  // console.log(err.errmsg);
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  // console.log(value);
  const message = `duplicate field ${value} please use an other value!`;
  return new AppError(message, 400);
};

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const hadnleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

export default function globalError(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "start") {
    sendErrDev(err, res);
  } else {
    // invalid database ids
    if (err.name === "CastError") err = handleCastErrorDb(err);
    // validation errors
    if (err.name === "ValidationError") err = hadnleValidationError(err);
    if (err.code === 11000) handleDuplicateFieldError(err);
    sendErrorProd(err, res);
  }
}
