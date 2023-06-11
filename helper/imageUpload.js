/* eslint-disable no-shadow */
/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-promise-reject-errors */
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const sharp = require("sharp");
const Post = require("../models/post");
const googleCloudStorage = require("../config/googleCloudStorage");

const bucket = googleCloudStorage.bucket("users_posts_bucket"); // bucket name

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

const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

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
  } catch (err) {
    // console.error("Error deleting file:", err);
    return err;
  }
};

const uploadThumbnail = (fileData, fileName) =>
  new Promise((resolve, reject) => {
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

const generateThumbnail = async (file, fileName) => {
  try {
    const thumbnailBuffer = await sharp(file.buffer).resize(20, 20).toBuffer();

    const thumbnailFileName = `thumbnails/thumbnail-${getFileNameFromFilePath(
      fileName
    )}`;
    const publicUrl = await uploadThumbnail(thumbnailBuffer, thumbnailFileName);
    return publicUrl;
  } catch (error) {
    return error;
  }
};

module.exports = {
  uploadImage,
  uploadThumbnail,
  getFileNameFromFilePath,
  generateUniquePrefix,
  generateThumbnail,
  getFileNameFromUrl,
  deleteFile,
};
