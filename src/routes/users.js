const express = require('express');
const User = require('../models/user')
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router()


// adding 1st route
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    // we are using try and catch here to handle errors of indiv promise
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// Route for login

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()  // it will gen token a 
        res.send({ user, token })  // all user data, token

    } catch (e) {
        res.status(400).send()
    }
})

// logout user
router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()  // save in user db

        res.send('logged out successfully')  // send back updated arr token list
    } catch (e) {
        res.status(500).send()
    }
})


// logout all tokens
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('all sessions logged out')
    } catch (e) {
        res.status(500).send()
    }
})


// get: (reading resources)

router.get("/users/me", auth, async (req, res) => {
    try {
        res.send(req.user);
    }
    catch (e) {
        res.status(500).send();
    };
});


// Updating USER data - to update my own profile
// changed end point to /users/me
// added auth middleware - which gave access to req.user._id
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));


    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const user = await User.findById(req.user._id);

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
})

    /



    router.delete('/users/me', auth, async (req, res) => {
        try {
            await req.user.remove()
            res.send(req.user);
        } catch (e) {
            res.status(500).send(e)
        }
    })



// Setup endpoint for avatar upload
const upload = multer({
    // dest: 'avatars',  removed we want to save it in db
    limits: {  // limits for file size - multi limits we can set
        fileSize: 1000000  // no. in bytes (in Bytes) - 1MB - save DB size
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;

    // above thing is in buffer format - and providing it to db feild
    await req.user.save();
    const use = req.user
    res.send(use);
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
})

// delete the avatar - challenge
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save();  // await keyword missed - await returns a promise.
        res.send('avatar deleted')
    } catch (e) {
        res.status(400).send(e)
    }
})

// setting up a link, for fetching the avatar in browsers
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')  // reformating to png and then saving it.
        // sending the data back
        res.send(user.avatar) // we can access the avatar by their id.
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router;
