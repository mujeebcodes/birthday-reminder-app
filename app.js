const express = require("express");
const app = express();
const UserModel = require("./model/user");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const db = require("./db");

// connectdb
db.connect();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/add-birthday", async (req, res) => {
  //   const { username, email, dob } = req.body;
  console.log(req.body);
  try {
    await UserModel.create(req.body);
    res.status(201).json({ msg: "user created successfully" });
  } catch (error) {
    res.status(400).json({ msg: "error creating user" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log(`Error connecting to your email: ${error}`);
  }
});

// cron scheduler
schedule.scheduleJob("0 7 * * *", async () => {
  try {
    const today = new Date();
    const todayMonthDay = {
      $expr: {
        $eq: [{ $month: "$dob" }, today.getMonth() + 1],
      },
    };

    const todayDayOfMonth = {
      $expr: {
        $eq: [{ $dayOfMonth: "$dob" }, today.getDate()],
      },
    };

    const birthdays = await UserModel.find({
      $and: [todayMonthDay, todayDayOfMonth],
    });

    if (birthdays.length > 0) {
      birthdays.forEach(async (birthday) => {
        const mailOptions = {
          from: process.env.MY_EMAIL,
          to: birthday.email,
          subject: `Happy Birthday, ${birthday.username}!`,
          text: "Wishing you a fantastic birthday!",
        };

        await transporter.sendMail(mailOptions);
        console.log(`Birthday email sent to ${birthday.username}`);
      });
    }
  } catch (error) {
    console.error("Error sending birthday emails:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
