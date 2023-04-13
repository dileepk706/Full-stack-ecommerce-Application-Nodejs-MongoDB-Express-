const Product=require('../../model/product/product')
const Category=require('../../model/category/category')
const Brand=require('../../model/brand/brand')
const Cart=require('../../model/cart/cart')
const Order=require('../../model/order/order')


exports.product_details = (req, res) => {

  const id = req.query.id
  Product.findOne({ _id: id }).then(product => {
    // console.log(product);
    res.render('product_detail', { product })
  })
}

exports.show_cart = async (req, res) => {
  try {
    const prdct_id = req.query.product
    const user_id = req.session.user

    let cartData = await Cart.findOne({ user_id }).populate('product.item')

    if (!cartData) {
      const newCart = new Cart({
        user_id,
        product: [],
        total_amount: 0
      })

      await newCart.save()

      cartData = await Cart.findOne({ user_id }).populate('product.item')
    }

    if (!prdct_id) {

      //check the coupon expired or not 
      if (cartData.discountAmount && cartData.expiryDate < new Date()) {
        const cartTotal = cartData.minimum_cart_requirement > cartData.total_amount ? cartData.total_amount : cartData.total_amount + cartData.discountAmount
        
        //remove coupen related fields from cart document
        await cartData.updateOne({$unset:{discountAmount:1,expiryDate:1,minimum_cart_requirement:1}})
        cartData.total_amount = cartTotal
        await cartData.save()
      }
      res.render('shop-cart', { cartData })
    } else {
      const productData = await Product.findById(prdct_id)

      let foundPrdctId = null
      let foundProduct = null

      for (let prdct of cartData.product) {
        if (prdct.item._id == prdct_id) {
          foundPrdctId = prdct.item._id
          foundProduct = prdct
          break;
        }
      }

      if (!foundPrdctId) {
        const qty = productData.quantity <= 0 ? 0 : 1
        const productPrice = qty >= 1 ? productData.price : 0
        const newItem = {
          item: productData._id,
          quantity: qty,
          sub_total: productPrice
        }

        cartData.total_amount += productPrice

        if (cartData.discountAmount && cartData.total_amount > cartData.minimum_cart_requirement && cartData.expiryDate > new Date()) {
          cartData.total_amount -= cartData.discountAmount
        }

        cartData.product.push(newItem)

        await cartData.save()

        cartData = await Cart.findOne({ user_id }).populate('product.item')

        res.render('shop-cart', { cartData })
      } else {
        //check the coupon expired or not 
      if (cartData.discountAmount && cartData.expiryDate < new Date()) {
        const cartTotal = cartData.minimum_cart_requirement > cartData.total_amount ? cartData.total_amount : cartData.total_amount + cartData.discountAmount
        
        //remove coupen related fields from cart document
        await cartData.updateOne({$unset:{discountAmount:1,expiryDate:1,minimum_cart_requirement:1}})
        cartData.total_amount = cartTotal
        await cartData.save()
      }
        res.render('shop-cart', { cartData })
      }
    }

  } catch (err) {
    res.send(err)
  }
}


exports.change_qty = (req, res) => {

  const prdctId = req.query.prdctId
  const val = parseInt(req.query.val)
  const user_id = req.session.user
  const productQty = req.query.productQty

  //find the cart
  Cart.findOne({ user_id: user_id }).populate('product.item').then(cartData => {

    //check the product if already exist in the cart
    let foundProduct = null
    for (let prdct of cartData.product) {
      if (prdct.item._id == prdctId) {
        // foundPrdctId=prdct.item._id
        foundProduct = prdct
        break;
      }
    }

    //check the cart qty if less than 1 or greater than total stock of the product
    let qty = foundProduct.quantity + val < 1 ? 1 : foundProduct.quantity + val
    qty = qty >= productQty ? productQty : qty
    const prodctPrice = req.query.price
    const sub_total = qty * prodctPrice

    // console.log('sub'+sub_total);
    foundProduct.sub_total = sub_total
    foundProduct.quantity = qty

    cartData.save().then(response => {

      // calculate cart total
      let total = 0
      cartData.product.forEach(amnt => {
        total += amnt.sub_total
      })

      //check if the user apply any coupencode 
      total = cartData.discountAmount && total > cartData.minimum_cart_requirement ? total - cartData.discountAmount : total;

      cartData.total_amount = total
      cartData.save().then(response => {
        res.json({ qty, sub_total, total,dicount:cartData.discountAmount })
        return
      })

    })
  })
    .catch(err => {
      console.log(err);
    })

}

exports.remove_item = async (req, res) => {
  try {
    const user_id = req.session.user
    const product_id = req.query.id
    const cartData = await Cart.findOne({ user_id })
    const product = cartData.product.find(prdctId => prdctId.item == product_id)
    const subtotal = product.sub_total
    const cartDltItm = await Cart.updateOne({ user_id }, { $pull: { product: { item: product_id } } })
    let newCartTotal = cartData.total_amount - subtotal
    if (cartData.discountAmount && cartData.expiryDate > new Date()) {
      newCartTotal = cartData.total_amount - subtotal < 0 ? 0 : cartData.total_amount - subtotal + cartData.discountAmount
    }
    cartData.total_amount = newCartTotal
    const updateTotal = await cartData.save()
    res.send({ cartDltItm, updateTotal })
  } catch (err) {
    res.send(err)
  }
}

exports.order_success=async(req,res)=>{
  const new_order=await Order.findOne({user:req.session.user}).sort({createdAt:-1}).limit(1)
  res.render('checkout-complete',{new_order})
}



