const AWS = require('aws-sdk');
const https = require('https');
const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4',
    region: process.env.S3_PERSISTENCE_REGION
});


//////////////////////////////////////////Main methods///////////////////////////////////////////////////////////////////
 //gets file from aws storage s3
 // @Param: filename for read file, it is appended to media so the actual path is Media/flieName for simplicity
 //NOTES: could probably be simplified if outside method is async
async function getJSON(fileName) {
    try {
        let http_promise = getPromise(fileName);
        let response_body = await http_promise;

        // holds response from server that is passed when Promise is resolved
        //console.log("returned", response_body);

        return JSON.parse(response_body);  //returns a json variable we can parse through
    }
    catch (error) {
        // Promise rejected
        console.log(error);
    }
}

//writes a string to aws storage s3
//@param: Name of file and string of data to be uploaded
function upload(fileName, uploadee) {  //make sure you JSON.stringify() uploadee if is a json file 
   // console.log("started test  ", uploadee);
    // call S3 to retrieve upload file to specified bucket
    var uploadParams = { Bucket: process.env.S3_PERSISTENCE_BUCKET, Key: `Media/${fileName}`, Body: uploadee };

    // call S3 to retrieve upload file to specified bucket
    s3SigV4Client.upload(uploadParams, function (err, data) {
        if (err) {
            console.log("Error on the tihng", err);
        } if (data) {
            console.log("Upload Success", data.Location);
        }
    });
}

//writes json data to aws storage s3
//@param, filename and json data to be submitted
function uploadJSON(fileName, uploadee) {  
   // console.log("started test  ", uploadee);
    // call S3 to retrieve upload file to specified bucket
    var uploadParams = { Bucket: process.env.S3_PERSISTENCE_BUCKET, Key: `Media/${fileName}`, Body: JSON.stringify(uploadee) };

    // call S3 to retrieve upload file to specified bucket
    s3SigV4Client.upload(uploadParams, function (err, data) {
        if (err) {
            console.log("Error on the tihng", err);
        } if (data) {
            console.log("Upload Success", data.Location);
        }
    });
}

//--------------------------------------Helper Methods--------------------------------------------------------------------


function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60 * 5 // the Expires is capped for 5 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

function getPromise(fileName) {
    var link = getS3PreSignedUrl(`Media/${fileName}`);
    return new Promise((resolve, reject) => {
        https.get(link, (response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
}



module.exports = { getS3PreSignedUrl, getJSON, upload, uploadJSON }