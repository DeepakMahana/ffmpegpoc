/**
 * @file Express application setup
 * @description This file defines configuration of express application
 *      such as router config, parser config, log setup, etc.
 *
 * @author Deepak Mahana <Deepak.Mahana@nw18.com>
 */

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dir = path.join(os.tmpdir(),'videorepo')

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

const app = express();

// Logger for HTTP Requests
const env = process.env.NODE_ENV || 'local';
if (env !== 'production') {
  const logger = require('morgan'); // eslint-disable-line global-require
  app.use(logger('dev'));
}

// Enable Cross-origin resource sharing
app.use(cors());

// Enable gzip compression
app.use(compression());

// Enable helmet middleware
app.use(helmet());

// Disable x-powered-by header
app.disable('x-powered-by');

// Body-parser
app.use(bodyParser.urlencoded({extended: true, limit: '2048mb'}))
app.use(bodyParser.json({limit:'2048mb'}))

// Enable routes
const editor = require('./routes/editor');
app.use('/editor', editor);

// app.use('*', (req, res) => responseUtil(res, false, 'Not Found!', true, {}, 404));

app.listen(3000, () => {
console.log(`Server listening on: 3000`);
});

