const path = require('path');
const multer = require('multer');
const fs = require('fs');
const os = require('os');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let id = req.body.id;
        const videoDir = path.join(os.tmpdir(),'videorepo',id);
        req.body.videoPath = videoDir;
        if (!fs.existsSync(videoDir)){
            cb(`Invalid Processing ID`, ``);
        }else{
            cb(null, videoDir);
        }  
    },
    filename: (req, file, cb) => {
        // console.log(file)
        let fileName = Date.now() + '-' + file.originalname;
        req.body.fileName = fileName;
        cb(null, fileName);
    }
});

const videoFormats = [
    'video/gif',
    'video/mp4',
    'video/wmv',
    'video/avi'
]

const fileFilter = (req, file, cb) => {
    if (videoFormats.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;