import { sync } from "./updater.js";
import "dotenv/config";
import { Server } from "@hapi/hapi";

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
    return {
      success: true,
    };
  },
});

server.start();
console.log("start server");
