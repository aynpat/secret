require('dotenv').config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended :true}));


//create a connection to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/userDB",(err)=>{
    if(!err){
        console.log('success connection');
    }
})
//create a schema or format 
const userSchema = new mongoose.Schema({
    username : String,
    password : String
});

//encryption

userSchema.plugin(encrypt,{secret : process.env.SECRET, encryptedFields : ["password"]});
//create a model
const User = mongoose.model("User",userSchema);

app.get('/',(req,res)=>{
    res.render("home");
})

app.get('/register',(req,res)=>{
    res.render("register");
});

app.get('/login',(req,res)=>{
    res.render("login");
});

app.post('/register',(req,res)=>{
    const newUser = new User({
        username : req.body.username,
        password : req.body.password
    });

    newUser.save((err)=>{
        if(!err){
            console.log('success registration for new user');
            res.render('secrets');
        }
        else{
            console.log('failed to register');
            res.render('register');
        }
    });
});

app.post('/login',(req,res)=>{
    User.findOne({title : req.body.username},(err,result)=>{
        if(result){
            if(result.password === req.body.password){
                res.render('secrets');
            }
            else{
                res.send("login")
            }
        }
        else{
            console.log('di mahanap');     
        }
    });
});



app.listen(port,()=>{
    console.log('listening in port: ' + port);
});

