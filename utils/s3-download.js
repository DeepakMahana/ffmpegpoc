const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const downloadVideo = async (video, dest, type) => {
    return new Promise((resolve, reject) => {
        try {
            const protocol = video.includes('https') ? https : http;
            const filename = `${type}.mp4`;
            const outputPath = path.join(dest, filename);
            console.log('path output......', outputPath)
            const file = fs.createWriteStream(outputPath);
            protocol.get(video, function (response) {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to get '${video}' (${response.statusCode})`));
                    return;
                }
                response.pipe(file);
            });
            file.on('finish', function(err) {
                console.log(err)
                resolve({
                    destination: dest,
                    filename: filename
                })
            })
            file.on('error', function (err) {
                reject(new Error(err));
            });
        } catch (err) {
            reject(new Error(err))
        }
    })

}

module.exports = { downloadVideo }