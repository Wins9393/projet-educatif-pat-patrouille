import { options } from "../particles/particles-options.js";

const body = document.querySelector(".body-100");
const nombreAleatoire = document.querySelector(".nombre-aleatoire-calculer");
const imgOsPaquet = document.querySelectorAll(".img-os-paquet");
const divTotalOsPose = document.querySelector(".total-os-pose");
const btnJouerCalculer = document.querySelector(".btn-calculer");
const audio = document.querySelector(".audio1");

const imgOs1 = document.querySelector(".img-os-1");
const imgOs2 = document.querySelector(".img-os-2");
const imgOs3 = document.querySelector(".img-os-3");
const imgOs4 = document.querySelector(".img-os-4");
const imgOs5 = document.querySelector(".img-os-5");

let os1InitialPosition = { left: 0, top: 0 };
let os2InitialPosition = { left: 0, top: 0 };
let os3InitialPosition = { left: 0, top: 0 };
let os4InitialPosition = { left: 0, top: 0 };
let os5InitialPosition = { left: 0, top: 0 };

let mousePosition;
let offset = [0, 0];
let isDown = false;
let receptacleCourant = null;
let totalOsPose = 0;
let totalOsPoseTab = [];
let randomInt;
let toggleFullscreen = false;

const afficheBtnPleinEcran = () => {
  if (body.clientWidth < 700 && navigator.userAgent.includes("Chrome")) {
    const btnFullscreen = document.createElement("button");
    const btnJouerContainer = document.querySelector(".btn-jouer-container");
    btnFullscreen.classList.add("btn", "btn-jouer", "vert");
    btnFullscreen.innerHTML = "PLEIN ÉCRAN";
    btnFullscreen.addEventListener("click", () => {
      if (document.body.requestFullscreen && body.clientWidth < 700) {
        if (!toggleFullscreen) {
          document.body.requestFullscreen();
          toggleFullscreen = true;
        } else {
          document.exitFullscreen();
          toggleFullscreen = false;
        }
      }
    });
    btnJouerContainer.append(btnFullscreen);
  }
};

const getImgOsPosition = () => {
  os1InitialPosition = { left: imgOs1.x, top: imgOs1.y };
  os2InitialPosition = { left: imgOs2.x, top: imgOs2.y };
  os3InitialPosition = { left: imgOs3.x, top: imgOs3.y };
  os4InitialPosition = { left: imgOs4.x, top: imgOs4.y };
  os5InitialPosition = { left: imgOs5.x, top: imgOs5.y };
};

const resetOsPosition = () => {
  if (body.clientWidth < 700 && navigator.userAgent.includes("Chrome")) {
    imgOs1.style.left = 8 + "px";
    imgOs1.style.top = body.clientHeight - 280 + "px";
    imgOs2.style.left = body.clientWidth / 2 - 58 + "px";
    imgOs2.style.top = body.clientHeight - 280 + "px";
    imgOs3.style.left = body.clientWidth - 105 + "px";
    imgOs3.style.top = body.clientHeight - 280 + "px";
    imgOs4.style.left = 8 + "px";
    imgOs4.style.top = body.clientHeight - 185 + "px";
    imgOs5.style.left = body.clientWidth - 165 + "px";
    imgOs5.style.top = body.clientHeight - 185 + "px";
  } else if (body.clientWidth > 700 && navigator.userAgent.includes("Chrome")) {
    imgOs1.style.left = 86 + "px";
    imgOs1.style.top = body.clientHeight - 310 + "px";
    imgOs2.style.left = body.clientWidth / 4 - 150 + "px";
    imgOs2.style.top = body.clientHeight - 310 + "px";
    imgOs3.style.left = body.clientWidth / 2.5 - 130 + "px";
    imgOs3.style.top = body.clientHeight - 310 + "px";
    imgOs4.style.left = body.clientWidth / 1.5 - 280 + "px";
    imgOs4.style.top = body.clientHeight - 310 + "px";
    imgOs5.style.left = body.clientWidth - 550 + "px";
    imgOs5.style.top = body.clientHeight - 310 + "px";
  } else {
    imgOs1.style.left = os1InitialPosition.left + "px";
    imgOs1.style.top = os1InitialPosition.top + "px";
    imgOs2.style.left = os2InitialPosition.left + "px";
    imgOs2.style.top = os2InitialPosition.top + "px";
    imgOs3.style.left = os3InitialPosition.left + "px";
    imgOs3.style.top = os3InitialPosition.top + "px";
    imgOs4.style.left = os4InitialPosition.left + "px";
    imgOs4.style.top = os4InitialPosition.top + "px";
    imgOs5.style.left = os5InitialPosition.left + "px";
    imgOs5.style.top = os5InitialPosition.top + "px";
  }
};

