const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {           //by adding this middleware, we ensure certain routes cant be called without token (gives auth failed)
    try {
        //token sent in the authoriztion part of the header
    const token = req.headers.authorization.split(" ")[1];   //this says bearer _____  so we cut off the bearer part.   
    const decoded = jwt.verify(token, "secret");        //needs token and key
    req.userData = decoded;
    next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Auth failed"
        });
    }
 
};