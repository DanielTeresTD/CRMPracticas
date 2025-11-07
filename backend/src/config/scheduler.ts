import schedule from "node-schedule";
import { LineasService } from "../services/busesMalaga/lineas.service";
import { UbicacionesService } from "../services/busesMalaga/ubicaciones.service";
import { server } from "../app";

// Execute that job each day at 3:00 am
schedule.scheduleJob("0 0 3 * * *", async () => {
  try {
    await LineasService.storeBusLines();
    console.log("Job to update busLines and busStops executed succesfully");
  } catch (err) {
    console.error(
      "Error while executing job to update busLines and busStops:\n",
      err
    );
  }
});

schedule.scheduleJob("* * * * *", async () => {
  try {
    await UbicacionesService.storeLocations();
    console.log("Job for update locations executed succesfully");
    server.emit("refresh-locations");
  } catch (err) {
    console.error("Error while executing job for upadte bus locations:\n", err);
  }
});
