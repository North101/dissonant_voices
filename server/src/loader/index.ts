import express from "express";

import dbLoader from "./db";
import serviceLoader from "./services"
import expressLoader from "./express";

export default async ({ app }: { app: express.Application }) => {
  const db = dbLoader();
  const services = serviceLoader({ db });

  await expressLoader({ app, services });
};
