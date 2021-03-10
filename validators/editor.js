const path = require('path');
const os = require('os');
const fs = require('fs');
const Editor = require('../core/editor');
const responseUtil = require('../utils/response');
const s3Download = require("../utils/s3-download");

const validateCreateVideoID = async (req, res) => {
    try {
        let createVideoID = await Editor.getId();
        responseUtil(res, true, 'Video ID Created Successfully', false, createVideoID)
    } catch (err) {
        responseUtil(res, false, 'Failed to create Video ID', true, {})
    }
}

const getVideoThumbnails = async (req, res) => {
    try {
        let videoPath = req.body.videoPath;
        let fileName = req.body.fileName;
        let processId = req.body.id;
        let thumbnails = await Editor.fetchVideoThumbnails(processId, videoPath, fileName)
        responseUtil(res, true, 'Thumbnails Created Successfully', false, thumbnails)
    } catch (err) {
        responseUtil(res, false, err, true, {})
    }
}

const getFinalVideo = async (req, res) => {
    try {
        let id = req.body.id
        let videos = req.body.videos;
        let videoDir = path.join(os.tmpdir(), 'videorepo', id);
        if (!fs.existsSync(videoDir)) {
            responseUtil(res, false, "Process ID not found", true, {})
        }
        if (videos.length < 1) {
            responseUtil(res, false, "Not found any Videos", true, {})
        }
        let finalVideo = await Editor.processVideos(id, videoDir, videos)
        console.log(finalVideo);
        responseUtil(res, true, 'Video Edited Successfully', false, finalVideo)
    } catch (err) {
        responseUtil(res, false, err, true, {})
    }
}

const mergeVideos = async (req, res) => {
    try {
        if (
            !req.files.intro[0] ||
            !req.files.video[0] ||
            !req.files.outro[0] ||
            !req.body.id
        ) responseUtil(res, false, "Some video failed to upload", true, {})
        let id = req.body.id
        let intro = req.files.intro[0]
        let video = req.files.video[0]
        let outro = req.files.outro[0]
        let finalout = await Editor.mergeVideos(id, intro, video, outro)
        responseUtil(res, true, 'Message', false, { id, finalout })
    } catch (err) {
        responseUtil(res, false, err, true, {})
    }
}

const concatVideos = async (req, res) => {
    const videos = req.body.videos;
    const introVideo = videos["intro"];
    const userVideo = videos["uservideo"];
    const outroVideo = videos["outro"];
    const id = req.body.postId;
    const videoPath = path.join(os.tmpdir(), 'videorepo', id);
    if (!fs.existsSync(videoPath)) {
        fs.mkdir(videoPath, (err) => {
            if (err) responseUtil(res, false, err, true, {})
        })
    }
    try {
        const introVideoFile = await s3Download.downloadVideo(introVideo, videoPath, "intro");
        const userVideoFile = await s3Download.downloadVideo(userVideo, videoPath, "uservideo");
        const outroVideoFile = await s3Download.downloadVideo(outroVideo, videoPath, "outro");
        console.log('download complete')
        let finalout = await Editor.mergeVideos(id, introVideoFile, userVideoFile, outroVideoFile)
        responseUtil(res, true, "merge successfully", false, { finalout })

    } catch (err) {
        console.log('error aaya', err)
        responseUtil(res, false, err.message, true, {})
    }

}

module.exports = {
    validateCreateVideoID,
    getVideoThumbnails,
    getFinalVideo,
    mergeVideos,
    concatVideos
}