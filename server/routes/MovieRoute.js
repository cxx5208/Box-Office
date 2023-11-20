require('dotenv').config()
const express = require('express')
const router = express.Router();
const Movie = require('../models/MovieModel');
const uniqid = require('uniqid');
const { upload } = require('../Helpers/S3');
const { HTTP_STATUS_CODES } = require('../constants')

router.post('/add', upload.array('movieposter',2),async (req, res) => {
     try {
         console.log(req.body);
         console.log(req.files);
        const newMovie = new Movie({
            id:uniqid(),
            title: req.body.movieName,
            cast: req.body.cast,
            description: req.body.AboutTheMovie,
            genres: req.body.genre,
            format: req.body.format,
            languages: req.body.languages,
            movie_trailer_url: req.body.movieTrailerLink,
            run_time:req.body.Runtime,
            rating:0,
            release_date: req.body.releaseDate,
            end_date: req.body.endDate,
            cast: req.body.castIds.split(','),
            crew: req.body.crewIds.split(',') ,
            certificate:req.body.certificate,
            ticket_price:0,
            tickets_sold:0,
            poster_url: req.files[0].location,
            banner_url: req.files[1].location,
            popularity: 0,          
        });

        // Save the user to the database
        await newMovie.save();
        res.json({ message: "Added movie successfully", status: HTTP_STATUS_CODES.OK });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/all', async (req, res) => {
     try {
      
        // Save the user to the database
        const movies = await Movie.find();
        res.json({ message: "Added movie successfully", status: HTTP_STATUS_CODES.OK,movies:movies });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/:id', async (req, res) => {
     try {
      
        // Save the user to the database
        const movies = await Movie.find({movie_id:id});
        res.json({ message: "Added movie successfully", status: HTTP_STATUS_CODES.OK,movies:movies });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;