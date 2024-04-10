if(process.env.NODE_ENV!=="production"){
  require('dotenv').config();
};

const express=require("express");
const app= express();
const mongoose=require("mongoose");


const path= require('path');
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const flash=require("connect-flash");
const ExpressError=require("./utils/ExpressError.js");
const session=require('express-session');
const MongoStore=require("connect-mongo");

const Review =require("./models/review.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const { constants } = require("buffer");
const passport=require("passport");

const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbUrl=process.env.ATLASDB_URL;
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
 const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected");
});

app.use(express.static(path.join(__dirname,"/public")));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.get("/",(req,res)=>{
res.send("Hi I am working");
});

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+1000*60*60*24*7,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
 res.locals.currUser=req.user;
//  console.log(res.locals.success);
 next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });
//   let registeredUser=await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// });

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong!"}=err;
  res.status(statusCode).render("error.ejs",{message});
//  res.status(statusCode).send(message);
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// app.get("/testListing",async (req,res)=>{
// let sampleListing= new Listing({
//   title:"My Home",
//   description:"By the beach",
//   price:1200,
//   location:"Calaungate,Goa",
//   country:"India"
// });
// await sampleListing.save();
// console.log("sample was saved");
// res.send("succesful test");
// });

 app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found!")); });



app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});
