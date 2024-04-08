const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

mongoose.connect('mongodb://localhost:27017/Wanderlust', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected");
});

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>
    ({...obj,owner:"6602ab618095430ff856b2b2"}));
   await Listing.insertMany(initData.data);
      console.log("data was initialized");
};
initDB();