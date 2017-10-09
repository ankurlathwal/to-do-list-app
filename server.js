const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js'); // webpack config file
const app = express();  // express - because it's awesome
//var mongoose = require('mongoose'); // mongoDB driver
//const database = require('./database.js'); // contains database connection code to mongoDB on heroku
var cookieParser = require('cookie-parser'); // stroing cookies
var session = require('express-session'); // for accessing session
var bodyParser = require('body-parser'); // for parsing JSON from request body
var crypto = require("crypto"); // for generating 32-bit hex code
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://ankur:uncorkd@ds161194.mlab.com:61194/heroku_s3511p40";


// using webpack to bundle javascript
const compiler = webpack(webpackConfig);
 
// use body-parser to parse POST data in json
app.use(bodyParser.json());
// serve static files
app.use(express.static(__dirname + '/www'));

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
app.use(session({secret:"Secret session"}));

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected!");
});


var ssn;
// var User = mongoose.model("user");

// Listen to requests using get method 
// Send the number of visits user has made till now using req.page_views
app.get('/getData', function(req, res){
      var type;
      ssn = req.session;
      ssn.data = null;

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
            if(ssn.data !== null)
              res.send({user: ssn.code, visit: ssn.page_views, data: ssn.data.toString()});
            else
            res.send({user: ssn.code, visit: ssn.page_views});
          }  
          
          
          // send ssn.data as string because it is parsed as JSON on the other side.
          

        });
      }); 
      
});

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
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;
  
});




