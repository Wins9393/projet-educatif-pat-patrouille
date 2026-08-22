import { construitGrille, entierAleatoire } from "../shared/aleatoire.js";
import {
  demarreUneManche,
  enregistreUneErreur,
  prepareLaPage,
  sonJuste,
  termineLaManche,
} from "../shared/jeu.js";
import { leurresNumeriques } from "../shared/niveaux.js";
import { reglages } from "../shared/reglages.js";
import { creeCaractere, creeVisuel } from "../shared/rendu.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "COMPTER" });

const collection = document.querySelector(".collection");
const zoneChoix = document.querySelector(".choix");
const consigne = document.querySelector(".consigne__texte");

const objet = theme.collecte.objet;

let quantite = 0;
let mancheGagnee = false;

const annonce = () => prononce(`Combien y a-t-il de ${objet.pluriel} ?`);

const nouvelleManche = () => {
  demarreUneManche();

  mancheGagnee = false;
  quantite = entierAleatoire(niveau.quantiteMax) + 1;

  collection.innerHTML = "";
  for (let i = 0; i < quantite; i++) {
    const visuel = creeVisuel(theme, { visuel: objet.visuel, affichage: "" });
    // Décalage léger : les objets ne forment pas une grille trop régulière,
    // ce qui oblige vraiment à les dénombrer un par un.
    visuel.style.transform = `rotate(${entierAleatoire(17) - 8}deg)`;
    collection.append(visuel);
  }
  collection.setAttribute("aria-label", `${quantite} ${objet.pluriel} à compter`);

  const pool = leurresNumeriques(quantite, reglages().nombreDeChoix, niveau.quantiteMax);
  const grille = construitGrille([quantite, ...pool], quantite, reglages().nombreDeChoix);

  zoneChoix.innerHTML = "";
  grille.forEach((chiffre) => {
    const bouton = document.createElement("button");
    bouton.className = "choix__bouton";
    bouton.setAttribute("aria-label", String(chiffre));

    // Au-delà de neuf, le nombre s'écrit avec plusieurs caractères.
    for (const caractere of String(chiffre)) {
      bouton.append(creeCaractere(theme, caractere));
    }

    bouton.addEventListener("click", () => verifie(chiffre, bouton));
    zoneChoix.append(bouton);
  });

  consigne.textContent = `Combien y a-t-il de ${objet.pluriel} ?`;
  annonce();
};

const verifie = (chiffre, bouton) => {
  if (mancheGagnee) return;

  if (chiffre !== quantite) {
    enregistreUneErreur("compter", `compter-${quantite}`);
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
    jeu: "compter",
    mot: `compter-${quantite}`,
    texte: `Bravo ! Il y en a ${quantite}`,
    emoji: objet.visuel,
    surSuite: nouvelleManche,
  });
};

document.querySelector('[data-action="rejouer"]').addEventListener("click", nouvelleManche);
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

nouvelleManche();