const afficheNombreAleatoire = () => {
  randomInt = Math.floor(Math.random() * 9) + 1;
  nombreAleatoire.src = `../assets/alphabet/${randomInt}.png`;
};

const calculTotalOsPose = (tab) => {
  return (totalOsPose = tab.reduce(
    (previous, current) => previous + current,
    0
  ));
};

const afficheTotalOsPose = (totalOs) => {
  const imgTotalOsPose = document.createElement("img");
  imgTotalOsPose.classList.add("img-total-os-pose");
  imgTotalOsPose.src = `../assets/alphabet/${totalOs}.png`;
  divTotalOsPose.innerHTML = "";
  divTotalOsPose.append(imgTotalOsPose);
};

const mouseUpTouchEndHandler = (e) => {
  isDown = false;

  imgOsPaquet.forEach((imgOs) => {
    imgOs.style.pointerEvents = null;
  });

  if (receptacleCourant) {
    if (!totalOsPoseTab.includes(parseInt(e.target.dataset.os))) {
      if (e.target.dataset.os) {
        totalOsPoseTab.push(parseInt(e.target.dataset.os));

        calculTotalOsPose(totalOsPoseTab);

        if (totalOsPose <= 9) afficheTotalOsPose(totalOsPose);

        if (totalOsPose === randomInt) {
          audio.src = "../assets/reactions/cris-de-joie.mp3";
          tsParticles.load("tsparticles", options);
          receptacleCourant.style.boxShadow = "0px 0px 18px 12px #0be881";
        } else {
          receptacleCourant.style.boxShadow = "0px 0px 18px 12px crimson";
        }
      }
    }
  }
};

imgOsPaquet.forEach((imgOs) => {
  imgOs.addEventListener("mousedown", (e) => {
    if (e.target === imgOs) {
      isDown = true;
      offset = [imgOs.offsetLeft - e.clientX, imgOs.offsetTop - e.clientY];
    }
  });
});

// version tactile
imgOsPaquet.forEach((imgOs) => {
  imgOs.addEventListener("touchstart", (e) => {
    if (e.target === imgOs) {
      isDown = true;
      offset = [
        imgOs.offsetLeft - e.touches[0].clientX,
        imgOs.offsetTop - e.touches[0].clientY,
      ];
    }
  });
});

document.addEventListener("mouseup", (e) => {
  mouseUpTouchEndHandler(e);
});

// version tactile
document.addEventListener("touchend", (e) => {
  mouseUpTouchEndHandler(e);
});

