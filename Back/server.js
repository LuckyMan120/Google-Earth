const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// all routes
const earthRouter = require('./api/routes/RouteModel');
const userRouter = require('./api/routes/userModel');

app.use('/earth', earthRouter);
app.use('/user', userRouter);

app.use('/', express.static(path.resolve(__dirname, './dist')));

app.get('*', function(req, res) {
    res.sendFile(path.resolve(__dirname, './dist/index.html'));
    res.end();
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});