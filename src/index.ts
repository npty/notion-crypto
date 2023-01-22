import { sync } from "./updater.js";
import "dotenv/config";
import cron from "node-cron";
import { Server } from "@hapi/hapi";

cron.schedule("*/10 * * * * *", () => {
  console.log("Sync");
  sync();
});

const server = new Server({
  port: process.env.PORT || 3000,
  host: "0.0.0.0",
});

server.route({
  method: "GET",
  path: "/",
  handler: (request, h) => {
    return {
      status: true,
    };
  },
});

server.start();
console.log("start server");
