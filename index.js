const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Connection = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
app.use(express.json());

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

//express server is not gonna accept json by default so we will use app.use(express.json());

Connection();

app.use(cors());
//importing routes
const authRoute = require("./routes/auth.js");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");

//using routes
app.use("/api/auth", authRoute); //'/api/auth' this endpoints belongs to authRoute
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running successfully on Port ${PORT}`);
});
