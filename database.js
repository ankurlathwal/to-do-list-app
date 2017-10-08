var mongoose = require('mongoose');


mongoose.connect('mongodb://ankur:uncorkd@ds161194.mlab.com:61194/heroku_s3511p40',{ useMongoClient: true });
console.log(mongoose.connection.readyState);

var userSchema = mongoose.Schema({
    name: String,
    data: Array,
  });
var User = mongoose.model("User", userSchema);

