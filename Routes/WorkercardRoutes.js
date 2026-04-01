const express=require('express');
const router=express.Router();
const Workercardcontroller=require('../Controller/Workercard');

router.get('/Workercard',Workercardcontroller.createworkercard);

module.exports=router;