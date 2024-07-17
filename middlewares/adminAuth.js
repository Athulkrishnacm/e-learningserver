const jwt = require('jsonwebtoken');

module.exports.adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).json({ status: false })
    } else {
      jwt.verify(token, process.env.JWT_SECERT, async (err, decoded) => {
        if (err) {
          res.status(401).json({ status: false, message: "failed to authenticate" })
        } else if(decoded.exp * 1000 > Date.now() && decoded.role ==='admin'){
          req.adminId = decoded.adminId
          next()
        }else{
          res.status(401).json({ status: false, message: "failed to authenticate" })
        }
      })
    }
  } catch (error) {
    next(error)
  }
}