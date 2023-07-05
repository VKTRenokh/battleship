import { httpServer } from "./src/http_server/";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8181;

httpServer.listen(PORT, () => {
  console.log(`Start static http server on the ${PORT} port!`);
});
