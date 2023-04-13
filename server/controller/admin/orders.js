const Order=require('../../model/order/order')
const product = require('../../model/product/product')
const Product=require('../../model/product/product')
const User=require('../../model/user/user')

exports.get_all_orders=(req,res)=>{

    Order.find({}).sort({createdAt:-1}).then(order=>{
      res.render('orderList',{order})
    }).catch(err=>{
      console.log(err);
      
    })
    
  }

exports.order_details=async (req,res)=>{
  try {
    const {ordId}=req.query
    const order=await Order.findById({_id:ordId}).populate({
      path: 'items.item',
      model: 'product'
    })

    res.render('order',{order})
  } catch (error) {
    console.log(error);
    
  }
}

exports.change_status = async (req, res) => {
  const { ordId,status } = req.body;
  // const qty = parseInt(req.body.qty);
  // // console.log('qty:' + qty);

  try {
    const ord_data = await Order.findById({ _id: ordId });

    if (status === 'refund-approved'){
      let changd_qty=0
      ord_data.items.forEach(prdct=>{
        Product.findById({ _id: prdct.item }).then(product=>{
          changd_qty = product.quantity + prdct.quantity;
  
          product.quantity = changd_qty;
          product.save().then();
        });
        
      })

      const userData = await User.findById({ _id: ord_data.user });
      console.log('userdata =' + userData);

      userData.wallet += ord_data.totalAmount;
      await userData.save();
      change_stat();
    } else {
      change_stat();
    }

    function change_stat() {
      ord_data.paymentStatus=status
      ord_data.save().then((data) => {
        res.json({ message: 'Status changed' });
      }).catch(err => {
        console.log(err);
        res.json({ message: 'Something went wrong' });
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: 'Something went wrong' });
  }
}
