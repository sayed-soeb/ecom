const Category = require('../models/Category');
const SubCategory = require('../models/subCategory');
const Product = require('../models/product');
const StoreInfo = require('../models/StoreInfo');
const multer = require('multer');
const User = require('../models/user');
const path = require('path'); 

// Configure multer middleware for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads'); // Specify the directory where you want to store the uploaded files
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  })
});


exports.getDashboardPage = async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/');
  } else {
    try {
      const userId = req.session.userId;
      const categories = await Category.find({ userId: req.session.userId });
      const subCategories = await SubCategory.find({ userId: req.session.userId });
      const products = await Product.find({ userId: req.session.userId });
      const user = await User.findOne({ _id: userId });
      res.render('dashboard', {
        categories,
        subCategories,
        products,
        user

      });
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  }
};

exports.getStoreInfoPage = async (req, res) => {
  try {
    const businessName = req.params.businessName;
    const user = await User.findOne({ businessName });

    if (user) {
      const storeInfo = await StoreInfo.findOne({ userId: user._id });
      if (storeInfo) {
        res.render('storeInfo', { storeInfo, user }); // Pass the 'user' object to the view
      } else {
        res.render('storeInfo', { storeInfo: null, user }); // Pass the 'user' object to the view
      }
    } else {
      res.render('storeInfo', { storeInfo: null, user }); // Pass the 'user' object to the view
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { businessName } = req.params;
    const searchQuery = req.query.search;
    console.log(req.params);
    console.log(req.query.search);

    // Find the user by businessName
    const user = await User.findOne({businessName });
    console.log(user);

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Perform the product search based on the user's _id and search input
    const products = await Product.find({
      userId: user._id,
      name: { $regex: searchQuery, $options: 'i' }
    });
    console.log(products);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};





exports.postStoreInfo = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { address, gst, storeTimings } = req.body;
    let logo = req.file.filename; // Assuming you are using multer middleware for file upload

    // Find the existing store info for the user
    const existingStoreInfo = await StoreInfo.findOne({ userId });

    // If there is existing store info, update the fields
    if (existingStoreInfo) {
      existingStoreInfo.address = address;
      existingStoreInfo.gst = gst;
      existingStoreInfo.storeTimings = storeTimings;

      // If a new logo is uploaded, update the logo field
      if (logo) {
        existingStoreInfo.logo = logo;
      }

      await existingStoreInfo.save();
    } else {
      // Create a new store info entry
      const storeInfo = new StoreInfo({ userId, address, gst, logo, storeTimings });
      await storeInfo.save();
    }

    res.redirect('/dashboard');
  } catch (err) {
    // Handle the error
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};



exports.postCategory = async (req, res) => {
  const { categoryName } = req.body;

  try {
    const category = new Category({
      name: categoryName,
      userId: req.session.userId,
    });
    await category.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.redirect('/dashboard');
  }
};

exports.postSubCategory = async (req, res) => {
  const { subcategoryName, categoryId } = req.body;

  try {
    const subcategory = new SubCategory({
      name: subcategoryName,
      categoryId,
      userId: req.session.userId,
    });
    await subcategory.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.redirect('/dashboard');
  }
};


exports.postInventory = [
  upload.single('productImage'), // Middleware to handle the image upload

  async (req, res) => {
    const { productName, categoryId, subCategoryId, price , sp , qty} = req.body;

    try {
      const product = new Product({
        name: productName,
        categoryId,
        subCategoryId,
        price,
        sp,
        qty,
        userId: req.session.userId,
        productImage: req.file.filename, // Save the filename of the uploaded image
      });
      await product.save();
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
      res.redirect('/dashboard');
    }
  },
];

exports.logout=(req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error clearing session:', err);
    }
    res.redirect('/');
  });
};
