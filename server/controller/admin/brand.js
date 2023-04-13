const Brand = require('../../model/brand/brand')

exports.addBrand=(req,res)=>{
    const brndName=req.body.name
    console.log(brndName);
    const catName=req.body.catName
    const brand = new Brand({
        name:brndName,
        category_name:catName,
        products:[]
    })
    Brand.findOne({name:brndName}).then(foundBrand=>{
        if(foundBrand){
            return res.status(400).send({message:'the brand is alresdy exist'})
        }else{
            brand.save().then(result=>{
                return res.status(201).send({message:'brand added succefully'})
            }).catch(err=>{
           console.log(err);

                // return res.status(401).send({message:'somthing went wrong'+err})
                res.render('500')
            })
        }
    }).catch(error=>{
           console.log(error);
            // handle other errors
            // return res.status(500).json({ message: 'something went wrong' });
            res.render('500')

          
    })
}