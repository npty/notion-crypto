import { sync } from "./updater.js";
import "dotenv/config";
import cron from "node-cron";
import { Server } from "@hapi/hapi";

// cron.schedule("*/10 * * * * *", async () => {
//   console.log("Sync");
//   const dbId = "0c390541-5f47-407d-9890-7e09f00f9198";
//   await sync(dbId);
// });

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

server.route({
  method: "POST",
  path: "/sync",
  handler: async (request, h) => {
    console.log("Sync");
    const { dbId } = request.payload as any;
    await sync(dbId);
    console.log("done");
  },
});

server.start();
console.log("start server");
