const ffmpeg = require('fluent-ffmpeg');
const videoFile = './testvideo.mp4';
const logo = './news18logo.png';

// Get File Metadata
const getFileMetadata = (file) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file, (err, metadata) => {
            if(err) reject(null)
            resolve(metadata)
        })
    })
}

// Trim the video
const trimVideo = (file, starttime, duration) => {
    let outputFilename = `trim_video_${(new Date().valueOf())}.mp4`
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(file)
            .inputOptions([`-ss ${starttime}`])
            .outputOptions([`-t ${duration}`])
            .output(outputFilename)
            .on('progress', (progress) => {
                console.log(`Processing ${outputFilename}: ${parseInt(progress.percent)} % done`);
            })
            .on('end', () => {
                console.log(`Video Trimming Completed`)
                resolve(outputFilename)
            })
            .on('error', (err) => {
                console.log(`Error while Trimming: ${err}`)
                reject(`Failed to Trim the video`)
            })
            .run();
    })
}

// Merge Videos
const mergeVideos = (filesName) => {
    let merged_video = ffmpeg();
    let finalOutputFile = `final_out.mp4`
    return new Promise((resolve, reject) => {
        filesName.forEach((video) => {
            merged_video = merged_video.addInput(video);
        })
        merged_video
            .on('progress', (progress) => {
                console.log(`Processing ${finalOutputFile}: ${parseInt(progress.percent % 100)} % done`);
            })
            .on('end', () => {
                console.log(`Video Merged Completed`)
                resolve(finalOutputFile)
            })
            .on('error', (err) => {
                console.log(`Error while Merging: ${err}`)
                reject(`Failed to Merge the video`)
            })
            .mergeToFile(finalOutputFile);
    })
}

// Get Thumbnails from Video
const getThumbnail = (videopath, file, durationArr, filename) => {
    return new Promise((resolve, reject) => {
        let filenames = []
        ffmpeg(file)
            .on('filenames', (filename) => {
                filename.toString().split(',');
                filename.map((elem) => filenames.push(`${elem}`))
            })
            .on('end', () => {
                console.log(`Video Screenshots Completed`)
                resolve(filenames)
            })
            .on('error', (err) => {
                console.log(`Error while Merging: ${err}`)
                reject(`Failed to generate thumbanils`)
            })
            .screenshots({
                timestamps: durationArr,
                folder: videopath,
                size: '320x240',
                // %b input basename { filename w/o extension }
                // %s in seconds
                filename: `${filename}-thumb%s.png`
            });
    })
}

// Add watermark to video
const addWaterMark = async (videofile, watermarkfile) => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videofile)
            .input(watermarkfile)
            .videoCodec('libx264')
            .outputOptions('-pix_fmt yuv420p')
            .complexFilter([
                "[0:v]scale=512:-1[bg];[bg][1:v]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2"
            ])
            .on('progress', (progress) => {
                console.log(`Processing ${videofile}: ${parseInt(progress.percent)} % done`);
            })
            .on('end', () => {
                console.log(`Video Merged Completed`)
                resolve('out.mp4')
            })
            .on('error', (err) => {
                console.log(`Error while Merging: ${err}`)
                reject(`Failed to Merge the video`)
            })
            .output('out.mp4')
            .run();
        
    })
}

// Extract Audio from Video
const extractAudio = async (videofile) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoFile)
        .noVideo()
        .format('mp3')
        .outputOptions('-ab','320k')
        .on('progress', (progress) => {
            console.log(`Processing ${videofile}: ${parseInt(progress.percent)} % done`);
        })
        .on('end', () => {
            console.log(`Audio Seperation Completed`)
            resolve('test.mp3')
        })
        .on('error', (err) => {
            console.log(`Error while Audio Seperation: ${err}`)
            reject(`Failed to Seperate the audio`)
        })
        .output('test.mp3')
        .run();
    })
}

const EditVideos = async () => {
    try{
        // Get file Metadata
        let meta = await getFileMetadata(videoFile);
        // Get Trimming Times
        const {duration} = meta.format;
        const startTime_1 = parseInt(2);
        const clipDuration_1 = parseInt(5);
        const startTime_2 = parseInt(10);
        const clipDuration_2 = parseInt(5);
        // Trim Videos
        let video_file_1 = await trimVideo(videoFile, startTime_1, clipDuration_1);
        let video_file_2 = await trimVideo(videoFile, startTime_2, clipDuration_2); 
        // Merge Two Videos
        let mergedVideos = [video_file_1, video_file_2];
        let mergeFinalVideo = await mergeVideos(mergedVideos);
       // Get Video Thumbnail
       // let thumbnails = await getThumbnail(mergeFinalVideo);
        // Add watermark to video
        let watermark = await addWaterMark(mergeFinalVideo, logo);
        // Extract Audio from Video
        let audio = await extractAudio(videoFile);
        console.log("Video Editing Completed")
    }catch(err){
        console.log(err)
    }
}

module.exports = {
    getFileMetadata,
    getThumbnail
};
