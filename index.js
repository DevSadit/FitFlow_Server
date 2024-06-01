const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());

//
app.get("/", (req, res) => {
  res.send(`fitnes tracker server is working!!`);
});

app.listen(port, () => {
  console.log(`fitnes tracker is working on port ${port}`);
});
