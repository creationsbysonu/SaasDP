
//Requires starts here
const express = require('express')
const app = express()
require('dotenv').config()
const passport = require('passport')
const { users } = require('./model/index')
const cookieParser = require('cookie-parser');

const generateToken = require('./services/generateToken')
const organizationRoute = require("./routes/organizationRoute")
const { USER } = require('./config/dbConfig')

//Requires ends here


//middlewares here
app.set("view engine", "ejs")
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

passport.serializeUser(function(user,cb){
    cb(null,user) //cb(error,success)---->error
})
passport.deserializeUser(function(obj,cb){
    cb(null,obj) //cb(error,success)---->errors
})


//middleware ends here






//database connnection
require("./model/index")

app.get('/',(req,res)=>{
    res.render("home.ejs")
})

//google login starts here
var userProfile;

let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

passport.use(new GoogleStrategy({
    clientID : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'

    },
    function(accessToken,refreshToken,profile,done) {
            userProfile= profile
            return done(null,userProfile)
        }
    ))


app.get("/auth/google",passport.authenticate("google",{scope:['profile','email']}))
app.get("/auth/google/callback",passport.authenticate("google",{
    failureRedirect: "http://localhost:3000"
}),
async function(req,res){
    const userGoogleEmail = userProfile.emails[0].value
    const user = await users.findOne({
        where:{
            email: userGoogleEmail
        }
    })
    if(user){
            //generate token if user is present
        const token = generateToken(user)
        console.log("user's token only generated")
        res.cookie('token',token)
        res.redirect('/organization')
    }else{
        //if not user in table then add the user credentials in table
        const user = await users.create({
            email : userGoogleEmail,
            googleId : userProfile.id,
            username : userProfile.displayName
        })

        console.log(user,'USER')

        const token = generateToken(user)
        console.log("user's credentials are added to table and token generated")
        res.cookie('token',token)
        res.redirect('/organization')

    }

    res.send("logged in successfully")
    console.log("logged in successfully through the google !!")
}

)



//google login ends here


//routes middleware
app.use('/',organizationRoute)



const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server has started at port ${PORT}`)
})