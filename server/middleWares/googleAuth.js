const passport=require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require("../model/user/user");
const Cart=require('../model/cart/cart')



    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://shopsmart.cloud/auth/google/callback",
        passReqToCallback: true
    },
        async (request, accessToken, refreshToken, profile, done) => {
            console.log("profile.....");
            console.log(profile);
            console.log('name = '+ profile.displayName);
            try {
                let existingUser = await User.findOne({email:profile.emails[0].value});
                if (existingUser) {
                    return done(null, existingUser);
                }
                console.log('Creating new user...');
                const newUser= new User({
                    name:profile.displayName,
                    email:profile.emails[0].value,  
                    password:null,
                    wishlist:[]
                  })
                const newCart= new Cart({
                  user_id:newUser._id,
                  total_amount:0,
                  product:[]
                })
                await newUser.save();
                await newCart.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
            done(null, user);
    });

 