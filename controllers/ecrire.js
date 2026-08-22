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
import { prononce, prononceUneLettre } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "ÉCRIRE" });

const question = document.querySelector(".question");
const motEnCours = document.querySelector(".mot-en-cours");
const zoneChoix = document.querySelector(".choix");
const consigne = document.querySelector(".consigne__texte");

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const disponibles = motsDuNiveau(theme.items, niveau);

let itemAEcrire = null;
let position = 0;
let motTermine = false;

const lettreAttendue = () => itemAEcrire.mot[position];

/** Aide complète : le mot, puis la lettre à chercher. C'est le rôle du 🔊. */
const souffle = () => {
  if (motTermine) return;
  prononce(`${itemAEcrire.affichage}. Trouve la lettre ${lettreAttendue()}`);
};

/**
 * Ce que le jeu dit de lui-même.
 *
 * À partir du niveau 4, le mot n'est plus donné — ni écrit sous l'image, ni
 * prononcé : l'image le nomme, et le reconnaître fait partie de l'exercice.
 * Le bouton 🔊 continue de le souffler à qui bloque.
 */
const annonce = () => {
  if (!niveau.motDonne) return;
  souffle();
};

/** Une case par lettre : l'enfant voit d'emblée la longueur du mot. */
const dessineLesCases = () => {
  motEnCours.innerHTML = "";

  [...itemAEcrire.mot].forEach((caractere, index) => {
    const case_ = document.createElement("span");
    case_.className = "mot-en-cours__case";

    if (index < position) {
      case_.classList.add("mot-en-cours__case--remplie");
      case_.append(creeCaractere(theme, caractere));
    }

    motEnCours.append(case_);
  });

  motEnCours.style.setProperty("--lettres", itemAEcrire.mot.length);
  motEnCours.setAttribute("aria-label", `${position} lettre sur ${itemAEcrire.mot.length}`);
};

const dessineLesChoix = () => {
  const grille = construitGrille(ALPHABET, lettreAttendue(), reglages().nombreDeChoix);

  zoneChoix.innerHTML = "";
  grille.forEach((caractere) => {
    const bouton = document.createElement("button");
    bouton.className = "choix__bouton";
    bouton.setAttribute("aria-label", `Lettre ${caractere}`);
    bouton.append(creeCaractere(theme, caractere));
    bouton.addEventListener("click", () => verifie(caractere, bouton));
    zoneChoix.append(bouton);
  });
};

const noteLaManche = () => sauvegarde("ecrire", { mot: itemAEcrire.mot, position });

const nouvelleManche = (repris = null) => {
  demarreUneManche();

  motTermine = false;

  const retrouve = repris && disponibles.find((item) => item.mot === repris.mot);
  itemAEcrire = retrouve || choisirAleatoire(disponibles);
  // Une position héritée d'un autre mot n'aurait aucun sens.
  position = retrouve ? Math.min(repris.position, itemAEcrire.mot.length - 1) : 0;

  question.innerHTML = "";
  question.append(creeVisuel(theme, itemAEcrire));

  consigne.textContent = niveau.motDonne ? `Écris ${itemAEcrire.affichage}` : "Écris le mot";

  dessineLesCases();
  dessineLesChoix();
  annonce();
};

const verifie = (caractere, bouton) => {
  if (motTermine) return;

  if (caractere !== lettreAttendue()) {
    enregistreUneErreur("ecrire", itemAEcrire.mot);
    bouton.classList.add("choix__bouton--faux");
    setTimeout(() => bouton.classList.remove("choix__bouton--faux"), 400);
    return;
  }

  sonJuste();
  noteLaManche();
  prononceUneLettre(caractere);
  position += 1;
  dessineLesCases();

  // Le mot est complet : on s'arrête ici plutôt que de tirer une grille sur
  // une lettre qui n'existe pas.
  if (position === itemAEcrire.mot.length) {
    motTermine = true;
    zoneChoix.innerHTML = "";

    termineLaManche({
      jeu: "ecrire",
      mot: itemAEcrire.mot,
      texte: `Bravo ! Tu as écrit ${itemAEcrire.affichage}`,
      emoji: itemAEcrire.visuel,
      surSuite: nouvelleManche,
    });
  noteLaManche();
    return;
  }

  dessineLesChoix();
  annonce();
    oublie("ecrire");
};

document.querySelector('[data-action="rejouer"]').addEventListener("click", () => nouvelleManche());
document.querySelector('[data-action="ecouter"]').addEventListener("click", souffle);

nouvelleManche(reprise("ecrire"));
