const Order=require('../../model/order/order')
const Product=require('../../model/product/product')

exports.get_all_orders=(req,res)=>{
    const user_id=req.session.user
    Order.find({user:user_id})
    .populate({
      path: 'items.item',
      model: 'product'
    }).sort({createdAt:-1})
    .then((orders)=> {
      res.render('myOrders',{orders})
      orders.forEach(g=>{
        console.log(g);

      })
    }).catch(err=>{
      console.log(err);
    })
  
    // Order.aggregate([
    //   {
    //     $match:{user:mongoose.Types.ObjectId(user_id)},
    //   },
    //   {
    //     $lookup:{
    //       from:"products",
    //       localField:"items.item",
    //       foreignField:"_id",
    //       as:"products"
    //     }
    //   },
    //   {
    //     $project:{
    //       status:1,
    //       items:1,
    //       products:{
    //         name: 1,
    //         price: 1,
    //         image: 1
    //       }
    //     }
    //   }
    // ]).then(orderList=>{
      
    //   orderList.forEach(element => {
    //     element.products.forEach(d=>{
    //       console.log(d)
    //     })
    //     ;
    //   });
    //   res.render('myOrders',{orderList})
    // })
    
  }

exports.getOneOrder = async (req, res) => {
  try {
    const id = req.query.id
    const ordPrdct = await Order.findById({ _id: id }).populate({
      path: 'items.item',
      model: 'product'
  })
  // console.log(ordPrdct);
  res.render('singleorder', { ordPrdct })
  } catch (error) {
    console.log(error);
    res.render('500')
  }
  
}


  exports.cancel_order=(req,res)=>{

    const product_id=req.query.prdctId
    const ORD_id=req.query.ordId
    const qty=req.query.qty
    Order.findOne({orderId:ORD_id}).then(orderData=>{
      const prdctStat=orderData.items.find(data=> data.item._id==product_id)
      orderData.paymentStatus="cancelled"
      // orderData.markModified('items')
      return orderData.save()
    })
    .then(savedStatus=>{
      Product.findOne({_id:product_id}).then(data=>{
        const changd_qty=data.quantity+qty
        data.quantity=changd_qty
        return data.save()
      }).then(data=>{
        res.json({message:'Order Cancelled!'})
      }).catch(err=>{
        console.log(err)
      })
    })
    .catch(err=>{
      res.json({message:err})
    })
  }

exports.return_order=(req,res)=>{
  const {order_id,product_id}=req.query 
  console.log(`orderid=${order_id} prodv=${product_id}`);

  Order.findById({_id:order_id}).then(order_data=>{

    let product=order_data.items.find(prdct=> prdct.item._id==product_id)
    console.log(product);
    order_data.paymentStatus="return"
    // order_data.markModified('items')
    return order_data.save().then(data=>{
      console.log('hi'+data);
      res.json({message:'Return request has gone to Admin'})
    }).catch(err=>{
      res.json({message:'somthing went wrong'})
    })

  })

}

exports.downLoadInvoice=async(req,res)=>{

  const id=req.params.id
  console.log(id);
  const order=await Order.findOne({_id:id},{orderId:1,items:1,createdAt:1}).populate({
    path: 'items.item',
    model: 'product'
  })

  const {orderId, createdAt} = order;
  const filteredOrder = {orderId, createdAt};     
  console.log(filteredOrder);

   // Extract the items array from the order
   const items = order.items;

   // Map over the items array to populate the item field with other fields
   const formattedItems = items.map(item => {
     const { name, price } = item.item;
     return {
       quantity: item.quantity,
       description: name,
       "tax-rate": 0,
       price: price
     }
   })
  res.status(200).send({formattedItems,filteredOrder})
   console.log(formattedItems);
}