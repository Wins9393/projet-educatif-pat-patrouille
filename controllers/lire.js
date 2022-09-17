import { options } from "../particles/particles-options.js";

const btnJouerLire = document.querySelector(".btn-lire");
const nomAleatoire = document.querySelector(".nom-aleatoire");
const dynamicChiots = document.querySelector(".dynamic-chiots");
const chiotButtons = document.querySelectorAll(".img-btn");
const audio = document.querySelector(".audio1");
const chiots = [
  "everest",
  "rocky",
  "stella",
  "marcus",
  "ruben",
  "zuma",
  "chase",
  "tracker",
];

let currentChiot = "";

const generateurDeNom = () => {
  let randomInt = Math.floor(Math.random() * chiots.length);

  currentChiot = chiots[randomInt];

  for (let lettre of currentChiot) {
    const imgLettre = document.createElement("img");
    imgLettre.classList.add("img-lettre");
    imgLettre.src = `../assets/alphabet/${lettre}.png`;

    nomAleatoire.append(imgLettre);
  }
};

const afficheImageChiots = (currentChiot) => {
  let randomChiotPlace = Math.floor(Math.random() * 3);

  chiotButtons.forEach((imgButton, index) => {
    let randomInt = Math.floor(Math.random() * chiots.length);

    if (index === randomChiotPlace) {
      imgButton.src = `../assets/${currentChiot}.png`;
    } else {
      imgButton.src = `../assets/${chiots[randomInt]}.png`;
    }

    dynamicChiots.style.display = "flex";
  });
};

const verifieChiotClique = (e) => {
  const chiotCliqueTmp = e.target.src.split("/");
  const chiotCliqueTmp2 = chiotCliqueTmp[chiotCliqueTmp.length - 1];
  const chiotClique = chiotCliqueTmp2.split(".")[0];

  if (chiotClique === currentChiot) {
    audio.src = "../assets/sons/bon.mp3";
    // audio.setAttribute("loop", "");

    tsParticles.load("tsparticles", options);

    // setTimeout(() => {
    //   audio.pause();
    // }, 6000);

    chiotButtons.forEach((chiotBtn) => {
      if (chiotBtn !== e.target) {
        chiotBtn.style.display = "none";
      } else {
        chiotBtn.classList.add("img-chiot-trouve");
        // chiotBtn.classList.remove("img-btn");
      }
    });

    // dynamicChiots.style.display = "none";
  } else {
    audio.src = `../assets/sons/mauvais.mp3`;
  }
};

btnJouerLire.addEventListener("click", () => {
  chiotButtons.forEach((chiotBtn) => {
    chiotBtn.classList.remove("img-chiot-trouve");
    // chiotBtn.classList.add("img-btn");
    chiotBtn.style.display = "flex";
  });
  audio.removeAttribute("loop");
  nomAleatoire.innerHTML = "";
  generateurDeNom();
  afficheImageChiots(currentChiot);
});

chiotButtons.forEach((imgBtn) => {
  imgBtn.addEventListener("click", (e) => {
    verifieChiotClique(e);
  });
});

generateurDeNom();
afficheImageChiots(currentChiot);
