require('dotenv').config()
const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const { HTTP_STATUS_CODES } = require('../constants')
const { createToken } = require('../Helpers/JwtAuth');
const { upload } = require('../Helpers/S3');
const { sendMessage } = require('../Helpers/WhatsappAPI');
const uniqid = require('uniqid');
const { RedisHelperAdd, RedisHelperGet, RedisHelperDelete } = require('../Helpers/RedisHelper');
const { createCustomer } = require('../Helpers/stripeAPI');
const { sendSignUpEmail, sendTicketEmail } = require('../Helpers/sendGridHelper');
const { generateAndPingQRCode } = require('../Helpers/qrCodeGenerator');
const Movie = require('../models/MovieModel');
const Transaction = require('../models/TransactionModel');
const saltRounds = 10;
router.get('/addUser', async (req, res) => {
    // RedisHelperAdd(req, res, "hello", { "token": "hello" })
    // const data = await RedisHelperGet("hello");
    // console.log('_______');
    // console.log(data);
    // res.json({
    //    /     data: JSON.parse(data)
    // })
    // const data = {
    //     email: 'mahendrachittupolu@gmail.com',
    //     name: 'Mahendra',
    //     movieName: 'Animal',
    //     showTime: '9:00 Am',
    //     seatNos: 'A1 B1 C1 D1',
    //     theaterName: "sandhya",
    //     qrlink: "https://cdn.britannica.com/17/155017-050-9AC96FC8/Example-QR-code.jpg"
    // };
    // // sendSignUpEmail(data);
    // // console.log(data)
    generateAndPingQRCode('123456789', "Test");
    // sendTicketEmail(data);
    // res.send('Hello, world!');
});

router.post('/signup', upload.single('file'), async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const name = req.body.fullName;
    const phoneNumber = req.body.phoneNumber;
    const password_value = req.body.password;
    const confirmPassword = req.body.confirmPassword
    const dob = req.body.dateOfBirth;
    const gender = req.body.gender;
    const address2 = req.body.address2;
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;
    const zipCode = req.body.zipCode;
    const address1 = req.body.address1;
    const genres = req.body.genres;
    const cast = req.body.favoriteArtists;
    const crew = req.body.favoriteCrew;
    const profile_url = req.file.location;
    const preferredLanguages = req.body.preferredLanguages

    const password = await bcrypt.hash(password_value, saltRounds);
    isAdmin = false;
    if (req.body.name == 'admin' && req.body.email == 'boxoffice3108@gmail.com') {
        isAdmin = true;
    }
    if (password_value == confirmPassword) {
        const newUser = new User({
            user_id: uniqid(),
            fullname: name,
            email: email,
            password: password,
            firstname: '',
            lastname: '',
            dob: dob,
            gender: gender,
            mobile: phoneNumber,
            genres: genres,
            stripe_customer_id: '',
            profile_url: profile_url,
            favourite_artists: cast,
            favourite_crew: crew,
            preferred_languages: preferredLanguages,
            address1: address1,
            address2: address2,
            city: city,
            state: state,
            country: country,
            zipcode: zipCode,
            is_admin: isAdmin,
            is_prime: false,
        });
        //  const customerID = await createCustomer(newUser.user_id, name, email, phoneNumber);
        //    newUser.stripe_customer_id = customerID;
        console.log(newUser);
        // Save the user to the database

        try {
            await newUser.save();

            res.status(HTTP_STATUS_CODES.OK).send("user registered successfully");
        }
        catch (err) {
            console.error(err);
            res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("internal server error");
        }
    }
    else {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("passwords Not Matching");
    }

})

