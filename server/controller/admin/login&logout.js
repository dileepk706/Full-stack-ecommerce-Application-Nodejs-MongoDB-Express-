const Admin=require('../../model/admin/admin');
const bcrypt = require('bcrypt');

 
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    
    const adminData = await Admin.findOne({ email });
    if (!adminData) {
      return res.status(401).json({ message: 'You are not authorized' });
    }
    const match = await bcrypt.compare(password, adminData.password);
    if (!match) {
      return res.status(401).json({ message: 'Please enter Correct password' });
    }
    req.session.admin = adminData._id;
    console.log(req.session.admin);
    return res.status(200).json({message:'ok'}) 
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
}


  exports.adminLogout=(req,res)=>{
    if (req.session && req.session.admin) {
      // Destroy the user's session
      req.session.admin = null;
      req.session.destroy
      res.redirect('/admin/login');
    } else {
      res.redirect('/admin/login');
    }
  }
  