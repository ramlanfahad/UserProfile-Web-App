const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');
const { iteratee } = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
//const MongoClient = require('mongodb').MongoClient;
const { authenticate } = require('passport');
//const Strategy = require();
const async = require('async');
//const nodemailer = require('nodemailer');
const crypto = require('crypto');
const https = require('https');
//const request = require('request');
const { urlencoded } = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const flash = require('connect-flash');
const ObjectID = require('mongodb').ObjectID;
const { serialize } = require('v8');

const app = express();

app.set('view engine', 'ejs');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "Anything",
    resave: false,
    saveUninitialized: false

}));

//after init session above we init passport

app.use(passport.initialize());
//to use passport inorder to initialize our session
app.use(passport.session());

// MongoClient.connect("mongodb://localhost",(err, client) => {
//     if(err){
//         console.log("err while cannecting to db" , err);
//     }
//     const db = client.db("user-profiles");
//     const users = db.collection('users');
//     app.locals.users = users;
// });

mongoose.connect("mongodb://localhost:27017/userprofilesss", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useCreateIndex', true);

app.use(express.static("public"));

const userschema = new mongoose.Schema({
    username: String,
    names: String,
    github: String,
    twitter: String,
    facebook: String,
    linkedin: String,
    profession: String,
    status: String,
    job: String
});



userschema.plugin(passportLocalMongoose);
userschema.plugin(findOrCreate);

const User = mongoose.model("User", userschema);


passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


app.get("/", function (req, res) {

    User.find({}, function (err, recent) {
        console.log("index page", recent);

        res.render("index", { recents: recent });

    });

})


app.get("/login", function (req, res) {
    res.render("login");
})


app.get("/register", function (req, res) {
    res.render("register");
});

//users route
app.get('/users', function (req, res) {
    const _id = ObjectID(req.session.passport.user);

    User.findOne({ _id }, (err, results) => {
        if (err) {
            console.log('user not found')
        }
        console.log(results)
        res.render('account', {
            result: results
        });
    })
});


// public profile viewing route

app.get('/users/:username', function (req, res) {
    const _id = ObjectID(req.session.passport.user);
    const username = req.params.username;

    User.findOne({ _id }, (err, results) => {
        console.log(results)

        console.log("the results for public-viewing route", results);
        res.render('admin-profile', {
            result: results,
            username: username
        });
    })
});

//users route for public viewing
app.get('/users/public/:id', function (req, res) {

    const _id = req.params.id;

    User.findOne({ _id }, (err, results) => {
        console.log(results)

        console.log("the results for public-viewing route", results);
        res.render('public-profile', {
            result: results,
            username: results.username
        });
    })
});



// post route for the form where user updates his data
app.post('/users', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    }

    const { names, github, twitter, facebook, linkedin, profession, status, job } = req.body;
    const _id = ObjectID(req.session.passport.user);
    console.log(names, github, twitter, facebook, linkedin, profession, status, job);
    console.log("here id", _id);
    // const defaultItems = new User({
    //     names: names,
    //     github:github,
    //     twitter: twitter,
    //     facebook: facebook
    // });





    User.updateOne({ _id }, { $set: { names: names, github: github, twitter: twitter, facebook: facebook, linkedin: linkedin, profession: profession, status: status, job: job } },
        // User.updateOne({_id},{ $set: { names, github , twitter, facebook }},

        (err) => {
            if (err) {
                console.log("error while updating")
            }
            res.redirect('/users');

        }
    );


    // if(err){
    //     ("error while updating");

    // }

});


app.post("/register", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/login")
            })
        }
    })


});


app.post("/login", function (req, res) {

    const users = new User({
        username: req.body.username,
        password: req.body.password
    });




    //to login we call the login() ,which is called using the req object

    req.login(users, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            // passport.authenticate("local")(req,res,function(){

            //     res.redirect("/register")
            passport.authenticate('local', {
                successRedirect: '/users',
                failureRedirect: '/login'
            })(req, res, function () {
                res.redirect("/users")
            })



        }
    });


});

app.get("/logout", function (req, res) {
    req.logOut();
    res.redirect('/')
});


// For the blog pages
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const postsSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Post = mongoose.model("Post", postsSchema);

// blog home page
app.get('/bhome', function (req, res) {
    Post.find({}, function (err, posts) {
        res.render('Bloghome', {
            homedesc: homeStartingContent,
            posts: posts
        });
    });
});

// about us page
app.get("/about", function (req, res) {

    res.render("about", { aboutdescs: aboutContent })

})

//contact page
app.get("/contact", function (req, res) {

    res.render("contact", { contdesc: contactContent })

});

// get a single page for each blog 
app.get('/posts/:topic', function (req, res) {

    const requestedTitle = req.params.topic;

    Post.findOne({ _id: requestedTitle }, function (err, post) {
        res.render('post', {
            title: post.title,
            content: post.content
        });
    });
});

// compose page
app.get("/compose", function (req, res) {
    res.render("compose", {})
});


app.post("/compose", function (req, res) {

    const newtitle = req.body.composein;

    const newcontent = req.body.textarea;

    const adding = new Post({
        title: newtitle,
        content: newcontent
    });
    adding.save();
    res.redirect("/bhome");


})




app.listen(3000, function () {
    console.log("server heard on port 3000")
})