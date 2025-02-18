const mongoose = require("mongoose");

const conn = () => {
  mongoose.connect(process.env.DB_URL, {
    dbName: "example1",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB_CONNECT");
  })
  .catch((err) => {
    console.log("DB DON'T CONNECT: " + err);
  });
};

module.exports = {conn}
