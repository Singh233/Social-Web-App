const fsExtra = require("fs-extra");

const queue = require("../config/kue");
const transcodeVideoToQuality = require("../helper/videoEncoder");
const { deleteFile } = require("../helper/googleCloudStore");
const { getIo, getActiveUsers } = require("../config/chat_sockets");

const clearLocalFiles = (outputFileName) => {
  const directoryPath = `/Users/sanambirsingh/Documents/development/codeial/uploads/${outputFileName}`;
  // delete all the files
  fsExtra.remove(directoryPath).catch((err) => {
    console.error(`Error deleting directory: ${err}`);
  });
};

queue.process("videoEncoders", async (job, done) => {
  const io = getIo();
  console.log("Video encoding worker is processing a job", job.data);
  const { videoUrl, uniquePrefix, userId } = job.data;

  // Define quality levels for transcoding
  const qualities = [
    { name: "high", resolution: "1280x720", bitrate: "2500k" },
    { name: "medium", resolution: "640x360", bitrate: "1000k" },
    { name: "low", resolution: "426x240", bitrate: "500k" },
  ];

  const transcodedVideos = [];
  // Transcode the video into different qualities
  await Promise.all(
    qualities.map(async (quality) => {
      try {
        const outputUrl = await transcodeVideoToQuality(
          "users_videos_bucket",
          uniquePrefix,
          quality,
          videoUrl,
          userId
        );
        // Implement transcodeVideoToQuality function to transcode the video.
        transcodedVideos.push({ quality: quality.name, videoPath: outputUrl });
        return transcodedVideos;
      } catch (error) {
        console.log(error);
        return error;
      }
    })
  );
  await deleteFile("users_videos_bucket", videoUrl, false);

  const outputFileName = `transcoded_${uniquePrefix}`;
  clearLocalFiles(outputFileName);

  try {
    const activeUsers = getActiveUsers();
    // When the job is completed
    if (activeUsers.has(userId)) {
      io.to(activeUsers.get(userId).socketId).emit("video-encoding-complete", {
        jobId: job.id,
        status: "completed",
      });
    }
  } catch (error) {
    console.log(error);
  }
  done();
});
