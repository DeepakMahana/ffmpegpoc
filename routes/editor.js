const express = require('express');
// const router = new Router();
const multer = require('../utils/multer');
const responseUtil = require('../utils/response');
const VideoEditValidator = require('../validators/editor');
const app = express();

app.get('/getvideoid', async(req, res) => {
    await VideoEditValidator.validateCreateVideoID(req, res)
})

app.post('/videothumbnail', (req, res) => {
    multer.single('videofile')(req, res, async (err) => {
        if (err || !req.file) return responseUtil(res, false, 'Failed to upload Video', true, {err: err})
        await VideoEditValidator.getVideoThumbnails(req, res)
    })
})

module.exports = app;