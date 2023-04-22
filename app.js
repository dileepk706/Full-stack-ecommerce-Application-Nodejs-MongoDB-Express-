require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport=require('passport')
const app=express();

app.use(cookieParser());
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})); 


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));


// Initialize PassportJS middleware
app.use(passport.initialize());
app.use(passport.session());



// app.use('/twilio-sms',twilioRouter)


const render=require('./server/render/user/render')
const userRouter = require ('./server/router/user');
const adminRouter=require('./server/router/admin')
//dataBaseConection

mongoose.connect(process.env.MONGO_URI)
.then(response=>{
 console.log('mongodb Connected');
}).catch(err=>{
 console.log(`error happened when connecting mongodb : ${err}`);
})

 



// serveStaticFiles
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// setViewEngin
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin')
]);

// routSetting
app.use('/',userRouter);
app.use('/admin',adminRouter)



 

//404 page not found page
app.use((req, res, next) => {
  res.render('404')
});
 
  
 

app.listen(process.env.PORT,()=>{
 console.log('server started');
})








