import { options } from "../particles/particles-options.js";

const imageAleatoire = document.querySelector(".image-aleatoire");
const dynamicLetters = document.querySelector(".dynamic-letters");
const btnJouerEcrire = document.querySelector(".btn-ecrire");
const lettersButton = document.querySelectorAll(".img-btn");
const reaction = document.querySelector(".reaction");
const audio = document.querySelector(".audio1");
// const audio2 = document.querySelector(".audio2");
// let victoireDiv = document.querySelector(".victoire");
let nomChiot = document.querySelector(".nom-chiot");

let currentChiot = "";
let premiereLettre = "";
let lettreCounter = 0;

const chiots = [
  "everest",
  "rocky",
  "stella",
  "marcus",
  "ruben",
  "zuma",
  "chase",
  "tracker",
  "rex",
  "liberty",
];
const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const selectUnChiotAleatoire = () => {
  let randomInt = Math.floor(Math.random() * chiots.length);

  currentChiot = chiots[randomInt];
  imageAleatoire.src = `../assets/${chiots[randomInt]}.png`;
};

const afficheLettres = (currentChiot) => {
  premiereLettre = currentChiot[lettreCounter];
  let randomLetterPlace = Math.floor(Math.random() * 5);

  lettersButton.forEach((imgButton, index) => {
    let randomInt = Math.floor(Math.random() * alphabet.length);

    if (index === randomLetterPlace) {
      imgButton.src = `../assets/alphabet/${premiereLettre}.png`;
    } else {
      imgButton.src = `../assets/alphabet/${alphabet[randomInt]}.png`;
    }

    dynamicLetters.style.display = "flex";
  });
};

const verifieLettreCliquee = (e) => {
  // Ouvert en cliquant sur le fichier HTML
  // const lettreCliqueeTmp = e.target.src.split(".")[0];
  // const lettreCliquee = lettreCliqueeTmp.substring(lettreCliqueeTmp.length - 1);

  // Ouvert avec un serveur
  const lettreCliqueeTmp = e.target.src.split("/");
  const lettreCliqueeTmp2 = lettreCliqueeTmp[lettreCliqueeTmp.length - 1];
  const lettreCliquee = lettreCliqueeTmp2[0];

  if (lettreCliquee === premiereLettre) {
    audio.src = `../assets/sons/bon.mp3`;
    const imgNomChiot = document.createElement("img");
    const imgReaction = document.createElement("img");

    imgNomChiot.classList.add("img-nom-chiot");
    imgReaction.classList.add("img-reaction");

    imgReaction.src = `../assets/reactions/double-pouce.png`;
    imgNomChiot.src = `../assets/alphabet/${premiereLettre}.png`;

    nomChiot.append(imgNomChiot);
    reaction.appendChild(imgReaction);
    reaction.style.display = "flex";

    lettreCounter++;
    afficheLettres(currentChiot);

    if (premiereLettre === undefined) {
      audio.src = "../assets/reactions/cris-de-joie.mp3";
      tsParticles.load("tsparticles", options);

      dynamicLetters.style.display = "none";
    }

    setTimeout(() => {
      reaction.innerHTML = "";
    }, 2000);
  } else {
    audio.src = `../assets/sons/mauvais.mp3`;
  }
};

btnJouerEcrire.addEventListener("click", () => {
  lettreCounter = 0;
  nomChiot.innerHTML = "";
  reaction.innerHTML = "";

  selectUnChiotAleatoire();
  afficheLettres(currentChiot);
});

lettersButton.forEach((imgBtn) => {
  imgBtn.addEventListener("click", (e) => {
    verifieLettreCliquee(e);
  });
});

selectUnChiotAleatoire();
afficheLettres(currentChiot);
