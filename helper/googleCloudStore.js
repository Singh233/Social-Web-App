/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-promise-reject-errors */
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const sharp = require("sharp");
const Post = require("../models/post");
const googleCloudStorage = require("../config/googleCloudStorage");

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const generateUniquePrefix = () => {
  const timestamp = Date.now();
  const randomSuffix = uuidv4().split("-")[0]; // Extract a portion of the UUID
  const uniquePrefix = `${timestamp}-${randomSuffix}`;
  return uniquePrefix;
};
// function compressImage(fileData, quality) {
//   return sharp(fileData).jpeg({ quality }).toBuffer();
// }

const getFileNameFromFilePath = (filePath) => {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
};

const getFileNameFromUrl = (fileUrl) => {
  const parsedUrl = new URL(fileUrl);
  const path = parsedUrl.pathname;
  const fileName = path.substring(path.lastIndexOf("/") + 1);
  return fileName;
};

const uploadImage = (bucketName, file) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;
    const bucket = googleCloudStorage.bucket(bucketName);

    const uniquePrefix = generateUniquePrefix(); // Generate unique prefix
    const fileName = `${uniquePrefix}-${originalname.replace(/ /g, "_")}`; // Append prefix to file name

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      })
      .on("error", () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

const uploadVideo = (bucketName, file, fileName) =>
  new Promise((resolve, reject) => {
    const { buffer } = file;
    const bucket = googleCloudStorage.bucket(bucketName);

    // Specify the content type
    // const options = {
    //   metadata: {
    //     contentType: "application/vnd.apple.mpegurl", // Set content type for M3U8 file
    //   },
    // };

    // // Upload the file with specified content type
    // bucket.upload("localFilePath", {
    //   destination: fileName,
    //   metadata: options.metadata,
    // });

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    // Create a new Buffer from the provided Buffer
    const newBuffer = Buffer.from(buffer);
    blobStream
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      })
      .on("error", (error) => {
        console.log(error);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

// async function uploadVideo(bucketName, data, destination) {
//   try {
//     const bucket = googleCloudStorage.bucket(bucketName);
//     const file = bucket.file(destination);

//     await file.save(data);

//     console.log(`File uploaded to Google Cloud Storage: ${destination}`);
//   } catch (error) {
//     console.error(`Error uploading file: ${error}`);
//     throw error;
//   }
// }

const uploadVideo2 = async (bucketName, fileBuffer, destinationFileName) => {
  try {
    const bucket = googleCloudStorage.bucket(bucketName);
    const file = bucket.file(destinationFileName);

    // Specify the content type
    // const options = {
    //   metadata: {
    //     contentType: "application/vnd.apple.mpegurl", // Set content type for M3U8 file
    //   },
    // };

    // Upload the file to GCS
    await file.save(fileBuffer);

    // Construct the public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationFileName}`;

    return publicUrl;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteFile = async (bucketName, fileUrl, isThumbnail) => {
  try {
    // Reference the bucket
    const bucket = googleCloudStorage.bucket(bucketName);
    let fileName = getFileNameFromUrl(fileUrl);
    if (isThumbnail) {
      fileName = `thumbnails/${getFileNameFromUrl(fileUrl)}`;
    }
    // Reference the file
    const file = bucket.file(fileName);

    // Delete the file
    await file.delete();

    return;
  } catch (err) {
    console.error("Error deleting file:", err);
    return err;
  }
};

const uploadThumbnail = (bucketName, fileData, fileName) =>
  new Promise((resolve, reject) => {
    const bucket = googleCloudStorage.bucket(bucketName);

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      })
      .on("error", () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(fileData);
  });

const generateThumbnail = async (bucketName, file, fileName) => {
  try {
    const thumbnailBuffer = await sharp(file.buffer).resize(20, 20).toBuffer();

    const thumbnailFileName = `thumbnails/thumbnail-${getFileNameFromFilePath(
      fileName
    )}`;
    const publicUrl = await uploadThumbnail(
      bucketName,
      thumbnailBuffer,
      thumbnailFileName
    );
    return publicUrl;
  } catch (error) {
    return error;
  }
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadVideo2,
  uploadThumbnail,
  getFileNameFromFilePath,
  generateUniquePrefix,
  generateThumbnail,
  getFileNameFromUrl,
  deleteFile,
};
