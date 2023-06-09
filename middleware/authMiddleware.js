const session = require('express-session');

exports.checkSession = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
};