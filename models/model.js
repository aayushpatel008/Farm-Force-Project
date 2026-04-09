const mongoose=require('mongoose');

const userSchma=mongoose.Schema({

    name:String,
    email:String,
    password:String,
    role: {
        type: String,
        enum: ["worker", "provider"],
        default: "worker"
    }
    
})

module.exports=mongoose.model("User",userSchma);