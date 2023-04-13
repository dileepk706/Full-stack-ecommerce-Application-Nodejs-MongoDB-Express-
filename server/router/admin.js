const express=require('express')
const admin_router=express.Router()
const dashboard=require('../controller/admin/dashboard')
const multer = require('multer');
const category = require('../controller/admin/category')
const brand = require('../controller/admin/brand')
const product = require('../controller/admin/product')
const adminRender=require('../render/admin/render')
const adminLogin=require('../controller/admin/login&logout')
const adminMidleWare=require('../middleWares/adminAuth')
const user_management=require('../controller/admin/userManagement')
const orders=require('../controller/admin/orders')
const banner=require('../controller/admin/banner')
const coupon=require('../controller/admin/coupon');
const admin = require('../model/admin/admin');


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
  
  

admin_router.get('/add_category',adminMidleWare.adminAuth,adminRender.addCategory)
admin_router.get('/category/add_subcategory',adminMidleWare.adminAuth,adminRender.addSubcategory)
// admin_router.get('/product/add_product',adminMidleWare.adminAuth,adminRender.addProductForm)
admin_router.get('/category/add_brand',adminMidleWare.adminAuth,adminRender.addBrand)
admin_router.get('/login',adminRender.adminLoginPage)
admin_router.get('/product/updateProduct',adminMidleWare.adminAuth,adminRender.updateProduct)
admin_router.get('/updateCategory',adminMidleWare.adminAuth,adminRender.updateCategory)
admin_router.get('/',(req,res)=>{
  res.redirect('/admin/login')
})
 





admin_router.get('/logout',adminMidleWare.adminAuth,adminLogin.adminLogout)
admin_router.get('/view_category' ,adminMidleWare.adminAuth,category.categoryList)
admin_router.get('/product_list',adminMidleWare.adminAuth,product.productList)
admin_router.get('/product/add_product',adminMidleWare.adminAuth,category.categoryDetails)
admin_router.get('/products/edit',adminMidleWare.adminAuth,product.product_details)
admin_router.get('/user_management',adminMidleWare.adminAuth,user_management.get_all_users );
admin_router.get('/orders',adminMidleWare.adminAuth,orders.get_all_orders)
admin_router.get('/order',adminMidleWare.adminAuth,orders.order_details)


admin_router.post('/login',adminLogin.adminLogin)
admin_router.post('/category/add_category',adminMidleWare.adminAuth,upload.single('image'),category.addCategory);
admin_router.put('/category/update_category',adminMidleWare.adminAuth,category.addSubCategory);
admin_router.post('/category/add_brand',adminMidleWare.adminAuth ,brand.addBrand);
admin_router.post('/product/add_product',adminMidleWare.adminAuth,upload.array('image'),product.addProduct);
admin_router.put('/product/edit_product',adminMidleWare.adminAuth,upload.array('image'),product.editProduct)

admin_router.put('/update_category',adminMidleWare.adminAuth,category.updateCategory)
admin_router.put('/product/edit',adminMidleWare.adminAuth,product.update_product)
admin_router.put('/status',adminMidleWare.adminAuth,orders.change_status)

admin_router.delete('/category/delete',adminMidleWare.adminAuth,category.deleteCategory)
admin_router.delete('/category/delete_subcategory',adminMidleWare.adminAuth,category.deleteSubCategory)
admin_router.delete('/products/delete',adminMidleWare.adminAuth,product.deleteProduct)

admin_router.patch('/user_action',adminMidleWare.adminAuth,user_management.block_unblock_user)

//brand
admin_router.get('/brand',adminMidleWare.adminAuth,category.addBrand)
//Banner managment
admin_router.get('/banner',adminMidleWare.adminAuth,banner.bannerFormForCreate)
admin_router.post('/banner',adminMidleWare.adminAuth,upload.single('image'),banner.createBanner)
admin_router.get('/bannerlist',adminMidleWare.adminAuth,banner.getAllBanner)
admin_router.get('/updatebanner/:id',adminMidleWare.adminAuth,banner.getSingleBannerInfo)
admin_router.post('/updatebanner/:id', adminMidleWare.adminAuth,banner.updateBanner)
admin_router.get('/deletebanner/:id',adminMidleWare.adminAuth,banner.deleteBanner)
 
//coupon management
admin_router.get('/addcoupons',adminMidleWare.adminAuth,coupon.couponForm)
admin_router.post('/addcoupons',adminMidleWare.adminAuth,coupon.createCoupon)
admin_router.get('/coupons', adminMidleWare.adminAuth,coupon.getAllcoupons)
admin_router.get('/couponedit/:id',adminMidleWare.adminAuth,coupon.editCouponForm)
admin_router.post('/couponedit/:id',adminMidleWare.adminAuth,coupon.editCoupon)

//dashboard
admin_router.get('/dashboard',adminMidleWare.adminAuth, dashboard.adminDashbord)
admin_router.get('/dashboardLineChart',adminMidleWare.adminAuth, dashboard.dashboardLineChartasync )

//sales report
admin_router.get('/salesreport',adminMidleWare.adminAuth, dashboard.salesReportDateSelect)
admin_router.post('/show-salesreprot',adminMidleWare.adminAuth,dashboard.salesReport)


admin_router.get('/dashboard',adminMidleWare.adminAuth, dashboard.adminDashbord)

module.exports=admin_router