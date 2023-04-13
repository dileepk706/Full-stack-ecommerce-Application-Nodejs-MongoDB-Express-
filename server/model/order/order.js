const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required:true
    },
    orderId:{
        type:String
    },
    items:{
      type:Array
    },
    shippingAddress: {
        type:String
    },
    paymentMethod: {
      type: String,
      enum: ['online payment', 'COD',],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending','placed', 'shipped', 'delivered','cancelled','return','refund-approved','return-denied'],
      required: true
    },
    totalAmount:{
        type:Number
    },
 

  }, { timestamps: true });
  
module.exports = mongoose.model('order', orderSchema);
