const express = require('express');

const Category = require('./models/category');
const userRoutes = require('./routes/user')

const app = express();

app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(3000);