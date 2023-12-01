require('dotenv').config();
const express = require('express');
const router = express.Router();
const { upload } = require('../Helpers/S3');
const { HTTP_STATUS_CODES } = require('../constants')
const { status, ScreenModel } = require('../models/ScreenModel');
const Theater = require('../models/TheaterModel');
const uniqueId = require('uniqid');
const Movie = require('../models/MovieModel');
router.post('/add', upload.single('file'), async (req, res) => {
    try {
        console.log('at /addTheater');
        // console.log(JSON.parse(req.body.data).theater_name);
        const post_data = JSON.parse(req.body.data);
        const count = await Theater.countDocuments();
        image_url = req.file.location;
        console.log(req.body);
        const newTheater = new Theater({
            id: uniqueId(),
            name: post_data.theater_name,
            description: post_data.description,
            location: post_data.state,
            zipcode: post_data.zipcode,
            theater_url: post_data.location_url,
            image_url: image_url,
            theater_constructed_date: post_data.theatre_constructed_date,
            theater_id: uniqueId,
            state: post_data.state,
            movie_ids: [],
            address: post_data.address,
            mobile: post_data.phno,
            city: post_data.city,
            mail: post_data.email
        })
        console.log(newTheater);
        await newTheater.save();
        res.json({ message: "Theatre Created successfully", status: HTTP_STATUS_CODES.OK, data: newTheater });
    }
    catch (err) {
        console.log(err);
        res.json({
            message: 'Uff...Contact..Admin',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            data: JSON.stringify(err)
        })

    }
})

router.get('/all', async (req, res) => {
    try {
        const theaters = await Theater.find();
        console.log(theaters)
        res.json({
            message: 'Theater found',
            status: HTTP_STATUS_CODES.OK,
            data: theaters
        })
    }
    catch (err) {
        console.log(err);
        res.json({
            message: 'Theater Not found',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            data: JSON.stringify("")
        })
    }
})

router.get('/getTheaterDetail/:id', async (req, res) => {

    try {
        id = req.params['id'];
        const theater = await Theater.find({ theater_id: id });
        console.log(theater);

        res.json({
            message: 'Theater found',
            status: HTTP_STATUS_CODES.OK,
            data: JSON.stringify(theater)
        })

    }
    catch (err) {
        console.log(err);
        res.json({
            message: 'Theater Not found',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            data: JSON.stringify("")
        })
    }
})

router.get('/getAllTheatersScreens/:id', async (req, res) => {
    try {
        console.log(req.params['id']);
        const Theaters = await Theater.find({ movie_ids: { $in: [req.params['id']] } }).select({ name: 1, id: 1, _id: 0 });
        const movie_data = await Movie.findOne({ id: req.params['id'] })
        console.log(movie_data);
        var response = [];
        for (const theater of Theaters) {
            const screenDetails = await ScreenModel.find({ theater_id: theater.id, movie_id: req.params['id'] }).select({ name: 1, id: 1, show_timings: 1, _id: 0, price: 1 });
            console.log(screenDetails);
            response.push({
                id: theater.id,
                name: theater.name,
                screen_details: screenDetails
            });
        }

        data = {
            movieName: movie_data.title,
            releaseDate: movie_data.release_date,
            endDate: movie_data.end_date,
            theaters: response
        }
        res.json({
            message: 'Theaters found',
            status: HTTP_STATUS_CODES.OK,
            data: data
        })
    }
    catch (err) {
        console.log(err);
        res.json({
            message: 'Theaters Not found',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            data: JSON.stringify("")
        })
    }
});
router.post('/updateTheater', upload.single('file'), async (req, res) => {
    const post_data = JSON.parse(req.body.data);
    console.log('at /updateTheater');
    console.log(post_data);
    if (req.file) {
        image_url = req.file.location;
    }
    await Theater.updateOne({ id: post_data.id }, {
        name: post_data.theater_name,
        description: post_data.description,
        location: post_data.state,
        zipcode: post_data.zipcode,
        theater_url: post_data.location_url,
        ...(req.file && { image_url }),
        theater_constructed_date: post_data.theatre_constructed_date,
        movie_ids: [],
        address: post_data.address,
        state: post_data.state,
        mobile: post_data.phno,
        city: post_data.city,
        mail: post_data.email
    }).then((result) => {
        console.log(result);
        res.status(HTTP_STATUS_CODES.OK).send("updated successfully");
    }).catch((error) => {
        console.error(error);
    })
});
router.post('/deleteTheater', async (req, res) => {
    id = req.body.id;
    console.log(id);
    console.log("___________________");
    await Theater.deleteOne({ id: id }).then((result) => {
        console.log(result);
        res.status(HTTP_STATUS_CODES.OK).send("deleted Successfully");
    }).catch((err) => {
        console.log(err);
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal server Error");
    })
});
router.get('/getTheatersNearBy/:pincode', async (req, res) => {
    console.log(req.params['pincode']);
    pincode = Number(req.params['pincode']);
    try {

        const theatersNearby = await Theater.find({
            zipcode: { $gte: pincode - 500, $lte: pincode + 500 }
        });
        res.json({
            theaters: theatersNearby
        })
    }
    catch (err) {
        console.log(err);
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send("Interal server error");
    }
});
module.exports = router; 