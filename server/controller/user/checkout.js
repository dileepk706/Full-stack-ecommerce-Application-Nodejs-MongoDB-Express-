const Product=require('../../model/product/product')
const Cart=require('../../model/cart/cart')
const Order=require('../../model/order/order')
const User=require('../../model/user/user')
const Coupon=require('../../model/coupon/coupon')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


exports.checkout_adress=(req,res)=>{
    const userId=req.session.user
      User.findById({_id:userId}).then(userData=>{
        const address=userData.address
        Cart.findOne({user_id:userId}).populate('product.item').then(cartData=>{
          if(cartData.product.length>0){
             res.render('shop-checkout-address',{userData,address,cartData})
             return
          }else{
            return res.redirect('/viewcart')
          }
        })
      })
  }

exports.save_address=(req,res)=>{
  
    req.session.userAddress =req.query.address
    res.json({message:'address saved'})
  
  }

exports.checkout_payment=(req,res)=>{

  if(req.session.userAddress){
    const userId=req.session.user
    Cart.findOne({user_id:userId}).populate('product.item').then(cartData=>{
      res.render('checkout-payment',{cartData})
    })
  }
    
     
  }

exports.checkout_review=(req,res)=>{
  
    if(req.session.userAddress){
      const userId=req.session.user
      const method=req.query.method
      console.log(method);
      Cart.findOne({user_id:userId}).populate('product.item').then(cartData=>{
        res.render('checkout-review',{cartData,method})
      })
    }else{
      res.send('<center> <h1>the order is placed </h1> <br><a href="/"><button>Back to home</button></a> </center>')
    }
   
  }

  exports.checkout_complete = async (req, res) => {
    const method = req.body.method;
    const address = req.session.userAddress;
    const userId = req.session.user;
  
    // Prefix for the order ID
    const ORDER_ID_PREFIX = "ORD";
  
    // Function to generate a unique order ID
    function generateOrderId() {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderId = `${ORDER_ID_PREFIX}-${timestamp}-${randomNum}`;
      return orderId;
    }
  
    try {
      const cartData = await Cart.findOne({ user_id: userId }).populate(
        "product.item"
      );
      console.log('total = '+cartData.total_amount);
      const orderId = generateOrderId();
      const status=method=='COD'?'placed':'pending'
      const newOrder = new Order({
        user: cartData.user_id,
        orderId: orderId,
        items: cartData.product,
        shippingAddress: address,
        paymentMethod: method,
        totalAmount: cartData.total_amount,
        paymentStatus:status
      });
  
      const d=await newOrder.save();
      console.log('total = '+d.totalAmount);
  
      for (let i = 0; i < cartData.product.length; i++) {
        const product = cartData.product[i];
        const newPrdctQty = product.item.quantity - product.quantity;
        await Product.findByIdAndUpdate(
          { _id: product.item._id },
          { quantity: newPrdctQty }
        );
      }
      await Cart.findOneAndDelete({ _id: cartData._id });
      req.session.userAddress = null;
      if(method==='COD'){
        // res.render("checkout-complete", { new_order: newOrder, cartData, address });
        return res.status(200).json({message:'COD'})
      }else{
        const user=await User.findById({_id:req.session.user})

        instance.orders.create({
          amount: cartData.total_amount*100,
          currency: "INR",
          receipt: newOrder.orderId,
          notes: {
            name: user.name,
            email: user.email,
            contact:user.phone
          }
        },(err,order)=>{
          if(err){
            console.log(err);
          }else{
            console.log(order);
            console.log(order.amount);
            return res.status(200).json({message:'online',order}) 
          }
        })
      }
    } catch (error) {
      console.error(error);
      return res.send("Error: " + error);
    }
};

exports.veryfy_payment=async (req,res)=>{
  try{
    console.log("inside verifypayment ");
    console.log(req.body);
    const crypto=require('crypto')
        const details = req.body
        let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex')
        const orderId = details.order.receipt
        if (hmac == details.payment.razorpay_signature) {
            const data=await Order.findOneAndUpdate({orderId:orderId}, { $set: { paymentStatus: 'placed' } }) 
            res.status(200).json({ message: 'order placed', data })
        } else {
          res.status(400).json({ status: 'payment failed' })
        }
  }catch(error){
      console.log(error.message);
  }
}