router.post("/login", async (req, res) => {
    try {
        email = req.body.email;
        password = req.body.password;
        console.log(email);
        const users = await User.findOne({ email: email });
        console.log(users);
        // users_obj = JSON.parse(users);
        // console.log(users_obj.password);
        if (users == null) {
            // res.json({
            //     message: 'user not found',
            //     status: HTTP_STATUS_CODES.NOT_FOUND
            // })
            res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send("user not found");
        }
        else {
            data = { email: req.body.email, fullname: users.fullname, isAdmin: users.is_admin, profile_url: users.profile_url, user_id: users.user_id }
            createToken(req, res, email, password);
            console.log(res.getHeaders()['set-cookie']);
            password_match = await bcrypt.compare(password, users.password)
            if (password_match) {
                res.json({
                    message: 'user found',
                    status: HTTP_STATUS_CODES.OK,
                    data: data
                })
            }
            else {
                res.json({
                    message: 'password incorrect',
                    status: HTTP_STATUS_CODES.NOT_FOUND,
                    data: data
                })
            }

        }

    }
    catch (error) {
        console.error('Error loggin in user', error);
        res.json({
            message: 'Uff..Somethin went wrong..Contact admin',
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        })
    }
})

router.post('/updateProfile', upload.single('file'), async (req, res) => {
    post_data = req.body;
    console.log(post_data);
    if (req.file) {
        profile_url = req.file.location;
    }
    const cast = req.body.favoriteCast;
    const crew = req.body.favoriteCrew;
        await User.updateOne({ user_id: post_data.id }, {
            fullname: post_data.fullName,
            email: post_data.email,
            firstname: '',
            lastname: '',
            dob: post_data.dob,
            gender: post_data.gender,
            mobile: post_data.phoneNumber,
            genres: post_data.genres,
            favourite_artists: cast,
            favourite_crew: crew,
            preferred_languages: post_data.preferredLanguages,
            address1: post_data.address1,
            address2: post_data.address2,
            city: post_data.city,
            state: post_data.state,
            country: post_data.scountry,
            zipcode: post_data.zipCode,
            ...(req.file && { profile_url }),
        }).then((result) => {
            console.log(result);
            res.status(HTTP_STATUS_CODES.OK).send("updated successfully");
        }).catch((error) => {
            console.error(error);
        })
});


router.post('/uploadFile', upload.single('file1'), (req, res) => {
    upload.single('file2')
    const uploadedFile = req.file;
    console.log(uploadedFile);
    const imageUrls = uploadedFile.map((file) => {
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
    });
    res.json({ imageUrls });
});

router.get('/sendMessage', async (req, res) => {
    // console.log(req.body);
    sendMessage(req, res);
    // res.json({ message: "User details updated successfully", status: HTTP_STATUS_CODES.OK });
});
router.get('/profileDetails/:id', async (req, res) => {
    id = req.params['id'];
    console.log(id);
    await User.findOne({ user_id: id }).then((result) => {
        console.log(result);
        res.json({
            message: "User details",
            status: HTTP_STATUS_CODES.OK,
            data: result
        })
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Internal server Error");
    })

});

router.get('/getPurchaseHistory/:id', async (req, res) => {
    id = req.params['id'];
    console.log(id);
    await Transaction.findOne({ user_id: id }).then((result) => {
        console.log(result);
        res.json({
            message: "Purchase History details",
            status: HTTP_STATUS_CODES.OK,
            data: result
        })
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Internal server Error");
    })

});

router.get('/getReommendedMovies/:id', async (req, res) => {
    id = req.params['id'];
    const user = await User.findOne({ user_id: id });
    const userPreferredGenresString = user.genres[0];
    const userPreferredGenres = userPreferredGenresString.split(',').map(genre => genre.trim());
    console.log(userPreferredGenres);
    try {
        const recommendedMovies = await Movie.find({
            $or: userPreferredGenres.map(genre => ({ genres: new RegExp(genre, 'i') })),
        });
        res.json({
            status: HTTP_STATUS_CODES.OK,
            message: "found Movies",
            data: recommendedMovies
        })
    }
    catch (err) {
        console.error(err);
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send("OOPS>>>....");
    }
})

router.get('/getRewards/:id', async (req, res) => { 
    id = req.params['id'];
    console.log(id);
    await User.findOne({ user_id: id }).select({ "rewards": 1 }).then((result) => {
        console.log(result);
        res.json({
            message: "Rewards details",
            status: HTTP_STATUS_CODES.OK,
            data: result.rewards
        })
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Internal server Error");
    })
});
module.exports = router;