// prevents brute force attacks
import rateLimit from "express-rate-limit";
import { systemLogs } from "../utils/Logger.js";

export const apiLimiter = rateLimit({
  // limiting each ip for 100 requests per window
  // time frame from which requests are checked or remembered - 15 minutes
  windowMs: 15 * 60 * 1000,
  // max number of connections to allow during the window before limiting the client
  max: 100,
  message: {
    message:
      "Too many requests from this IP address, please try again after 15 minutes",
  },
  // basically the express request handler that sends back a response
  handler: (req, res, next, options) => {
    systemLogs.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  // 30 minutes
  windowMs: 30 * 60 * 1000,
  // requests 20
  max: 20,
  message: {
    message:
      "Too many login attempts from this IP address, please try again after 30 minutes",
  },
  handler: (req, res, next, options) => {
    systemLogs.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
  