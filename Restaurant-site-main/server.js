const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();

// Middleware to serve static files and parse request body
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Customer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

// Error and connection handlers
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => {
    console.log("MongoDB connection successful");
});

// User Schema for registration/login
const userSchema = new mongoose.Schema({
    Name: String,
    email: String,
    password: String
});

const Users = mongoose.model("User", userSchema);  // Mongoose model for users

// Reservation Schema
const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    guests: Number,
    message: String
});

const Reservation = mongoose.model("Reservation", reservationSchema);  // Mongoose model for reservations

// Newsletter Subscription Schema
const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);  // Mongoose model for newsletter subscriptions

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Serve login page
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html')); // Serve registration page
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index page after login
});

app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'reservation.html')); // Serve the reservation form
});

// Serve the subscription form
app.get('/subscribe', (req, res) => {
    res.sendFile(path.join(__dirname, 'subscribe.html')); // Serve subscription page
});

// POST /register to handle user registration
app.post('/register', async (req, res) => {
    try {
        const { Name, email, password } = req.body;
        const user = new Users({ Name, email, password });
        await user.save();
        console.log('User registered:', user);
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// POST /login to handle user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).send("User not found");
        }

        if (user.password !== password) {
            return res.status(400).send("Invalid password");
        }

        console.log('User logged in:', user);
        res.redirect('/index');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});

// POST /submit-reservation to handle reservation form submission
app.post('/submit-reservation', async (req, res) => {
    try {
        const { name, email, phone, date, time, guests, message } = req.body;

        const newReservation = new Reservation({
            name,
            email,
            phone,
            date,
            time,
            guests,
            message
        });

        await newReservation.save();
        console.log('Reservation saved:', newReservation);
        res.redirect('/index');
    } catch (error) {
        console.error('Error saving reservation:', error);
        res.status(500).send('Error submitting reservation');
    }
});

// POST /subscribe to handle newsletter subscription
app.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        const newSubscription = new Newsletter({ email });
        await newSubscription.save();
        console.log('Email subscribed:', newSubscription);
        
        // Redirect to index.html after successful subscription
        res.redirect('/index');
    } catch (error) {
        console.error('Error subscribing email:', error);
        res.status(400).send('Error subscribing email: ' + error.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log("Server started on port", port);
});


