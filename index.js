import express from "express";
const app = express();
import bootstrap from "./src/bootstrap.js";
import 'dotenv/config'


bootstrap(express, app);
