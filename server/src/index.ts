import express from "express";
import config from "./config";
import loader from "./loader";

async function startServer() {
  const app = express();

  await loader({ app });
  app.listen(config.server.port, () => {
    console.log(`Your server is ready !`);
  });
}

startServer();