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
import { oublie, reprise, sauvegarde } from "../shared/reprise.js";
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

/** Le mot cherché et les images proposées : sans la grille, la reprise
    changerait les réponses sous les yeux de l'enfant. */
const noteLaManche = (grille) => {
  sauvegarde("lire", { mot: itemADeviner.mot, grille: grille.map((item) => item.mot) });
};

const parMot = (mot) => disponibles.find((item) => item.mot === mot);

const nouvelleManche = (repris = null) => {
  demarreUneManche();

  mancheGagnee = false;
  itemADeviner = (repris && parMot(repris.mot)) || choisirAleatoire(disponibles);

  motALire.innerHTML = "";
  // La CSS ne peut pas compter les lettres : elle en a besoin pour que le mot
  // tienne sur une ligne sur un écran étroit.
  motALire.style.setProperty("--lettres", itemADeviner.mot.length);
  for (const caractere of itemADeviner.mot) {
    motALire.append(creeCaractere(theme, caractere));
  }
  motALire.setAttribute("aria-label", `Le mot ${itemADeviner.affichage}`);

  const reprisEntier = repris?.grille?.map(parMot);
  const grille =
    reprisEntier?.every(Boolean) && reprisEntier.includes(itemADeviner)
      ? reprisEntier
      : construitGrille(disponibles, itemADeviner, reglages().nombreDeChoix);

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
  noteLaManche(grille);
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
  oublie("lire");
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

document.querySelector('[data-action="rejouer"]').addEventListener("click", () => nouvelleManche());
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

nouvelleManche(reprise("lire"));
