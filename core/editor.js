const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpegUtil = require('../utils/ffmpeg');
const azureUtils = require('../utils/azure');
const Ffmpeg = require('fluent-ffmpeg');
const e = require('express');

const getId = () => {
    let uuid = uuidv4();
    const dir = path.join(os.tmpdir(),'videorepo', uuid);
    fs.mkdir(dir, (err) => {
        if(err) throw err
    })
    return uuid;
}

const fetchVideoThumbnails = async (processId, videopath, filename) => {
    let videofile = path.join(videopath, filename)
    // Get File Metadata
    let meta = await ffmpegUtil.getFileMetadata(videofile);
    if(meta==null) throw new Error(`Failed to fetch video metadata`);
    let videoDuration = Math.floor(meta.format.duration);
    let noOfThumnails = 10;
    let thumbnailsPerSecond = Math.floor(videoDuration / noOfThumnails);
    let thumbDurationArr = [];
    for(let i=1; i<videoDuration; i+=thumbnailsPerSecond){
        thumbDurationArr.push(i)
    }
    thumbDurationArr.length = 10;
    console.log(thumbDurationArr)
    // Get Thumbnails of specified seconds
    let thumbnails = await ffmpegUtil.getThumbnail(videopath, videofile, thumbDurationArr, filename.split('.').slice(0,-1).join('.'))
    if(!Array.isArray(thumbnails)) throw new Error(thumbnails)
    let response = {
      videoName: filename,
      videoUrl: '',
      thumbUrl: []
    }
    // Upload Video and Thumbnails to Azure
    let {container, blobname} = await uploadToAzureCloud('video', processId, filename, videopath)
    let videoPublicUrl = await azureUtils.generatePublicURLWithToken(container, blobname)
    response.videoUrl = videoPublicUrl;
    let thumb = []
    for(let i=0; i<thumbnails.length; i++){
      let {container, blobname} = await uploadToAzureCloud('image', processId, thumbnails[i], videopath)
      let thumbPublicUrl = await azureUtils.generatePublicURLWithToken(container, blobname)
      thumb.push(thumbPublicUrl);
    } 
    response.thumbUrl = thumb;
    return response;
}

const processVideos = async (id, videopath, videos) => {
    let trimVideoPromises = []
    // Validate Video/Start/End Params
    for(let video of videos){
      let file = path.join(videopath, video.name);
      if(!fs.existsSync(file)) throw new Error(`${video.name} file not found to process`)
      for(let ops of video.operations){
        if(ops.name == "TRIM_VIDEO"){
          if(isNaN(ops.start) || isNaN(ops.duration)) throw new Error(`${video.name} trim parameters are invalid`)
          trimVideoPromises.push(ffmpegUtil.trimVideo(videopath, file, ops.start, ops.duration))
        }
      }
    }
    // Trim
    let trimRes = await Promise.all(trimVideoPromises).catch(err => {
      console.log(err)
      throw new Error(`Failed to Trim Video`)
    })
    // Merge
    let finalout = await ffmpegUtil.mergeVideos(trimRes, videopath).catch(err => {
      console.log(err)
      throw new Error(`Failed to Merge Video`)
    });
    // Upload
    let {container, blobname} = await uploadToAzureCloud('video', id, finalout, videopath)
    let videoPublicUrl = await azureUtils.generatePublicURLWithToken(container, blobname)
    return {
      video: finalout,
      videourl: videoPublicUrl
    };
}

const uploadToAzureCloud = (type, processId, filename, filepath) => {
  return new Promise((resolve, reject) => {
    console.log(`Uploading video file to Azure Blob Storage! Video ID: ${processId}`);
    let contentType = 'image/png';
    if(type == 'video') contentType = 'video/mp4'
    const blobOptions = {
      contentSettings: {
        contentType: contentType,
      },
    };
    const container = "hyperlocaltest";
    const blobname = `${processId}/${filename}`;
    azureUtils.uploadFileStreamToBlob(container, blobname, `${filepath}\\${filename}`, blobOptions, (error) => {
      if (error) {
        console.log(error);
        const downloadFailedError = new Error();
        downloadFailedError.name = 'UPLOAD_TO_AZURE_FAILED';
        reject(downloadFailedError);
      }
      resolve({container, blobname});
    });
  })
}

module.exports = {
    getId,
    fetchVideoThumbnails,
    processVideos
}