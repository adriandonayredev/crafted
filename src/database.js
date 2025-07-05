const mongoose = require("mongoose");

mongoose.connect("mongodb://crafted_db/crafted_db")
    .then(() => console.log("DB is connected to", mongoose.connection.host))
    .catch(err => console.error(err));
