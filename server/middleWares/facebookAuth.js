const passport=require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const User=require('../model/user/user')
const Cart=require('../model/cart/cart')


passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL:"https://shopsmart.cloud/auth/facebook/callback",
      },
      async function(accessToken, refreshToken, profile, done) {
         
            try {
                let existingUser = await User.findOne({facebookId:profile.id});
                if (existingUser) {
                    return done(null, existingUser);
                }
                console.log('Creating new user...');
               
                const newUser= new User({
                    name:profile.displayName,
                    email:null,  
                    password:null,
                    facebookId:profile.id,
                    wishlist:[]
                  })
                const newCart= new Cart({
                  user_id:newUser._id,
                  total_amount:0,
                  product:[]
                })
                console.log('new user...');
                console.log(newUser);
                await newUser.save();
                await newCart.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }

      }
    )
  );

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});