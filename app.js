require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 3001;

const files = require('./src/routes/files.route');
const assistant = require('./src/routes/assistant.route');
const whatsappBot = require('./src/routes/whatsappBot.route');
// const path = require('path');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use(cors()) // Use this after the variable declaration

app.use('/files', files);
app.use('/assistant', assistant);
app.use('/whatsapp', whatsappBot);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 'message': err.message });

  return;
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});



// // //for frontend
// // // Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, '../client/build')));

// // // All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
// });