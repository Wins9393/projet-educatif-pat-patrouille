import { melange } from "../shared/aleatoire.js";
import {
  demarreUneManche,
  prepareLaPage,
  sonFaux,
  sonJuste,
  termineLaManche,
} from "../shared/jeu.js";
import { oublie, reprise, sauvegarde } from "../shared/reprise.js";
import { creeVisuel } from "../shared/rendu.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "MEMORY" });

const grille = document.querySelector(".memory");
const consigne = document.querySelector(".consigne__texte");

/** Délai avant de recacher deux cartes dépareillées : le temps de les regarder. */
const TEMPS_DE_REGARD = 1000;

let premiere = null;
let pairesTrouvees = 0;
let bloque = false;

const annonce = () => prononce(consigne.textContent);

/**
 * Le mémory ne travaille pas la longueur des mots : tout le vocabulaire du
 * thème est éligible, quel que soit le niveau. C'est le nombre de paires qui
 * fait la difficulté.
 */
const tirageDuNiveau = () => melange(theme.items).slice(0, niveau.paires);

/** Trois, quatre ou cinq colonnes selon la taille du tapis. */
const colonnes = (nombreDeCartes) => (nombreDeCartes <= 6 ? 3 : nombreDeCartes <= 16 ? 4 : 5);

const construitUneCarte = (item) => {
  const carte = document.createElement("button");
  carte.className = "carte-memo";
  carte.dataset.mot = item.mot;
  carte.setAttribute("aria-label", "Carte cachée");

  const pivot = document.createElement("span");
  pivot.className = "carte-memo__pivot";

  const dos = document.createElement("span");
  dos.className = "carte-memo__face carte-memo__dos";
  dos.setAttribute("aria-hidden", "true");

  // La vignette est atténuée à part : le dos, lui, doit rester opaque.
  const vignette = document.createElement("span");
  vignette.className = "carte-memo__vignette";
  vignette.textContent = theme.vignette;
  dos.append(vignette);

  const avant = document.createElement("span");
  avant.className = "carte-memo__face carte-memo__avant";
  avant.append(creeVisuel(theme, { visuel: item.visuel, affichage: "" }));

  pivot.append(dos, avant);
  carte.append(pivot);

  carte.addEventListener("click", () => retourne(carte, item));
  return carte;
};

const estRetournee = (carte) =>
  carte.classList.contains("carte-memo--face") || carte.classList.contains("carte-memo--trouvee");

const montre = (carte, item) => {
  carte.classList.add("carte-memo--face");
  carte.setAttribute("aria-label", item.affichage);
};

const cache = (carte) => {
  carte.classList.remove("carte-memo--face");
  carte.setAttribute("aria-label", "Carte cachée");
};

const retourne = (carte, item) => {
  if (bloque || estRetournee(carte)) return;

  montre(carte, item);

  if (!premiere) {
    premiere = { carte, item };
    return;
  }

  const paire = premiere;
  premiere = null;

  if (paire.item.mot === item.mot) {
    valide(paire.carte, carte, item);
    return;
  }

  // Une carte retournée pour rien n'est pas une faute : au mémory on découvre
  // le tapis, et compter ces essais comme des erreurs fausserait la
  // progression de l'enfant. On se contente du son.
  sonFaux();
  bloque = true;
  setTimeout(() => {
    cache(paire.carte);
    cache(carte);
    bloque = false;
  }, TEMPS_DE_REGARD);
};

const valide = (premiereCarte, secondeCarte, item) => {
  for (const carte of [premiereCarte, secondeCarte]) {
    carte.classList.remove("carte-memo--face");
    carte.classList.add("carte-memo--trouvee");
    carte.setAttribute("aria-label", `${item.affichage}, trouvé`);
    // La carte disparaît : la désactiver la sort aussi du parcours au clavier,
    // où rien ne signalerait qu'elle n'est plus là.
    carte.disabled = true;
  }

  sonJuste();
  prononce(item.affichage);
  pairesTrouvees += 1;

  if (pairesTrouvees < niveau.paires) {
    noteLeTapis();
    return;
  }

  oublie("memory");

  termineLaManche({
    jeu: "memory",
    mot: `memory-${niveau.paires}`,
    texte: `Bravo ! Tu as trouvé les ${niveau.paires} paires`,
    emoji: theme.vignette,
    surSuite: nouvelleManche,
  });
};

/** Un tapis neuf : chaque mot du tirage en deux exemplaires, mélangés. */
const tapisNeuf = () => {
  const tirage = tirageDuNiveau();
  return melange([...tirage, ...tirage]);
};

/**
 * Le tapis sauvegardé, remis dans le même ordre.
 *
 * Un mot peut avoir disparu du thème depuis — on repart alors d'un tapis neuf
 * plutôt que d'en afficher un incomplet.
 */
const cartesReprises = ({ cartes }) => {
  const retrouvees = cartes.map((mot) => theme.items.find((item) => item.mot === mot));
  return retrouvees.every(Boolean) ? retrouvees : tapisNeuf();
};

/** Un tapis se décrit par l'ordre de ses cartes et les paires déjà trouvées. */
const noteLeTapis = () => {
  sauvegarde("memory", {
    cartes: [...grille.querySelectorAll(".carte-memo")].map((c) => c.dataset.mot),
    trouvees: [...grille.querySelectorAll(".carte-memo--trouvee")].map((c) => c.dataset.mot),
  });
};

const nouvelleManche = (repris = null) => {
  demarreUneManche();

  premiere = null;
  pairesTrouvees = 0;
  bloque = false;

  const cartes = repris ? cartesReprises(repris) : tapisNeuf();

  const parRangee = colonnes(cartes.length);
  const etroit = Math.min(parRangee, 4);
  grille.style.setProperty("--colonnes", parRangee);
  grille.style.setProperty("--colonnes-etroit", etroit);
  grille.style.setProperty("--lignes", Math.ceil(cartes.length / parRangee));
  grille.style.setProperty("--lignes-etroit", Math.ceil(cartes.length / etroit));

  grille.innerHTML = "";
  cartes.forEach((item) => grille.append(construitUneCarte(item)));

  if (repris) restaureLesPairesTrouvees(repris.trouvees);

  consigne.textContent = `Retrouve les ${niveau.paires} paires`;
  noteLeTapis();
  annonce();
};

/**
 * Repose les paires déjà trouvées, sans son ni voix : l'enfant les a déjà
 * gagnées, on ne les lui rejoue pas.
 */
const restaureLesPairesTrouvees = (trouvees = []) => {
  for (const mot of new Set(trouvees)) {
    const item = theme.items.find((i) => i.mot === mot);
    for (const carte of grille.querySelectorAll(`[data-mot="${mot}"]`)) {
      carte.classList.add("carte-memo--trouvee");
      carte.setAttribute("aria-label", `${item?.affichage ?? mot}, trouvé`);
      carte.disabled = true;
    }
    pairesTrouvees += 1;
  }
};

// Le bouton repart d'un tapis neuf : l'argument d'événement ne doit pas être
// pris pour une manche à reprendre.
document.querySelector('[data-action="rejouer"]').addEventListener("click", () => nouvelleManche());
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

nouvelleManche(reprise("memory"));
