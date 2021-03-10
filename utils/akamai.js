
const EdgeAuth = require('akamai-edgeauth');
const request = require('request-promise-native');

const keys = require('../config')

process.env.AKAMAI_EDGEAUTH_HLS_HOSTNAME = keys.AKAMAI_EDGEAUTH_HLS_HOSTNAME;
process.env.AKAMAI_EDGEAUTH_HLS_ENCRYPTIONKEY = keys.AKAMAI_EDGEAUTH_HLS_ENCRYPTIONKEY;
process.env.AKAMAI_EDGEAUTH_MEDIA_HOSTNAME = keys.AKAMAI_EDGEAUTH_MEDIA_HOSTNAME;
process.env.AKAMAI_EDGEAUTH_MEDIA_ENCRYPTIONKEY = keys.AKAMAI_EDGEAUTH_MEDIA_ENCRYPTIONKEY;

const generateVideoHLSURL = (azureBlobname) => {
    const ea = new EdgeAuth({
        key: process.env.AKAMAI_EDGEAUTH_HLS_ENCRYPTIONKEY,
        windowSeconds: 24 * 60 * 60, // 24 hours
        escapeEarly: true,
    });
    //const akamaiToken = ea.generateURLToken(azureBlobname);
    const akamaiToken = ea.generateACLToken(['/*']);
    const akamaiPublicURL = `https://${process.env.AKAMAI_EDGEAUTH_HLS_HOSTNAME}/i/${azureBlobname}/master.m3u8?hdnts=${akamaiToken}`;

    return encodeURI(akamaiPublicURL);
};

const generateMediaAssetPublicURL = (container, blobname, expiry = 24) => {
    if (expiry === 0) {
        return `${process.env.AKAMAI_EDGEAUTH_MEDIA_HOSTNAME}/${container}/${blobname}`;
    }
    const ea = new EdgeAuth({
        key: process.env.AKAMAI_EDGEAUTH_MEDIA_ENCRYPTIONKEY,
        windowSeconds: expiry * 60 * 60, // expiry hours
        escapeEarly: true,
    });
    const akamaiToken = ea.generateACLToken(['/*']);
    const url = `${process.env.AKAMAI_EDGEAUTH_MEDIA_HOSTNAME}/${container}/${blobname}?hdnts=${akamaiToken}`;
    return url;
};

const purgeByTag = async (tags) => {
    try {
        const options = {
        method: 'POST',
        url: config.fastpurge,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            hostname: 'pubstack.nw18.com',
            tags,
        },
        };
        const response = await request(options);
        console.log(`Tag-Cache-Purge response: ${response}`);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    generateVideoHLSURL,
    generateMediaAssetPublicURL,
    purgeByTag,
};
