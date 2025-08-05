const express = require('express');
require('dotenv').config();
const app = express();
const uploadRoute = require('./routes/upload');
const searchRoute = require('./routes/search');

app.use('/upload', uploadRoute);
app.use('/search', searchRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
