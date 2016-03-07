/**
 * Created by stewartdunlop on 22/02/2016.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var IntervalSchema   = new Schema({
    start: Number,
    duration: Number,
    type : String
});

module.exports = mongoose.model('Interval', IntervalSchema);