document.addEventListener("mousemove", (e) => {
  e.preventDefault();
  if (isDown) {
    mousePosition = {
      x: e.clientX,
      y: e.clientY,
    };

    imgOsPaquet.forEach((imgOs) => {
      if (imgOs === e.target) {
        window.scrollTo(0, 0);

        imgOs.style.left = mousePosition.x + offset[0] + "px";
        imgOs.style.top = mousePosition.y + offset[1] + "px";

        imgOs.hidden = true;
        let sousElem = document.elementFromPoint(e.clientX, e.clientY);
        imgOs.hidden = false;

        if (!sousElem) return;

        let receptacle = sousElem.closest(".receptacle-wrapper");

        // l'element sort de la zone dropable
        if (receptacleCourant != receptacle) {
          if (receptacleCourant) {
            receptacleCourant.style.boxShadow = "0px 0px 18px 12px crimson";

            totalOsPoseTab.forEach((elem, index) => {
              if (elem === parseInt(imgOs.dataset.os)) {
                totalOsPoseTab.splice(index, 1);
              }
            });

            totalOsPose = totalOsPoseTab.reduce(
              (previous, current) => previous + current,
              0
            );

            afficheTotalOsPose(totalOsPose);
          }
          receptacleCourant = receptacle;

          // l'element entre dans la zone dropable
          if (receptacleCourant) {
            receptacle.style.boxShadow = "0px 0px 18px 12px #0be881";
          }
        }
      } else {
        imgOs.style.pointerEvents = "none";
      }
    });
  }
});

//version tactile
document.addEventListener("touchmove", (e) => {
  if (isDown) {
    mousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    imgOsPaquet.forEach((imgOs) => {
      if (imgOs === e.target) {
        // window.scrollTo(0, 0);
        let imgOsLeft = imgOs.style.left.split("p")[0];
        let imgOsTop = imgOs.style.top.split("p")[0];

        if (imgOsLeft <= body.clientWidth - 70 && imgOsLeft >= 0) {
          imgOs.style.left = mousePosition.x + offset[0] + "px";
        } else {
          if (imgOsLeft <= 0) {
            imgOs.style.left = 5 + "px";
          } else if (imgOsLeft >= body.clientWidth - 70) {
            imgOs.style.left = body.clientWidth - 75 + "px";
          }
        }

        if (imgOsTop <= body.clientHeight - 70 && imgOsTop >= 0) {
          imgOs.style.top = mousePosition.y + offset[1] + "px";
        } else {
          if (imgOsTop <= 0) {
            imgOs.style.top = 5 + "px";
          } else if (imgOsTop >= body.clientHeight - 70) {
            imgOs.style.top = body.clientHeight - 75 + "px";
          }
        }
        // imgOs.style.left = mousePosition.x + offset[0] + "px";
        // imgOs.style.top = mousePosition.y + offset[1] + "px";

        imgOs.hidden = true;
        let sousElem = document.elementFromPoint(
          e.touches[0].clientX,
          e.touches[0].clientY
        );
        imgOs.hidden = false;

        if (!sousElem) return;

        let receptacle = sousElem.closest(".receptacle-wrapper");

        // l'element sort de la zone dropable
        if (receptacleCourant != receptacle) {
          if (receptacleCourant) {
            receptacleCourant.style.boxShadow = "0px 0px 18px 12px crimson";

            totalOsPoseTab.forEach((elem, index) => {
              if (elem === parseInt(imgOs.dataset.os)) {
                totalOsPoseTab.splice(index, 1);
              }
            });

            totalOsPose = totalOsPoseTab.reduce(
              (previous, current) => previous + current,
              0
            );

            afficheTotalOsPose(totalOsPose);
          }
          receptacleCourant = receptacle;

          // l'element entre dans la zone dropable
          if (receptacleCourant) {
            receptacle.style.boxShadow = "0px 0px 18px 12px #0be881";
          }
        }
      } else {
        imgOs.style.pointerEvents = "none";
      }
    });
  }
});

btnJouerCalculer.addEventListener("click", () => {
  afficheNombreAleatoire();
  resetOsPosition();
  totalOsPose = 0;
  totalOsPoseTab = [];
  afficheTotalOsPose(totalOsPose);
  if (receptacleCourant)
    receptacleCourant.style.boxShadow = "0px 0px 18px 12px crimson";
});

afficheBtnPleinEcran();
afficheTotalOsPose(totalOsPose);
afficheNombreAleatoire();
getImgOsPosition();
