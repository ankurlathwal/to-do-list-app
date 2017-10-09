// The Node.js Server - all the server side code including REST API

const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js'); // webpack config file
const app = express();  // express - because it's awesome
var cookieParser = require('cookie-parser'); // stroing cookies
var session = require('express-session'); // for accessing session
var bodyParser = require('body-parser'); // for parsing JSON from request body
var crypto = require("crypto"); // for generating 32-bit hex code
var MongoClient = require('mongodb').MongoClient; // MongoDB driver for Node.js
var url = "mongodb://ankur:uncorkd@ds161194.mlab.com:61194/heroku_s3511p40"; // link to mLab Mongo Database on Heroku


// webpack to bundle javascript
const compiler = webpack(webpackConfig);
 

app.use(bodyParser.json()); // use body-parser to parse POST data in json

app.use(express.static(__dirname + '/www')); // serve static files

// webpack-middleware
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));

app.use(cookieParser());
app.use(session({secret:"Secret session"})); // access session data

// Connect to MongoDB on Heroku
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected!");
});


var ssn; // session variable

// ssn.code = current user (/?code=user)
// ssn.data = list data
// ssn.page_views = to decide if it's a returning user in current session

// REST API 
// Get User Data - including List data and Session info
app.get('/getData', function(req, res){
      var type; // type of user - to give hex code or not
      ssn = req.session;  
      ssn.data = null; // initialize data to be null

      // check what kind of request is received - if query parameter exists 
      if(typeof req.query.code !== 'undefined'){
        if(ssn.code === req.query.code){
          ssn.page_views++;
      }
        else{
          ssn.code = req.query.code;
          ssn.page_views = 1;          
      }
    }
    else if(typeof req.query.code==='undefined' && typeof ssn.code==='undefined'){
            ssn.page_views = 1;
            ssn.code = crypto.randomBytes(16).toString('hex');
            ssn.userType = "random";

    }
      else{
        if(ssn.userType === 'random'){
          ssn.page_views++;
        }
        else{
          ssn.page_views++;
        }
      }
     
      // fetch data from database after session info
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("users").findOne({name:ssn.code}, function(err, result) {
          if (err) throw err;
          else if(result === null){
            db.collection("users").insertOne({name:ssn.code,data:null},function(err,result){
              if (err) throw err;
              console.log("New User Stored.")
              db.close();
              res.send({user: ssn.code, visit: ssn.page_views});
            });
          }
          else{
            ssn.data = result.data;
            db.close();
            if(ssn.data !== null){
              // send ssn.data as string because it is parsed as JSON on the other side.
              res.send({user: ssn.code, visit: ssn.page_views, data: ssn.data.toString()}); 
            }    
            else
            res.send({user: ssn.code, visit: ssn.page_views});
          }  
          
        });
      }); 
      
});

// POST method to update data when user adds to list 
app.post('/updateData',function(req,res){
    var data = req.body.data; console.log(data);
    var user = req.query.code;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("users").findOne({name:user},function(err,result){
        if(err) throw err;
        else if(result.data === null){
          var insert = [data];
          db.collection("users").updateOne({name:user},{$set: {data: insert}},function(err,result){
            if (err) throw err;
            res.send({data: data});
          });
        }
         else{
           var insert = result.data.slice(0);
           insert.push(data);
           db.collection("users").updateOne({name:user},{$set: {data: insert}},function(err,result){
            if (err) throw err;
            res.send({data: data});
          });

         } 
        
      });
    
});
});


// the app would listen to either the environment port or 3000 by default
// port 3000 if localhost or else process.env.PORT from heroku
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;
  
});




