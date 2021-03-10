const express = require('express');
const router = express.Router();
const multer = require('../utils/multer');
const responseUtil = require('../utils/response');
const VideoEditValidator = require('../validators/editor');

router.get('/getvideoid', async(req, res) => {
    await VideoEditValidator.validateCreateVideoID(req, res)
})

router.post('/videothumbnail', (req, res) => {
    multer.single('videofile') (req, res, async (err) => {
        if (err || !req.file) return responseUtil(res, false, 'Failed to upload Video', true, {err: err})
        await VideoEditValidator.getVideoThumbnails(req, res)
    })
})

router.post('/videoedit', async(req, res) => {
    await VideoEditValidator.getFinalVideo(req, res)
})

router.post('/mergevideos', async(req, res) => {
    multer.fields([
        {
            name: 'intro',
            maxCount: 1
        },
        {
            name: 'video',
            maxCount: 1
        },
        {
            name: 'outro',
            maxCount: 1
        }
    ]) (req, res, async(err) => {
        if (err || !req.files) return responseUtil(res, false, 'Failed to upload Videos', true, {err: err})
        await VideoEditValidator.mergeVideos(req, res)
    })
})

router.post('/concatvideos', async (req, res) => {
    await VideoEditValidator.concatVideos(req, res);
})

module.exports = router;