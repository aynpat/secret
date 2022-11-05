
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

app.get('/secrets',(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect('/login');
    }
});

app.get('/changepassword',(req,res)=>{
    res.render('changepassword');
});

app.post('/changepassword',(req,res)=>{
    User.findByUsername(req.body.username,function(err,user){
        if(err){
            console.log('no user is found');
        }
        else{
            user.changePassword(req.body.oldPass,req.body.newPass,function(err){
                if(err){
                    res.send(err);
                }
                else{
                    user.save();
                    res.send('successfully changed password');
                }
            })
        }
    })
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/login", function(req, res){
    //check the DB to see if the username that was used to login exists in the DB
    User.findOne({username: req.body.username}, function(err, foundUser){
      //if username is found in the database, create an object called "user" that will store the username and password
      //that was used to login
      if(foundUser){
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });
        //use the "user" object that was just created to check against the username and password in the database
        //in this case below, "user" will either return a "false" boolean value if it doesn't match, or it will
        //return the user found in the database
        passport.authenticate("local", function(err, user){
          if(err){
            console.log(err);
          } else {
            //this is the "user" returned from the passport.authenticate callback, which will be either
            //a false boolean value if no it didn't match the username and password or
            //a the user that was found, which would make it a truthy statement
            if(user){
              //if true, then log the user in, else redirect to login page
              req.login(user, function(err){
              res.redirect("/secrets");
              });
            } else {
              res.redirect("/login");
            }
          }
        })(req, res);
      //if no username is found at all, redirect to login page.
      } else {
        //user does not exists
        res.redirect("/login")
      }
    });
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(!err){
            res.redirect('/');
        }
    })
})

app.listen(port,()=>{
    console.log('listening in port: ' + port);
});

