const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const app = express();
var mongoose = require('mongoose');
const database = require('./database.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

 
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

// Listen to requests using get method 
// Send the number of visits user has made till now using req.page_views
app.get('/session', function(req, res){

      ssn = req.session;
      if(ssn.page_views){
        ssn.page_views++;

      } else {
        ssn.page_views = 1;
        ssn.code = req.query.code;
      }
      res.send({user: ssn.code, visit: ssn.page_views});
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




