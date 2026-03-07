const { response } = require('express');
const jwt = require('jsonwebtoken');

const validateJWT = (req, res = response, next) => {
  let token = req.header('Authorization') || req.header('x-token');

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: 'No token provided',
    });
  }

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const { uid, full_name } = jwt.verify(token, process.env.JWT_SECRET);

    // Set req.user object for consistency with controllers
    req.user = {
      id: uid,
      full_name,
    };

    next();
  } catch (error) {
    console.error('JWT Validation Error:', error.message);
    return res.status(401).json({
      ok: false,
      msg: 'Invalid token',
    });
  }
};

module.exports = {
  validateJWT,
};
