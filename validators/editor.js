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
        responseUtil(res, true, err, false, {})
    }
}

module.exports = {
    validateCreateVideoID,
    getVideoThumbnails
}