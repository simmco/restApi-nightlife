var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

var BarSchema  = new Schema({
    location: String,
    name: String,
    img: String,
    snippet: String,
    visitors: [String]
});

module.exports = mongoose.model('Bar', BarSchema);
