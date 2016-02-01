/**
 * Created by Sandeep on 01/06/14.
 */

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var movieSchema=new Schema({
    title:String,
    releaseYear:'String',
    director:'String',
    genre:'String'
});

module.exports=mongoose.model('Movie',movieSchema);