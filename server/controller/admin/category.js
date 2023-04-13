const Category = require ('../../model/category/category')
const Brand=require('../../model/brand/brand')


exports.addCategory = async (req, res) => {
  
  try {
    const name = req.body.name;
    const image = req.file.filename;

    if(!name || !image){
      return res.status(401).json({message:'can not put fields empty'})
    }
    const existingCategory = await Category.findOne({ name: name });
    if (existingCategory) {
      return res.status(401).json({ message: 'the category already exists' });
    }

    const category = new Category({
      name: name,
      image: image,
      subcategories: []
    });

    await category.save();

    res.status(201).json({ message: 'category created successfully '});
    
  //   crop(image)
  //   async function crop(filename){ // Function name is same as of file name
  //     // Reading Image
  //     const image = await Jimp.read
  //     ('/Users/User/Desktop/shopSmart-ecommerce-node-mongoDb/public/uploads/'+filename);
  //     image.crop(100, 50, 128, 128)
  //     .write('/Users/User/Desktop/shopSmart-ecommerce-node-mongoDb/public/uploads/'+filename);
  //  }

  } catch (error) {
      return res.status(500).json({ message: 'please select one image file' });
  }
};
 

exports.addSubCategory = async (req, res) => {
  try {
    const parentCategory = req.body.parentCategory;
    const subCategory = req.body.subCategory;
    if(!subCategory){
      return res.status(401).json({message:'fields can not put empty'})
    }
    const newSubCategory = {
      name: subCategory,
      products: [],
    };
    const category = await Category.findOne({ name: parentCategory });
    for (let subCat of category.subcategories) {
      if (subCat.name == subCategory) {
        return res
          .status(401)
          .json({ message: "The subcategory already exists." });
      }
    }
    category.subcategories.push(newSubCategory);
    await category.save();
    return res.status(201).json({ message: "Subcategory added successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "somthing went wrong" });
  }
};




exports.categoryList=(req,res)=>{
 Category.find({isDeleted:false}).then(categories=>{
   if(!categories){
     res.status(501).send({message:'somthing went wrong'})
   }else{
     res.render('adminCtegoryManegment',{categories})
     return
   }
 }).catch(err=>{
   res.status(501).send('somthing went wrong ' + err)
 })
}

exports.categoryDetails=async(req,res)=>{
  try {
  const brand=await Brand.find()
  Category.find().populate('subcategories').then( categories=>{
    if(!categories){
      res.status(401).send({message:'cannot find the subcategory'})
      return
    }else{
      res.render('adminAddProduct',{categories,brand})    
    }
  })
  .catch(err=>{
    res.status(502).send({messsage:'somthing went wrong ' + err})
  })
  } catch (error) {
    
  }
  
}

exports.deleteCategory=(req,res)=>{
  const _id = req.query.id;
  Category.findByIdAndUpdate({_id}, { isDeleted: true }).then(data=>{
    if(!data){
      return res.status(404).json({message:'cant find the category'})
    }
    return res.status(200).json({message:'Category deleted succefully'})
  }).catch(err=>{
    return res.status(500).json({message:'somthing went wrong' })
  })
    // handle error and result)
}

exports.deleteSubCategory= (req,res)=>{
  const subCat_id=req.query.id
  const parrent_id=req.query.Pid
  Category.findById({_id:parrent_id}).then(category=>{
    if(!category){
      return res.status(404).send({message:'the category is not found'})
    }
    const subCatIndex=category.subcategories.findIndex(subcategory=>subcategory.id===subCat_id)
    category.subcategories[subCatIndex].isDeleted=true
    return category.save()
  }).then(isSave=>{
    return res.status(200).send({message:'subcategory deleted succefully'})
  }).catch(err=>{
    res.status(500).send({message:'somthing went wrong!!!'})
  })
}

exports.updateCategory=async (req,res)=>{
  try {
    const {name,id}=req.body
  if(!name){
    return res.status(400).json({message:'canot put fields empty'})
  }
  const category=await Category.findById({_id:id})
  if(category.name===name){
    return res.status(400).json({message:'the category is already exist!'})
  }
  await Category.findByIdAndUpdate({_id:id},{
    name:name,
  }) 
  return res.status(200).json({message:'Category updated succefully'})
   
  } catch (error) {
    console.log(err);
    res.status(500).json({message:'womthing went wrong'})
  }
}

exports.addBrand= async(req,res)=>{
  const brand=await Brand.find()
  const categories=await Category.find()
  return res.render('adminAddBrand',{brand,categories})
}