const express = require('express');
const router = express.Router();
const Activecontroller=require('../Controller/ActiveJobPostings');

router.get('/ActiveJobPosting',Activecontroller.ActiveJobPosting);


module.exports=router;


