const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin123:admin123@ecdsga.eknlq8q.mongodb.net/CDSGA", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = db;