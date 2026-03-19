const express = require('express');
const router = express.Router();
const { protect } = require("../Middleware/Jobpostmiddleware");


const postController=require('../Controller/postcontroller');

router.post('/jobpost',protect,postController.createJob);


module.exports = router;