const worker=require("../models/Workerposting");
exports.createworkercard=async(req,res)=>{
    try {
    
        console.log(req.user); // check if user exists
    
        const workers = await worker.find().sort({ createdAt: -1 });
    
        res.json(workers);
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    };
