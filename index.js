const everestBtn = document.querySelector(".everest-btn");
const rockyBtn = document.querySelector(".rocky-btn");
const stellaBtn = document.querySelector(".stella-btn");
const marcusBtn = document.querySelector(".marcus-btn");
const rubbenBtn = document.querySelector(".rubben-btn");
const zumaBtn = document.querySelector(".zuma-btn");
const chaseBtn = document.querySelector(".chase-btn");
const rexBtn = document.querySelector(".rex-btn");
const libertyBtn = document.querySelector(".liberty-btn");

const dynamicContent = document.querySelector(".dynamic-content");
const tabImages = [];

if (!tabImages.length) {
  const logoPP = document.createElement("img");
  logoPP.src = "assets/logo-pp.gif";
  dynamicContent.append(logoPP);
}

everestBtn.addEventListener("click", () => {
  ajouteUnChiot("everest");
  afficheLesChiots(tabImages);
});

rockyBtn.addEventListener("click", () => {
  ajouteUnChiot("rocky");
  afficheLesChiots(tabImages);
});

stellaBtn.addEventListener("click", () => {
  ajouteUnChiot("stella");
  afficheLesChiots(tabImages);
});

marcusBtn.addEventListener("click", () => {
  ajouteUnChiot("marcus");
  afficheLesChiots(tabImages);
});

rubbenBtn.addEventListener("click", () => {
  ajouteUnChiot("ruben");
  afficheLesChiots(tabImages);
});

zumaBtn.addEventListener("click", () => {
  ajouteUnChiot("zuma");
  afficheLesChiots(tabImages);
});

chaseBtn.addEventListener("click", () => {
  ajouteUnChiot("chase");
  afficheLesChiots(tabImages);
});

rexBtn.addEventListener("click", () => {
  ajouteUnChiot("rex");
  afficheLesChiots(tabImages);
});

libertyBtn.addEventListener("click", () => {
  ajouteUnChiot("liberty");
  afficheLesChiots(tabImages);
});

const ajouteUnChiot = (chiot) => {
  if (!tabImages.includes(chiot)) {
    tabImages.push(chiot);
  } else {
    tabImages.splice(tabImages.indexOf(chiot), 1);
  }
};

const afficheLesChiots = (tabImages) => {
  dynamicContent.innerHTML = "";

  if (!tabImages.length) {
    const logoPP = document.createElement("img");
    logoPP.src = "assets/logo-pp.gif";
    dynamicContent.append(logoPP);
  }

  tabImages.forEach((chiot) => {
    const baliseImg = document.createElement("img");

    baliseImg.src = `assets/${chiot}.png`;
    baliseImg.classList.add("image-chiots");
    dynamicContent.append(baliseImg);
  });
};
