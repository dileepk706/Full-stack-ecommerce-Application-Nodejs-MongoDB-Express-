
const Product = require ('../../model/product/product');
const Category = require('../../model/category/category');
const Brand = require('../../model/brand/brand')
const Jimp = require('jimp');


exports.addProduct = async (req, res) => {
  try {
    const {  sname, name, description, brand_name } = req.body;
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);
    const images = req.files.map((file) => file.filename);


    if(!sname || !name || !description || !brand_name || !price || !quantity || !images){
      res.status(401).send({
        message: `fileds can not put blank`,
      });
      return
    }
    if(price<=0 || quantity<=0 ){
      res.status(401).send({
        message: `price and QTY not be less than 1`,
      });
      return
    }

    const foundPrdct = await Product.findOne({ name: name });
    if (foundPrdct) {
      res.status(401).send({
        message: `the product is already exist..`,
      });
      return
    }

    const category = await Category.findOne({ 'subcategories.name': sname });
    if (!category) {
      return res.status(301).send({ message: "no category" });
    }
    let foundSubcategory = null;
    for (let subCategory of category.subcategories) {
      if (subCategory.name == sname) {
        foundSubcategory = subCategory;
        break;
      }
    }

    const product = new Product({
      name: name,
      quantity: quantity,
      price: price,
      image: images,
      description: description,
      brand_name: brand_name,
      category: category.name,
      subcategory: sname,
    }); 

    const brand = await Brand.findOne({ name: brand_name });
    brand.products.push(product._id);
    brand.category_name = sname
    await brand.save();

    foundSubcategory.products.push(product._id);
    
    //crop the images 
    for (const filename of images) {
      let image = await Jimp.read(`D:/shopSmart-ecommerce-node-mongoDb/public/uploads/${filename}`);
      image.crop(100, 50, 612, 612)
      .write(`D:/shopSmart-ecommerce-node-mongoDb/public/uploads/${filename}`);
      }
    
    await product.save();
    await category.save();
    return res.status(200).send({ message: "product added " });
   
  } catch (error) {
    console.log('error = '+error);
    res.status(500).json({message:error})
    return
  }
};

exports.editProduct = async (req, res) => {
  try {
    
    const {  sname, name, description, brand_name,id } = req.body;
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);
    const images = req.files.map((file) => file.filename);

    if(!sname || !name || !description || !brand_name || !price || !quantity || !images){
      res.status(401).send({
        message: `fileds can not put blank`,
      });
      return
    }
    if(price<=0 || quantity<=0 ){
      res.status(401).send({
        message: `price and QTY not be less than 1`,
      });
      return
    }

    const category = await Category.findOne({ 'subcategories.name': sname });
    if (!category) {
      return res.status(301).send({ message: "no category" });
    }
    let foundSubcategory = null;

     
    for (let subCategory of category.subcategories) {
      if (subCategory.name == sname) {
        foundSubcategory = subCategory;
        break;
      }
    }

    let product
    if(images.length<1){
      const prdct=await Product.findOne({_id:id})
      product =  {
        name: name,
        quantity: quantity,
        price: price,
        description: description,
        brand_name: brand_name,
        category: category.name,
        subcategory: sname,
        image:prdct.image
      }; 
    }else{
       product =  {
        name: name,
        quantity: quantity,
        price: price,
        image: images,
        description: description,
        brand_name: brand_name,
        category: category.name,
        subcategory: sname,
      }; 
      
      //crop the images 
    for (const filename of images) {
    let image = await Jimp.read(`D:/shopSmart-ecommerce-node-mongoDb/public/uploads/${filename}`);
    image.crop(100, 50, 612, 612)
    .write(`D:/shopSmart-ecommerce-node-mongoDb/public/uploads/${filename}`);
    }
    
    }
    

    // const brand = await Brand.findOne({ name: brand_name });
    // brand.products.push(product._id);
    // brand.category_name = sname
    // await brand.save();

    foundSubcategory.products.push(product._id);

    await Product.findOneAndUpdate({_id:id},product);
    await category.save();
    return res.status(200).send({ message: "product added " });

  } catch (error) {
    console.log(error);
    res.render('500')
  }
};

exports.productList = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    return res.render('productListForAdmin', { products });
  } catch (err) {
    console.log(err);
    res.send(err);
    // return res.render('500')
    // res.status(401).send({messege: 'somthing went wrong '+ err})
  }
};


exports.deleteProduct=(req,res)=>{
  const _id=req.query.id
 
  Product.findByIdAndUpdate({_id},{isDeleted:true}).then(result=>{
    if(!result){
      return res.status(404).json({message:'somthing went wrong while delete the product'})
    }
    return res.status(200).json({message:'Product Deleted succefully'})
  }).catch(err=>{
    return res.status(501).json({mesaage:'somthing went wrong   '+err})
  })
}

exports.product_details=async (req,res)=>{
  const id= req.query.id
  try {
    const product=await Product.findById({_id:id}) 
    const categories=await Category.find()
    const brand=await Brand.find()
    if(!product){
      return res.status(404).json({message:'product not found'})
    }

    // res.status(200).json({productData,categories,brand})
    res.render('adminUpdateProduct',{product,categories,brand})

  } catch (error) {
    console.log(error);
    res.status(501).json({message:"somthing went wrong"})
  }
}

exports.update_product=(req,res)=>{
  const {name,description,price,quantity,id}=req.body
  Product.findByIdAndUpdate({_id:id},{
    name:name,
    description:description,
    price:price,
    quantity:quantity
  }).then(data=>{
    res.status(200).json({message:'Product updated succefully'})
  }).catch(err=>{
    console.log(err);
    res.status(500).json(err)
  })
}