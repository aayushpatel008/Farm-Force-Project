const express=require('express');
const router=express.Router();
const { protect } = require("../Middleware/Jobpostmiddleware");


const postworker=require('../Controller/postworker');

router.post('/applicationpost',protect,postworker.Creatapplication);

module.exports=router;