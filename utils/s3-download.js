const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const downloadVideo = async (video, dest, type) => {
    const protocol = video.includes('https') ? https : http;
    return new Promise((resolve, reject) => {
        const filename = `${type}.mp4`;
        const outputPath = path.join(dest, filename);
        console.log('downloading video......', video)
        console.log('path output......', outputPath)
        const file = fs.createWriteStream(outputPath);
        protocol.get(video, function (response) {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${video}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            resolve({
                downloadPath: outputPath,
                name: filename
            })
        });
        file.on('error', function (err) {
            reject(new Error(err));
        });
    })

}

module.exports = { downloadVideo }