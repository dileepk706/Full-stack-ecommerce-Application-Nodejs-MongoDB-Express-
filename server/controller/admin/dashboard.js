const Order=require('../../model/order/order')
const User=require('../../model/user/user')

exports.adminDashbord=async (req,res)=>{

    const productSold=await Order.find({paymentStatus: 'delivered'}).countDocuments()
    const totalrevenue=await Order.aggregate([
      {
        $match:{paymentStatus: 'delivered'}
      },
      {$group:{
        _id:null,
        totalRevenue:{$sum:'$totalAmount' }
        }
      }
    ])
    const [{totalRevenue: totalRevenue}] = totalrevenue;
    const users=await User.find().countDocuments()
     
  
  
    res.render('adminDashboard',{productSold,totalRevenue,users})
    return
  
  }
  
  exports.dashboardLineChartasync= (req, res) => {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - 6); // get the start date of the past 7 days
    
    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(endOfWeek.getDate()); // get the end date of today
    
    const pipeline = [
      {
        $match: {
          paymentStatus: 'delivered',
          createdAt: { $gte: startOfWeek, $lte: endOfWeek }, // filter by the past 7 days' start and end dates
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalAmount: { $sum: '$totalAmount' }, // calculate the total amount
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ];
    
    const getDeliveredOrdersByDay = async () => {
      try {
        const result = await Order.aggregate(pipeline);
        const ordersByDay = result.map((order) => ({
  
          date: new Date(order._id.year, order._id.month - 1, order._id.day), // create a new Date object from year, month, and day
          totalAmount: order.totalAmount,
          
        }));
        res.send({ordersByDay})
      } catch (error) {
        console.error(error);
      }
    };
    
    getDeliveredOrdersByDay();
    
  
  }

exports.salesReportDateSelect= async (req,res)=>{
  const sales=await Order.find({paymentStatus:'delivered'}).populate({path:'items.item',model:'product'}).sort({createdAt:-1})
  // console.log(sales);

    res.render('salesReportDateSelector',{message:null,sales})
  }

exports.salesReport=async (req,res)=>{
  try {
    let sales
    const {from,to}=req.body
     
    if(from>=to){
      sales=await Order.find({paymentStatus:'delivered'}).populate({path:'items.item',model:'product'}).sort({createdAt:-1})
      res.render('salesReportDateSelector',{sales,message:'from date is not be higher than or equals to date'})
      return 
    }
    sales=await Order.find({paymentStatus:'delivered',createdAt: {
      $gte: from,         
      $lte: to            
    }}).populate({path:'items.item',model:'product'}).sort({createdAt:-1})
    // console.log(sales);
    
    res.render('salesReport',{sales,message:null})
  } catch (error) {
    res.render()
  }
    
  }