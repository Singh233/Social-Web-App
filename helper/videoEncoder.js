/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { getIo, getActiveUsers } = require("../config/chat_sockets");

const ffmpegPath = "/opt/homebrew/bin/ffmpeg"; // Provide the actual path to your FFmpeg executable
const {
  uploadVideo,
  deleteFile,
  uploadVideoSegments,
} = require("./googleCloudStore");

ffmpeg.setFfmpegPath(ffmpegPath);

async function transcodeVideoToQuality(
  bucketName,
  fileName,
  quality,
  videoUrl,
  userId
) {
  return new Promise((resolve, reject) => {
    const outputFileName = `transcoded_${fileName}`;
    const outputDirectory = `/Users/sanambirsingh/Documents/development/codeial/uploads/${outputFileName}/${quality.name}`;
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, {
        recursive: true,
      });
    }
    // Define the paths for manifest and segments
    const manifestPath = path.join(outputDirectory, `${quality.name}.m3u8`);
    const segmentPath = path.join(outputDirectory, `${quality.name}-%03d.ts`);

    const command = ffmpeg()
      .input(videoUrl)
      .videoCodec("libx264") // Video codec (you can use other codecs if needed)
      .audioCodec("aac") // Audio codec (you can use other codecs if needed)
      .videoBitrate(quality.bitrate)
      .addOption("-hls_time", "4")
      .addOption("-hls_list_size", "0") // Allows for unlimited playlist entries
      .outputOptions(["-hls_segment_type fmp4"]) // Use fragmented MP4 segments
      .output(manifestPath)
      .on("progress", function (progress) {
        if (progress && quality.name === "high") {
          const newProgress = Math.round(progress.percent);
          if (newProgress % 10 === 0) {
            const io = getIo();
            const activeUsers = getActiveUsers();
            if (activeUsers.has(userId)) {
              io.to(activeUsers.get(userId).socketId).emit("video-progress", {
                progress: newProgress,
                status: "Processing",
              });
            }
          }
        }
      })
      .on("end", async () => {
        try {
          const files = fs.readdirSync(outputDirectory);
          // Wait for all uploads to complete
          // await Promise.all(
          //   files.map(async (file) => {
          //     const data = fs.readFileSync(path.join(outputDirectory, file));
          //     await uploadVideoSegments(
          //       "users_videos_bucket",
          //       data, // Use the Buffer
          //       `${outputFileName}/${quality.name}/${file}`
          //     );
          //   })
          // );
          console.log("Successfully encoded");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));

    command.run();
  });
}

module.exports = transcodeVideoToQuality;
