const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
 
// using webpack to bundle javascript
const compiler = webpack(webpackConfig);
 
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
app.get('/session', function(req, res){
  ssn = req.session;
  
  if(ssn.page_views){
     ssn.page_views++;

  } else {
     ssn.page_views = 1;
     ssn.code = req.query.code;
  }
  res.send(ssn.code);
});


// the app would listen to either the environment port or 3000 by default
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;
  
});




