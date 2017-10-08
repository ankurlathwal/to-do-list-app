const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js'); // webpack config file
const app = express();  // express - because it's awesome
var mongoose = require('mongoose'); // mongoDB driver
const database = require('./database.js'); // contains database connection code to mongoDB on heroku
var cookieParser = require('cookie-parser'); // stroing cookies
var session = require('express-session'); // for accessing session
var bodyParser = require('body-parser'); // for parsing JSON from request body
var crypto = require("crypto"); // for generating 32-bit hex code

 
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

var ssn;
var User = mongoose.model("User");

// Listen to requests using get method 
// Send the number of visits user has made till now using req.page_views
app.get('/session', function(req, res){
      var type;
      var data;
      ssn = req.session;

      if(typeof req.query.code !== 'undefined'){
        if(ssn.code === req.query.code){
          ssn.page_views++;
          // findOne and update data
          User.findOne({name: ssn.code}, 
                function(err, response){
                   if(err){
                    type = "error";
                    data = null;
                   }   
                   else{
                    type = "success";
                    // data = response.data;
                    data = null;
                   }
        });
      }
        else{
          ssn.code = req.query.code;
          ssn.page_views = 1;
          // findOne and set data
          User.findOne({name: ssn.code}, 
            function(err, response){
               if(err){
                type = "error";
                data = null;
               }   
               else{
                type = "success";
                // data = response.data;
                data = null;
               }
        });
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
          // update data in session
          ssn.data = null;
        }
        else{
          ssn.page_views++;
          // findOne data for ssn.code and update data
          User.findOne({name: ssn.code}, 
            function(err, response){
               if(err){
                type = "error";
                data = null;
               }   
               else{
                type = "success";
                // data = response.data;
                data = null;
               }
        });
        }

      }
      
      res.send({type: type,user: ssn.code, data: ssn.page_views});
});

app.post('/user',function (req,res) {

    var userInfo = req.body;
    var User = mongoose.model("User");
    var newUser = new User({
      name: userInfo.name
    }); 
  

    newUser.save(function(err, User){
      if(err)
         res.send({message: "Database error", type: "error"});
      else
         res.send( {
            message: "New person added", type: "success"});
   });
  });


// the app would listen to either the environment port or 3000 by default
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;
  
});




