const User=require('../../model/user/user')
const Cart=require('../../model/cart/cart')
const Coupon=require('../../model/coupon/coupon')

exports.applyCoupon=async (req,res)=>{
    try {
      const {couponCode,totalCartAmount }=req.body

      cartTotal =parseInt(totalCartAmount)
      // console.log('totalCartAmount= '+r+typeof(r));
      const coupon=await Coupon.findOne({couponCode:couponCode})

      //check the coupen is exist or not
      if(!coupon){
        res.status(400).json({message:'invalied Coupon'})
        return
      }
      // check the coupen if expired
      if(new Date()> coupon.expiryDate){
        res.status(400).json({message:`Coupon code has expired `})
        return
      }
      // //check the tatal cart amount less than or greater than the requirement of coupen 
      if(cartTotal<=coupon.minCartAmount){
        res.status(400).json({message:`Minimum cart amount required to apply this coupon is ${coupon.minCartAmount}`})
        return
      }
      //check the user if alredy used the coupen or not
      if(coupon.used.includes(req.session.user)){
        res.status(400).json({message:'You have already used this coupon'})
        return 
      }
      //chek the coupon quantity
      if(coupon.quantity<=0){
        res.status(400).json({message:`Coupon reached its maximum limit...`})
        return
      }

      //calculate discount amount
      let discountAmount=0
      if(coupon.discountType=='percent'){
        discountAmount=(coupon.couponAmount/100)*cartTotal

        if(discountAmount>coupon.minRedeemAmount){
          discountAmount=coupon.minRedeemAmount
        }
      }else{
        discountAmount=coupon.couponAmount
      }
      console.log("discountAmount = "+discountAmount);

      coupon.used.push(req.session.user)
      coupon.quantity--
      await coupon.save()

      const cart=await Cart.findOne({user_id:req.session.user}) 

      console.log(`totalAmount database = ${cartTotal}, `);


      const totalAfterDiscount=cartTotal-discountAmount
      console.log(`totalAmount after  = ${totalAfterDiscount}, `);

      cart.discountAmount=discountAmount
      cart.minimum_cart_requirement=coupon.minCartAmount
      cart.total_amount-=discountAmount
      cart.expiryDate=coupon.expiryDate

      await cart.save()

      // console.log(`discountAmount${discountAmount}totalAfterDiscount${totalAfterDiscount}`);
      return res.status(200).json({message:'Coupon applied successfully',discountAmount,totalAfterDiscount})

    } catch (error) {
      console.log(error);
      res.status(500).json({message:'somthing went wrong'})
    }
    
}

exports.getCoupons= async (req,res)=>{

  try {
    const userData=await User.findById({_id:req.session.user}) 

    const formatdDate=userData.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' });
    const user={...userData,createdAt:formatdDate}
console.log(user);
    const coupons=await Coupon.find({disable:false}).sort({createdAt:-1})

    const coupon = coupons.map(coupon => {
      const formattedDate = coupon.expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' });
      return { ...coupon.toObject(), expiryDate: formattedDate };
    });

    
    res.render('coupons',{user,coupon}) 
  } catch (error) {
    console.log(error);
  }
  
}