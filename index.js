const everestBtn = document.querySelector(".everest-btn");
const rockyBtn = document.querySelector(".rocky-btn");
const stellaBtn = document.querySelector(".stella-btn");
const marcusBtn = document.querySelector(".marcus-btn");
const rubbenBtn = document.querySelector(".rubben-btn");
const zumaBtn = document.querySelector(".zuma-btn");
const chaseBtn = document.querySelector(".chase-btn");

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

const ajouteUnChiot = (chiot) => {
  switch (chiot) {
    case "everest":
      if (!tabImages.includes("everest")) {
        tabImages.push("everest");
      } else {
        tabImages.splice(tabImages.indexOf("everest"), 1);
      }
      break;
    case "rocky":
      if (!tabImages.includes("rocky")) {
        tabImages.push("rocky");
      } else {
        tabImages.splice(tabImages.indexOf("rocky"), 1);
      }
      break;
    case "stella":
      if (!tabImages.includes("stella")) {
        tabImages.push("stella");
      } else {
        tabImages.splice(tabImages.indexOf("stella"), 1);
      }
      break;
    case "marcus":
      if (!tabImages.includes("marcus")) {
        tabImages.push("marcus");
      } else {
        tabImages.splice(tabImages.indexOf("marcus"), 1);
      }
      break;
    case "ruben":
      if (!tabImages.includes("ruben")) {
        tabImages.push("ruben");
      } else {
        tabImages.splice(tabImages.indexOf("ruben"), 1);
      }
      break;
    case "zuma":
      if (!tabImages.includes("zuma")) {
        tabImages.push("zuma");
      } else {
        tabImages.splice(tabImages.indexOf("zuma"), 1);
      }
      break;
    case "chase":
      if (!tabImages.includes("chase")) {
        tabImages.push("chase");
      } else {
        tabImages.splice(tabImages.indexOf("chase"), 1);
      }
      break;
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
