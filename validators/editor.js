const path = require('path');
const os = require('os');
const fs = require('fs');
const Editor = require('../core/editor');
const responseUtil = require('../utils/response');

const validateCreateVideoID = async(req, res) => {
    try{
        let createVideoID = await Editor.getId();
        responseUtil(res, true, 'Video ID Created Successfully', false, createVideoID)
    }catch(err){
        responseUtil(res, false, 'Failed to create Video ID', true, {})
    }
}

const getVideoThumbnails = async(req, res) => {
    try{
        let videoPath = req.body.videoPath;
        let fileName = req.body.fileName;
        let processId = req.body.id;
        let thumbnails = await Editor.fetchVideoThumbnails(processId, videoPath, fileName)
        responseUtil(res, true, 'Thumbnails Created Successfully', false, thumbnails)
    }catch(err){
        responseUtil(res, false, err, true, {})
    }
}

const getFinalVideo = async(req, res) => {
    try{
        let id = req.body.id
        let videos = req.body.videos;
        let videoDir = path.join(os.tmpdir(),'videorepo',id);
        if (!fs.existsSync(videoDir)){
            responseUtil(res, false, "Process ID not found", true, {})
        }
        if(videos.length < 1){
            responseUtil(res, false, "Not found any Videos", true, {})
        }
        let finalVideo = await Editor.processVideos(id, videoDir, videos)
        console.log(finalVideo);
        responseUtil(res, true, 'Video Edited Successfully', false, finalVideo)
    }catch(err){
        responseUtil(res, false, err, true, {})
    }
}

module.exports = {
    validateCreateVideoID,
    getVideoThumbnails,
    getFinalVideo
}