import express, { response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose';
import services from './services/index.js';
import connectDB from './config/dbConnection.js';
import bodyParser from 'body-parser'

dotenv.config();

const app = express();
connectDB()
const PORT = process.env.PORT || 5555;

const corsOptions ={
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(express.json());

app.use(cookieParser())
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(express.static('public'))
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use('/api', function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header('Access-Control-Allow-Credentials', true); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
}, services);

app.get("/health", (req, res) => {
  console.log("cookies health", req.cookies);
  res.status(200).send({ message: "Health is good" });
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
      console.log(`Express app listening on localhost:${PORT}`)
  );
});
