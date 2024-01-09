const express = require("express");
const app = express();
const UserModel = require("./model/user");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/add-birthday", async (req, res) => {
  //   const { username, email, dob } = req.body;
  try {
    await UserModel.create(req.body);
    res.status(201).json({ msg: "user created successfully" });
  } catch (error) {
    res.status(400).json({ msg: "error creating user" });
  }
});

schedule;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
