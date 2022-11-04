
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended :true}));
app.use(session({
    secret : "Our little Secret.",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportLocalMongoose);

//create a model
const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

    User.register({username : req.body.username}, req.body.password,function(err,user){
        if(err){
            console.log(err)
            res.redirect('/register');
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })

  
});

app.post('/login',(req,res)=>{

    
});



app.listen(port,()=>{
    console.log('listening in port: ' + port);
});

