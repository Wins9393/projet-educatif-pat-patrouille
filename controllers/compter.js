import { options } from "../particles/particles-options.js";

const nombreOsAleatoire = document.querySelector(".nombre-aleatoire-os");
const btnJouerCompter = document.querySelector(".btn-compter");
const imagesNombreAleatoire = document.querySelectorAll(
  ".img-nombre-aleatoire"
);
const imgBtnNombre = document.querySelectorAll(".img-btn");
const audio = document.querySelector(".audio1");

let randomInt;

const afficheOsAleatoire = () => {
  randomInt = Math.floor(Math.random() * 10);
  // nombreOsAleatoire.style.display = "flex";

  for (let i = 0; i < randomInt; i++) {
    const imgOs = document.createElement("img");
    imgOs.classList.add("img-os");
    imgOs.src = "../assets/os.png";
    nombreOsAleatoire.append(imgOs);
  }

  afficheNombresAleatoire();
};

const afficheNombresAleatoire = () => {
  let randomPlace = Math.floor(Math.random() * 5);
  imagesNombreAleatoire.forEach((imgNombre, index) => {
    if (randomPlace === index) {
      imgNombre.src = `../assets/alphabet/${randomInt}.png`;
    } else {
      imgNombre.src = `../assets/alphabet/${Math.floor(
        Math.random() * 10
      )}.png`;
    }
  });
};

const verifieNombreClique = (e) => {
  const nombreCliqueTmp = e.target.src.split("/");
  const nombreCliqueTmp2 = nombreCliqueTmp[nombreCliqueTmp.length - 1];
  const nombreClique = parseInt(nombreCliqueTmp2[0]);
  console.log(nombreClique);

  if (nombreClique === randomInt) {
    // nombreOsAleatoire.style.display = "none";

    imgBtnNombre.forEach((imgBtn) => {
      if (imgBtn !== e.target) {
        imgBtn.style.display = "none";
      } else {
        imgBtn.classList.add("img-trouvee");
      }
    });

    audio.src = "../assets/reactions/cris-de-joie.mp3";
    tsParticles.load("tsparticles", options);
  } else {
    audio.src = `../assets/sons/mauvais.mp3`;
  }
};

btnJouerCompter.addEventListener("click", () => {
  imgBtnNombre.forEach((imgBtn) => {
    imgBtn.classList.remove("img-trouvee");
    imgBtn.style.display = "flex";
  });
  nombreOsAleatoire.innerHTML = "";
  afficheOsAleatoire();
});

imgBtnNombre.forEach((imgBtn) => {
  imgBtn.addEventListener("click", (e) => {
    verifieNombreClique(e);
  });
});

afficheOsAleatoire();
