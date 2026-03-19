// const express=require('express');
// const cors=require('cors');
// const usermodel=require('./models/model');
// const app=express();
// const cookieParser = require('cookie-parser');
// const bcrypt=require('bcrypt');
// const jwt = require('jsonwebtoken');



// app.use(cors({
//     origin:"http://localhost:5173",
//     credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());


// app.post("/signup", async (req, res) => {
   

//         const { name, email, password, role } = req.body;

//         const user = await usermodel.findOne({email});

//          if(user){
//             return res.status(409).json({
//                message:"Email Already Exist"
//             });
//          }

//         const salt = await bcrypt.genSalt(10);
//         const hash = await bcrypt.hash(password, salt);

//         const createuser = await usermodel.create({
//             name,
//             email,
//             password: hash,
//             role
//         });

//         const token = jwt.sign({ email }, "shhhh", {
//             expiresIn: "7d"
//         });

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax"
//         });

//         return res.status(201).json({
//             message: "Signup successful",
//             user: createuser
//         });

    
// });

// app.post("/login",async(req,res)=>{
//      const {email,password,name} = req.body;

//       const user = await usermodel.findOne({email});
//       const user1 = await usermodel.findOne({name});

//       if(!user){
//          return res.status(400).json({
//             message:"Invalid email or password"
//          });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);

//       if(!isMatch){
//          return res.status(400).json({
//             message:"Invalid email or password"
//          });
//       }

//       const token = jwt.sign(
//          {email},
//          "shhhh",
//          {expiresIn:"7d"}
//       );

//       res.cookie("token",token,{
//          httpOnly:true,
//          sameSite:"lax",
//          secure:false
//       });

//       res.json({
//          message:"Login successful",
//          role:user.role,
//          name:user.name
//       });
      
    

// })





// app.listen(5000);