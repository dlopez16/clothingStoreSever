const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const emailValidator = require("email-validator");
const passwordValitator = require("password-validator");
const bcrypt = require("bcryptjs")
const cors = require("cors");
const CryptoJS = require("crypto-js");
require("dotenv").config()



const app = express();

var schema = new passwordValitator();

schema
    .is().min(5)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}))

mongoose.connect('mongodb://localhost:27017/clothingStore')
    .then(() => {
        console.log("connection Open")
    }).catch(err => {
        console.log(err)
    })

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "staff", "admin"] },
    refreshToken: [{
        token: { type: String },
        expiration: { type: Date }
    }]
})

const User = mongoose.model("User", UserSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())


app.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const firstName = body.firstName;
        const lastName = body.lastName;
        const email = body.email;
        const password = body.password;



        if (!schema.validate(password) || !emailValidator.validate(email)) {
            return res.sendStatus(500)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save()
        console.log(newUser)

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        })
    } catch (error) {
        return res.sendStatus(500) && next(error)
    }

})

app.post("/login", async (req, res, next) => {
    try {
        const body = req.body;
        const email = body.email;
        let password = body.password;
        console.log(password);

        password = CryptoJS.AES.decrypt(password, process.env.VITE_KEY).toString(CryptoJS.enc.Utf8);
        console.log(password)

        if (!password || !email) {
            return res.status(500).json({ error: "invalid information" })
        }
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(500).json({ error: "user not found" })
        }

        const validatePassword = bcrypt.compare(password, user.password)

        if (!validatePassword) {
            return res.status(400).json({ errorMessage: "Invalid Credentials" })
        }

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "from route" }) && next(error)
    }
})


app.get("/whoAmI", async (req, res) => {
    const body = req.body;
    console.log(body)
    const email = body.email
    console.log(email)


    let user = await User.find({ email })
    console.log(user)
    if (!user) {
        return res.status(500).json({ msg: "user not found" })
    }
    res.status(200).json({
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    })
})

app.listen(4800, () => {
    console.log("Now listening on Port 4800")
})