const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const noty = require('noty');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/signup', async (req, res) => {
  const { email, businessName, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      new noty({
        text: 'Password and confirm password do not match',
        type: 'error',
      }).show();
      return res.redirect('/');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, businessName, password: hashedPassword });
    await user.save();

    new noty({
      text: 'Signup successful!',
      type: 'success',
    }).show();

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id;
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
