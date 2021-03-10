const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpegUtil = require('../utils/ffmpeg');
const azureUtils = require('../utils/azure');
const akamaiUtils = require('../utils/akamai');

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

const mergeVideos = async(id, intro, video, outro) => {
  console.log('merging videos');
  let destination = intro.destination;
  let filenames = [intro.filename, video.filename, outro.filename]
  // console.log('filedata', fs.statSync(path.join(intro.destination, intro.filename)));
  // Merge
  let finalout = await ffmpegUtil.mergeVideos(filenames, destination).catch(err => {
    console.log(err)
    throw new Error(`Failed to Merge Video`)
  });
  // Upload to Azure
  let {container, blobname} = await uploadToAzureCloud('video', id, finalout, destination)
  let videoPublicUrl = await azureUtils.generatePublicURLWithToken(container, blobname)
  // Get Akamai HLS and PD
  const hlsSource = akamaiUtils.generateVideoHLSURL(blobname);
  const pdSource = akamaiUtils.generateMediaAssetPublicURL(container, blobname, 24);
  // Clear all media temp files
  removeDir(destination)
  return {
    video: finalout,
    videourl: videoPublicUrl,
    hlsSource,
    pdSource
  };
}

const removeDir = (path) => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    console.log("Directory path not found.")
  }
}

module.exports = {
    getId,
    fetchVideoThumbnails,
    processVideos,
    mergeVideos
}


// https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4

// https://endtest-videos.s3-us-west-2.amazonaws.com/documentation/endtest_data_driven_testing_csv.mp4