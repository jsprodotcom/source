/**
 * Created by Sandeep on 01/06/14.
 */

var Movie=require('../models/movie');
var express=require('express');

//configure routes

var router=express.Router();

router.route('/movies')
    .get(function(req,res){
       Movie.find(function(err,movies){
           if(err)
                res.send(err);
           res.json(movies);
       });
    })

    .post(function(req,res){
        var movie=new Movie(req.body);
        movie.save(function(err){
            if(err)
                res.send(err);
            res.send({message:'Movie Added'});
        });
    });

router.route('/movies/:id')
    .put(function(req,res){
        Movie.findOne({_id:req.params.id},function(err,movie){

            if(err)
                res.send(err);

           for(prop in req.body){
                movie[prop]=req.body[prop];
           }

            // save the movie
            movie.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Movie updated!' });
            });

        });
    })

    .get(function(req,res){
        Movie.findOne({_id:req.params.id},function(err, movie) {
            if(err)
                res.send(err);

            res.json(movie);
        });
    })

    .delete(function(req,res){
        Movie.remove({
            _id: req.params.id
        }, function(err, movie) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports=router;
