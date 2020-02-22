var express                 = require("express"),
    bodyParser              = require('body-parser'),
    mongoose                = require('mongoose'),
    passport                = require("passport"),
    passportlocal           = require("passport-local"),
    passportlocalmongoose   = require("passport-local-mongoose"),
    expresssession          = require("express-session"),
    request                 = require("request");

var  app=express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expresssession({
    secret:"gagan gupta ",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
   res.locals.currentuser = req.user;
   next();
});

mongoose.connect('mongodb+srv://gagangupta27:gagan717114@gagan-4szys.mongodb.net/test?retryWrites=true&w=majority',{ useNewUrlParser: true });
var shows_schema = new mongoose.Schema({
    name: String,
    text:String,
    img: String
});
var show =mongoose.model("show",shows_schema);

var userschema = new mongoose.Schema({
    name:String,
    username:String,
    password:String
});
userschema.plugin(passportlocalmongoose);
var user =mongoose.model("user",userschema);
passport.use(new passportlocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


//======================================================================================================================
//      routes
//==================================================================================================================

app.post("/results",function(req,res){
    request("http://www.omdbapi.com/?apikey=56424262&s="+req.body.search,function(error,response,body){
        if(!error && response.statusCode==200){
            var result = JSON.parse(body);
            res.render("results.ejs",{result:result["Search"]});
            
        }
    });
});



app.get("/",function(req,res){
    res.render("index.ejs");
});

app.post("/newpost",isloggedin,function(req,res){
    show.create(req.body.sh);
        res.redirect("/");
   
});
app.get("/newpost",isloggedin,function(req,res){
   res.render("new.ejs"); 
});
app.get("/allshows",function(req,res){
          show.find({},function(err,shows){
            if(err){
                console.log(err);
            }
            else{
                res.render("allshows.ejs",{shows:shows});
            }
        });
});

app.get("/login",function(req,res){
   res.render("login.ejs"); 
});

app.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/login"}),function(req,res){
});

app.get("/signup",function(req,res){
   res.render("signup.ejs"); 
});

app.post("/signup",function(req,res){
     let errors = [];
  if (!req.body.name || !req.body.username || !req.body.password || !req.body.password2) 
  {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (req.body.password != req.body.password2) 
  {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (req.body.password.length < 6) 
  {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  if (errors.length > 0) 
  {
    res.render("signup.ejs", {
      errors:errors,
      name:req.body.name,
      username:req.body.username,
      password:req.body.password,
      password2:req.body.password2
                            });
  } else 
    {
    user.findOne({ username: req.body.username },function(err,users){
        if(err)
        {
            console.log(err);
        }
         if (users) {
        errors.push({ msg: 'Email already exists' });
        res.render("signup.ejs", {
      errors:errors,
      name:req.body.name,
      username:req.body.username,
      password:req.body.password,
      password2:req.body.password2
        });
    }
    else {
    user.register(new user({username:req.body.username,name:req.body.name}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.redirect("/signup");
      } 
      passport.authenticate("local")(req,res,function(){
         res.redirect("/"); 
      });
   });
    }
    });
    
}
});

app.get("/logout",isloggedin,function(req,res){
   req.logout();
   res.redirect("/");
});

app.get("/profile/:id",isloggedin,function(req,res){
    res.render("profile.ejs");
});

app.get("/shows/:id",function(req,res){
    
    request("http://www.omdbapi.com/?apikey=56424262&i="+req.params.id,function(error,response,body){
        if(!error && response.statusCode==200){
            var result = JSON.parse(body);
            res.render("shows.ejs",{result:result});
            console.log(result);
        }
    });
});


function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function loginmiddleware(req,res,next)
{
        if(0)
        {
        }
        else{
        passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/login"
        });
        }
}
app.listen(3000,function(){
    console.log("server is running");
});
