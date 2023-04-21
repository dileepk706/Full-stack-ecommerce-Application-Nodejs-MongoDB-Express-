const express = require ('express');
const multer = require('multer');
const nocache = require('nocache');
const router = express.Router();
const userRender=require('../render/user/render');
const userHome=require('../controller/user/userHome')
const userAccount= require('../controller/user/userLogin&logout')
const userMidleWare=require('../middleWares/userAuth')
const cart=require('../controller/user/cart')
const userProfile=require('../controller/user/profile')
const checkout=require('../controller/user/checkout')
const orderList=require('../controller/user/orderList')
const wishlist=require('../controller/user/wishList')
const userCoupon=require('../controller/user/coupon')
const passport = require("passport");
require("../middleWares/googleAuth");
require('../middleWares/facebookAuth')
 



// multerSetup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb('ERROR : Only image files are allowed!');
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });                 


 
 
// router.get('/',userMidleWare.requireUserAuth,userRender.userhome); 
router.get('/category',userMidleWare.requireUserAuth,userRender.userCategoryHome)
router.get('/login',nocache(),userRender.userLogin)
router.get('/signup',userRender.userSignup)
router.get('/search',userHome.getPrdctBySearch)
router.get('/filter',userMidleWare.requireUserAuth,userHome.prdctFilter)  
router.get('/product_details',userMidleWare.requireUserAuth,cart.product_details)


//user auth
router.get("/auth/facebook", passport.authenticate("facebook"));
router.get("/auth/facebook/callback",nocache(),passport.authenticate("facebook", {failureRedirect: "/login"}),userAccount.facebookAuth);
router.get("/auth/google",passport.authenticate("google", { scope: ["email", "profile"] }));
router.get("/auth/google/callback",nocache(), passport.authenticate("google", {failureRedirect: '/',}),userAccount.googleAuth);
router.post('/signup',userAccount.userRegistration)
router.post('/login',userAccount.userlogin)
router.get('/logout', userAccount.userLogout)

//home page
router.get('/',userMidleWare.requireUserAuth,userHome.userHome)

// forgot pasword
router.get('/forgot_password',userAccount.forgot_page)
router.get('/reset-password',userAccount.reset_page)
router.post('/forgot_password',userAccount.token_send)
router.post('/reset-password',userAccount.pass_reset)

//show orders, cancell orders...etc
router.get('/myorders',orderList.get_all_orders)
router.get('/return',orderList.return_order)
router.delete('/myorders/cancelorder',orderList.cancel_order)
router.get('/order',orderList.getOneOrder)
router.get('/downloadOrdInvoice/:id',orderList.downLoadInvoice)



//wishlist
router.get('/wishlist',wishlist.get_wishlist)
router.put('/wishlist',wishlist.add_wishlist)
router.delete('/wishlist/remove_allitem',wishlist.dlt_wishlist_single_item)
router.delete('/wishlist/removeitem',wishlist.clear_wishlist)

//checkout
router.get('/checkout-address',checkout.checkout_adress)
router.get('/checkout-address-save',checkout.save_address)
router.get('/checkout-payment',nocache(),checkout.checkout_payment)
// router.get('/checkout-review',nocache(),checkout.checkout_review)
router.post('/place-order',checkout.checkout_complete)
router.post('/verify-payment',checkout.veryfy_payment)
router.get('/ordersuccess', cart.order_success)

//user profile
router.get('/address',userMidleWare.requireUserAuth,userProfile.showAddress)
router.get('/profile',userMidleWare.requireUserAuth,userProfile.showProfile)
router.post('/add_address',userProfile.createAddress)

//cart
router.get('/viewcart',userMidleWare.requireUserAuth,cart.show_cart)
router.get('/cart_qty',userMidleWare.requireUserAuth,cart.change_qty)
router.delete('/viewcart/remove_cart',cart.remove_item)

//coupon
router.post('/applycoupon', userCoupon.applyCoupon)
router.get('/coupon',userCoupon.getCoupons)


const Product=require('../model/product/product')
const Cart=require('../model/cart/cart')
const Order=require('../model/order/order')
const Category=require('../model/category/category')
const Brand=require('../model/brand/brand')
const User=require('../model/user/user')

const Banner=require('../model/banner/banner')
const Coupon=require('../model/coupon/coupon')


  
 router.get('/admin/cropimage',(req,res)=>{
  res.render('imageCroper')
 })


router.get('/admin/edit_subcategory',(req,res)=>{

  let {subcatname,subcatid,parentId}=req.query

  // console.log('afdsffs'+subcatname,subcatid,parentId);
  res.render('updateSubCat',{subcatname,subcatid,parentId})
})

router.put('/admin/updatesubcategory',async (req,res)=>{
  try {
    const {parentCategory,subCategoryId,subCategory}=req.body;
    console.log("subCategory"+subCategory);

    if(!subCategory){
      res.status(401).json({message:'field canot be empty'});
      return;
    }
    const category=await Category.findById({_id: parentCategory});
    // console.log('category:', category);
    const subCat=category.subcategories.id(subCategoryId);
    // console.log('subCat:', subCat);
    if(subCat.name===subCategory){
      return res.status(401).json({message:'subcategory is already exist'});
    }

    subCat.name=subCategory;
    category.markModified('subcategories');
    await category.save();
    res.status(200).json({message: 'subcategory updated successfully'});
    return;
  } catch (error) {
    console.log('error:', error);
    res.status(500).send(error);
  }
})



router.get('/update_profile/:email',async(req,res)=>{

  const userData=await User.findOne({email:req.params.email},{name:1,email:1,phone:1})
console.log(userData);
  res.render('profileUpdation',{userData})
return

})





// twilio-sms

const {sendOTP,verifyOTP}=require('../controller/twilio-sms');
const { response } = require('express');
const order = require('../model/order/order');
const user = require('../model/user/user');
const { log } = require('console');
const { group } = require('console');

router.get('/twilio-sms/Request_OTP',(req,res)=>{
 res.render('login_otp',{message:null})
})


router.post('/twilio-sms/send-otp',sendOTP)


router.post('/twilio-sms/verify-otp',verifyOTP)

module.exports = router