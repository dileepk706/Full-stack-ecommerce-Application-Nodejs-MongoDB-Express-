require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const path = require('path');
const axios = require('axios');
const ejs=require('ejs')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan')
const twilioRouter=require('./server/router/twilio-sms')
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
mongoose.connect('mongodb://127.0.0.1:27017/amarkart')
.then(response=>{
 console.log('mongodb onnected');
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



// app.get('/', async (req, res) => {
//     try {
//       const response = await axios.get('http://localhost:3000/admin/show');
//       const products = response.data.data;
//       const user=response.data.user
//       const brand=response.data.brand
//       user.forEach(element => {
//         console.log(element.username);
//       });
//       console.log(user,brand);
//       // products.forEach(element => {
//       //   element.image.forEach(o=>{
//       //       console.log(o);
//       //   })
//       // });
//       res.render('userHmome', { products,user,brand });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error' + error.data);
//     }
//   });

//404 page not found page
app.use((req, res, next) => {
  res.render('404')
});
 
  
 

app.listen(process.env.PORT,()=>{
 console.log('server started');
})








