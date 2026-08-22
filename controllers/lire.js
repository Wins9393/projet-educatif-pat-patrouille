import { choisirAleatoire, construitGrille } from "../shared/aleatoire.js";
import {
  demarreUneManche,
  enregistreUneErreur,
  prepareLaPage,
  sonJuste,
  termineLaManche,
} from "../shared/jeu.js";
import { motsDuNiveau } from "../shared/niveaux.js";
import { reglages } from "../shared/reglages.js";
import { creeCaractere, creeVisuel } from "../shared/rendu.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "LIRE" });

const motALire = document.querySelector(".mot-a-lire");
const zoneChoix = document.querySelector(".choix");
const consigne = document.querySelector(".consigne__texte");

const disponibles = motsDuNiveau(theme.items, niveau);

let itemADeviner = null;
let mancheGagnee = false;

const annonce = () => prononce("Quel mot est écrit ?");

const nouvelleManche = () => {
  demarreUneManche();

  mancheGagnee = false;
  itemADeviner = choisirAleatoire(disponibles);

  motALire.innerHTML = "";
  for (const caractere of itemADeviner.mot) {
    motALire.append(creeCaractere(theme, caractere));
  }
  motALire.setAttribute("aria-label", `Le mot ${itemADeviner.affichage}`);

  const grille = construitGrille(disponibles, itemADeviner, reglages().nombreDeChoix);

  zoneChoix.innerHTML = "";
  grille.forEach((item) => {
    const bouton = document.createElement("button");
    bouton.className = "choix__bouton";
    bouton.setAttribute("aria-label", item.affichage);
    bouton.append(creeVisuel(theme, item));
    bouton.addEventListener("click", () => verifie(item, bouton));
    zoneChoix.append(bouton);
  });

  consigne.textContent = "Quel mot est écrit ?";
  annonce();
};

const verifie = (item, bouton) => {
  if (mancheGagnee) return;

  if (item !== itemADeviner) {
    enregistreUneErreur("lire", itemADeviner.mot);
    bouton.classList.add("choix__bouton--faux");
    setTimeout(() => bouton.classList.remove("choix__bouton--faux"), 400);
    return;
  }

  mancheGagnee = true;
  sonJuste();
  bouton.classList.add("choix__bouton--juste");

  zoneChoix.querySelectorAll(".choix__bouton").forEach((autre) => {
    if (autre !== bouton) autre.classList.add("choix__bouton--efface");
  });

  termineLaManche({
    jeu: "lire",
    mot: itemADeviner.mot,
    texte: `Bravo ! C'est ${itemADeviner.affichage}`,
    emoji: itemADeviner.visuel,
    surSuite: nouvelleManche,
  });
};

document.querySelector('[data-action="rejouer"]').addEventListener("click", nouvelleManche);
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

nouvelleManche();
