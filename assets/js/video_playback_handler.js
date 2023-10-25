/* eslint-disable import/prefer-default-export */
const refreshVideoPlayback = () => {
  let flag = false;
  // Initialize Video.js for each video
  const videos = document.getElementsByClassName("video-js");
  const videoInstances = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const videoInstance = videojs(video.id, {
      playsinline: true,
    });

    // Add the Video.js instance to the array
    videoInstances.push(videoInstance);

    // Pause the video when it's clicked
    videoInstance.on("play", function () {
      flag = true;
      // Pause all other videos
      videoInstances.forEach(function (instance) {
        if (instance !== videoInstance) {
          instance.pause();
        }
      });
    });
  }

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5, // Adjust this threshold as needed
  };

  const intersectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Video is in view, play it
        const videoInstance = videojs(entry.target.id, {
          playsinline: true,
        });
        if (flag) {
          videoInstance.play();
        }
      } else {
        // Video is out of view, pause it
        const videoInstance = videojs(entry.target.id, {
          playsinline: true,
        });
        if (flag) videoInstance.pause();
      }
    });
  }, options);

  for (let i = 0; i < videos.length; i++) {
    intersectionObserver.observe(videos[i]);
  }
};
