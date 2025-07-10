const express = require('express')
const app = express()
require('dotenv').config()

//Requires starts here

app.get('/',(req,res)=>{
    res.send('I am alive!')
})


//Requires ends here


//database connnection
require("./model/index")



const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server has started at port ${PORT}`)
})