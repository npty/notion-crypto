import { sync } from "./updater.js";
import "dotenv/config";
import cron from "node-cron";

cron.schedule("*/2 * * * * *", () => {
  console.log("Sync");
  sync();
});
