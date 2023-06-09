const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const multer = require('multer');
const middleware = require('../middleware/authMiddleware');
// Configure multer middleware for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads'); // Specify the directory where you want to store the uploaded files
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = file.originalname.split('.').pop();
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
    }
  })
});

router.get('/dashboard', middleware.checkSession, (req, res) => {
  // Render the dashboard page
  res.render('dashboard');
});

router.get('/', dashboardController.getDashboardPage);
router.get('/logout',dashboardController.logout);
router.get('/:businessName/products', dashboardController.searchProducts);
router.get('/:businessName', dashboardController.getStoreInfoPage);
router.post('/store-info', upload.single('logo'), dashboardController.postStoreInfo);
router.post('/category', dashboardController.postCategory);
router.post('/inventory', dashboardController.postInventory);
router.post('/subcategory',dashboardController.postSubCategory);
module.exports = router;
