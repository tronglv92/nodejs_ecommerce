const express=require('express')
const morgan=require('morgan')
const compression=require('compression')
const {default:helmet}=require('helmet')

const app =express()



//  init middlewares
app.use(morgan("dev")); // dev dung mode dev, product dung combined
// morgan("combined")
// morgan("common");
// morgan("short");
// morgan("tiny");
// morgan("dev");
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

//  init db
require('./dbs/init.mongodb')
// const {checkOverload}=require('./helpers/check.connect')
// checkOverload();

//  init routes
app.use('',require('./routes'))

//  handling error

app.use((req,res,next)=>{
    console.log("Vao trong nay 1");
    const error=new Error('Not Found')
    error.status=404
    next(error)
})

app.use((error,req,res,next)=>{
    const statusCode=error.status || 500

    console.log("Vao trong nay 2")
    return res.status(statusCode).json({
      status: "error",
      code: statusCode,
      message: error.message || "Internal Server Error",
      trace:error.stack
    });
})

module.exports=app