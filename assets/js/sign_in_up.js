const toggleSignInPage = document.querySelector("#toggle-sign-in-page");
const toggleSignUpPage = document.querySelector("#toggle-sign-up-page");
const signInContainer = document.querySelector("#sign-in-container");
const signUpContainer = document.querySelector("#sign-up-container");

toggleSignInPage.addEventListener("click", function (e) {
  // toggle the eye slash icon
  signInContainer.classList.add("animate__fadeOutLeft");

  setTimeout(() => {
    signInContainer.classList.toggle("remove");
    signUpContainer.classList.toggle("remove");
  }, 550);
  signUpContainer.classList.remove("animate__fadeOutRight");
  signUpContainer.classList.add("animate__fadeInRight");
});

toggleSignUpPage.addEventListener("click", function (e) {
  // toggle the eye slash icon
  signInContainer.classList.remove("animate__fadeOutLeft");
  signInContainer.classList.add("animate__fadeInLeft");
  signUpContainer.classList.add("animate__fadeOutRight");

  setTimeout(() => {
    signInContainer.classList.toggle("remove");
    signUpContainer.classList.toggle("remove");
  }, 550);
});
