const express=require('express');
const router=express.Router();
const Workercardcontroller=require('../Controller/Workercard');
const { protect } = require("../Middleware/Jobpostmiddleware");


router.get('/Workercard', Workercardcontroller.createworkercard); 
// 🔹 ALL workers

router.get('/myWorkercard', protect, Workercardcontroller.getMyWorkercard); 
// 🔹 ONLY logged-in user

module.exports=router;