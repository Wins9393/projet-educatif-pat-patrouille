const baliseScript = document.querySelector(".script-particules");
const imageAleatoire = document.querySelector(".image-aleatoire");
const dynamicLetters = document.querySelector(".dynamic-letters");
const btnJouerEcrire = document.querySelector(".btn-jouer-ecrire");
const lettersButton = document.querySelectorAll(".img-btn-lettre");
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
  let randomInt = Math.floor(Math.random() * 7);

  currentChiot = chiots[randomInt];
  imageAleatoire.src = `../assets/${chiots[randomInt]}.png`;
};

const afficheLettres = (currentChiot) => {
  premiereLettre = currentChiot[lettreCounter];
  let randomLetterPlace = Math.floor(Math.random() * 4);

  lettersButton.forEach((imgButton, index) => {
    let randomInt = Math.floor(Math.random() * 26);

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
      // audio2.src = "../assets/reactions/son-victoire.wav";
      audio.setAttribute("loop", "");
      // audio2.setAttribute("loop", "");

      tsParticles.load("tsparticles", options);

      setTimeout(() => {
        audio.pause();
        // audio2.pause();
      }, 6000);

      dynamicLetters.style.display = "none";
      // victoireDiv.style.display = "flex";
    }

    setTimeout(() => {
      reaction.innerHTML = "";
    }, 2000);
  } else {
    audio.src = `../assets/sons/mauvais.mp3`;
  }
};

btnJouerEcrire.addEventListener("click", () => {
  audio.removeAttribute("loop");
  // audio2.removeAttribute("loop");

  lettreCounter = 0;
  nomChiot.innerHTML = "";
  reaction.innerHTML = "";
  // victoireDiv.style.display = "none";
  selectUnChiotAleatoire();
  afficheLettres(currentChiot);
});

lettersButton.forEach((imgBtn) => {
  imgBtn.addEventListener("click", (e) => {
    verifieLettreCliquee(e);
  });
});

const options = {
  fullScreen: {
    zIndex: 1,
  },
  particles: {
    number: {
      value: 120,
    },
    color: {
      value: ["#00FFFC", "#FC00FF", "#fffc00"],
    },
    shape: {
      type: ["circle", "square"],
      options: {},
    },
    opacity: {
      value: 1,
      animation: {
        enable: true,
        minimumValue: 0,
        speed: 2,
        startValue: "max",
        destroy: "min",
      },
    },
    size: {
      value: 7,
      random: {
        enable: true,
        minimumValue: 2,
      },
    },
    links: {
      enable: false,
    },
    life: {
      duration: {
        sync: true,
        value: 5,
      },
      count: 1,
    },
    move: {
      enable: true,
      gravity: {
        enable: true,
        acceleration: 10,
      },
      speed: {
        min: 10,
        max: 20,
      },
      decay: 0.1,
      direction: "none",
      straight: false,
      outModes: {
        default: "destroy",
        top: "none",
      },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      direction: "random",
      move: true,
      animation: {
        enable: true,
        speed: 30,
      },
    },
    tilt: {
      direction: "random",
      enable: true,
      move: true,
      value: {
        min: 0,
        max: 360,
      },
      animation: {
        enable: true,
        speed: 60,
      },
    },
    roll: {
      darken: {
        enable: true,
        value: 25,
      },
      enable: true,
      speed: {
        min: 15,
        max: 25,
      },
    },
    wobble: {
      distance: 30,
      enable: true,
      move: true,
      speed: {
        min: -15,
        max: 15,
      },
    },
  },
  emitters: {
    life: {
      count: 30,
      duration: 0.2,
      delay: 0.3,
    },
    rate: {
      delay: 0.1,
      quantity: 400,
    },
    size: {
      width: 0,
      height: 0,
    },
  },
};
