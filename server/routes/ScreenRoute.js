require('dotenv').config()
const express = require('express')
const router = express.Router();
const { status, ScreenModel } = require('../models/ScreenModel');
const { upload } = require('../Helpers/S3');
const { HTTP_STATUS_CODES } = require('../constants')
router.post('/addScreen', async (req, res) => {
    try {
        screen = req.body;
        console.log(screen);
        const seatArray = []
        Object.entries(screen.seats).forEach(([row, col]) => {
            seatArray.push({
                Row: `${row}`,
                Status: col
            })
        });
        console.log('at /addScreeen');
        const theater_id = req.body.theater_id;
        const screen_count = await ScreenModel.countDocuments({ theater_id: theater_id });
        console.log(screen_count);
        const newScreen = new ScreenModel({
            screen_id: `${theater_id}_Screen_${screen_count + 1}`,
            screen_name: req.body.screenName,
            show_times: req.body.timing,
            screen_type: req.body.format,
            rows: req.body.rows,
            columns: req.body.col,
            seating_capacity: req.body.rows * req.body.col,
            cost: req.body.cost,
            seat_array: seatArray,
            theater_id: theater_id,
        });
        console.log(newScreen);

        // Save the Screen to the database
        await newScreen.save();
        res.json({ message: "Added movie successfully", status: HTTP_STATUS_CODES.OK });
    } catch (error) {
        console.error('Error creating user:', error);
        res.json({
            message: "Internal Server Error",
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        })
    }
})

router.get('/all', async (req, res) => {
    try {
        console.log('/screen/all');
        const screen = await ScreenModel.find();
        res.json({ message: "Screens Found", status: HTTP_STATUS_CODES.OK, data: screen});
    } catch (error) {
        console.error('Error creating user:', error);
        res.json({
            message: "Internal Server Error",
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        })
    }
})
router.get('/getScreen/:id', async (req, res) => {

    try {
        id = req.params['id'];
        fields = ['screen_id', 'screen_name', 'show_times', 'screen_type', 'seat_array', 'rows', 'col']
        const screen = await ScreenModel.find({ screen_id: id }).select(fields);
        console.log(screen);
        res.json({
            message: 'Screen found',
            status: HTTP_STATUS_CODES.OK,
            data: JSON.stringify(screen)
        })

    }
    catch (err) {
        console.log(err);
        res.json({
            message: 'screen Not found',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            data: JSON.stringify("")
        })
    }
})
module.exports = router;