const worker=require("../models/Workerposting");
exports.createworkercard=async(req,res)=>{
    try {
    
        console.log(req.user); // check if user exists
    
        const workers = await worker.find().sort({ createdAt: -1 });
    
        res.json(workers);
        console.log("USER:", req.user);
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    };

exports.getMyWorkercard = async (req, res) => {
  try {
    // ✅ Get only logged-in user's profile
    const profile = await worker.findOne({ worker: req.user._id });
    console.log(req.user);
    console.log(req.user._id);
    // ✅ If not found → new user
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No profile found",
        data: null
      });
    }

    // ✅ If found → return profile
    res.status(200).json({
      success: true,
      data: profile
    });
    

  } catch (err) {
    console.error("MY PROFILE ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};