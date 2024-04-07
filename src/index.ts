import express from "express";
import dbConnection from "./services/Database";
import App from "./services/ExpressApp";

const StartServer = async () => {
  const app = express();

  await dbConnection();

  await App(app);

  // Server
  app.listen(8000, () => {
    console.clear();
    console.log("App is listening to the port 8000");
  });
};

StartServer();
