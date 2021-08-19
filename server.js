require('dotenv').config()
const express = require("express")
const app = express()
const ejs = require("ejs")
const expressLayout = require("express-ejs-layouts");
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const PORT = process.env.PORT || 3000
const flash = require("express-flash")
const MongoStore = require("connect-mongo")
const passport = require("passport")
const Emitter = require("events") 

// mongodb connection

const url = 'mongodb://localhost/foodHouse';
mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("database connected successfully...");
}).catch(err => {
    console.log("connection failed...");
});



// session store
let store = new MongoStore({
    mongoUrl: url,
    collection: "sessions"
})


// session config

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: store,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
   // cookie: { maxAge: 1000 * 10 },
}))

// event emmiter
const eventEmitter = new Emitter()
app.set("eventEmitter",eventEmitter);


// passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
// assets
app.use(express.static('public'));

app.use(express.urlencoded());  // for getting data from forms.
app.use(express.json());

// global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next()
})
// set template engine

app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require("./routes/web")(app);

const server = app.listen(PORT, () => {
    console.log(`server started on the port ${PORT}`);
});


// web socket 

const io = require("socket.io")(server);
io.on("connection",(socket)=>{
    // join 
    socket.on("join",(orderId)=>{
       socket.join(orderId)
    })
})

eventEmitter.on("orderUpdated",(data)=>{
    io.to(`order_${data.id}`).emit("orderUpdated",data)
})

eventEmitter.on("orderPlaced",(data)=>{
    io.to("adminRoom").emit("orderPlaced",data);
})