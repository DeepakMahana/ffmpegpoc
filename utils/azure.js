const storage = require('azure-storage');
const path = require('path');
const fs = require('fs');
const keys = require('../config')

process.env.AZURE_STORAGE_ACCOUNT = keys.AZURE_STORAGE_ACCOUNT;
process.env.AZURE_STORAGE_ACCESS_KEY = keys.AZURE_STORAGE_ACCESS_KEY;

const blobService = storage.createBlobService();

const getFileBlob = params => new Promise((resolve, reject) => {
  blobService.getBlobProperties(params.container, params.blobname, (error1, result) => {
    if (error1) {
      return reject(error1);
    }
    const filename = params.localFileName ? `${params.localFileName}${path.extname(result.name)}` : path.basename(result.name);
    const fpath = path.join(params.localdir, filename);
    const speedSummary = blobService.getBlobToLocalFile(params.container, params.blobname, fpath, (error2) => { // eslint-disable-line
      if (error2) {
        return reject(error2);
      }
      return resolve(fpath);
    });
    speedSummary.on('progress', () => {
      console.log(`[Download] Blob: ${params.blobname}, Progress: ${speedSummary.getCompletePercent()}%`);
    });
    return null;
  });
});

const getTextBlob = (container, blobname) => new Promise((resolve, reject) => {
  blobService.getBlobToText(container, blobname, (error, text) => {
    if (error) {
      return reject(error);
    }
    return resolve(text);
  });
});

const getStreamBlob = (container, blobname) => new Promise((resolve, reject) => {
  blobService.getBlobProperties(container, blobname, (error, result) => {
    if (error) {
      return reject(error);
    }
    const readStream = blobService.createReadStream(container, blobname);
    return resolve({ content_length: result.contentLength, read_stream: readStream });
  });
});

const getBlob = async (container, blobname, options) => {
  switch (options.mode) {
    case 'local': {
      const localpath = await getFileBlob({
        container,
        blobname,
        localdir: options.localdir,
        localFileName: options.localFileName,
      });
      console.log(`Blob ${blobname} downloaded at ${localpath} successfully!`);
      return localpath;
    }
    case 'text': {
      const text = await getTextBlob(container, blobname);
      return text;
    }
    case 'stream': {
      const streamDetails = await getStreamBlob(container, blobname);
      return streamDetails;
    }
    default:
      throw new Error('Invalid file download mode!');
  }
};

const uploadFileBlob = (container, blobname, filepath, options, callback) => {
  const speedSummary = blobService.createBlockBlobFromLocalFile(container, blobname, filepath, options, (error) => { // eslint-disable-line
    if (error) {
      return callback(error);
    }
    const dataToSend = {
      blobname,
      container,
    };
    return callback(null, dataToSend);
  });
  speedSummary.on('progress', () => {
    console.log(`[Upload] Blob: ${blobname}, Progress: ${speedSummary.getCompletePercent()}%`);
  });
};

const uploadFileStreamToBlob = (container, blobname, filepath, options, callback) => {
  const fileStats = fs.statSync(filepath);
  const fileReadStream = fs.createReadStream(filepath);

  const speedSummary = blobService.createBlockBlobFromStream(container, blobname, fileReadStream, fileStats.size, options, (error, result) => { // eslint-disable-line
    if (error) {
      return callback(error);
    }
    const dataToSend = {
      blobname,
      container,
    };
    return callback(null, dataToSend);
  });

  speedSummary.on('progress', () => {
    console.log(`[Upload] Blob: ${blobname}, Progress: ${speedSummary.getCompletePercent()}%`);
  });
};

const generatePublicURL = (container, blobname) => {
  const publicURL = blobService.getUrl(
    container,
    blobname,
    null,
    `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  );
  return publicURL;
};

const generatePublicURLWithToken = (container, blobname, start, expiry) => {
  let startDate = null;
  let expiryDate = null;

  if (start && expiry) {
    startDate = new Date(start);
    expiryDate = new Date(expiry);
  } else {
    startDate = new Date();
    expiryDate = new Date(startDate);

    startDate.setHours(startDate.getHours() - 1);
    expiryDate.setHours(expiryDate.getHours() + 1);
  }

  const sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
      Start: startDate,
      Expiry: expiryDate,
    },
  };

  const sasToken = blobService.generateSharedAccessSignature(
    container,
    blobname,
    sharedAccessPolicy,
  );

  const publicUrl = blobService.getUrl(
    container,
    blobname,
    sasToken,
    `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  );

  return publicUrl;
};

const generateUploadToken = (container, blobname) => {
  const startDate = new Date();
  const expiryDate = new Date(startDate);

  startDate.setHours(startDate.getHours() - 1);
  expiryDate.setHours(expiryDate.getHours() + 1);

  const sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: storage.BlobUtilities.SharedAccessPermissions.WRITE,
      Start: startDate,
      Expiry: expiryDate,
    },
  };

  const sasToken = blobService.generateSharedAccessSignature(
    container,
    blobname,
    sharedAccessPolicy,
  );

  return sasToken;
};

const updateBlobProperties = (container, blobname, options, callback) => {
  blobService.setBlobProperties(container, blobname, options, (error) => {
    if (error) {
      return callback(error);
    }
    return callback();
  });
};

const deleteBlob = (container, blobname, callback) => {
  blobService.deleteBlobIfExists(container, blobname, (error) => {
    if (error) {
      return callback(error);
    }
    return callback();
  });
};

module.exports = {
  getBlob,
  uploadFileBlob,
  uploadFileStreamToBlob,
  generatePublicURL,
  generatePublicURLWithToken,
  generateUploadToken,
  updateBlobProperties,
  deleteBlob,
};
