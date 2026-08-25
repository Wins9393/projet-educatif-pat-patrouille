import {
  HEROS,
  HORIZONTAL,
  VERTICAL,
  course,
  disposeCorrectement,
  limite,
  occupe,
  voieDegagee,
} from "../shared/circulation.js";
import { coupSuivant, tireUneGrille } from "../shared/embouteillage.js";
import { installeLeGeste } from "../shared/glissement.js";
import { demarreUneManche, prepareLaPage, termineLaManche } from "../shared/jeu.js";
import { oublie, reprise, sauvegarde } from "../shared/reprise.js";
import { sonPose, sonRefus } from "../shared/sons.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "PARKING" });

const gabarit = niveau.parking;

const zone = document.querySelector(".parking");
const grille = document.querySelector(".parking__grille");
const consigne = document.querySelector(".consigne__texte");
const zoneAnnonce = document.querySelector(".parking__annonce");
const boutonIndice = document.querySelector('[data-action="indice"]');
const boutonAnnuler = document.querySelector('[data-action="annuler"]');

/**
 * Combien de couleurs de gêneurs la feuille de style propose. Le héros a la
 * sienne, le rouge, et il est seul à l'avoir : c'est le repère du jeu.
 */
const NOMBRE_DE_COULEURS = 6;

/**
 * De combien de cases la voiture rouge peut être tirée au-delà du mur quand la
 * voie est libre. Elle ne s'arrête pas à la sortie : on la fait sortir.
 */
const SORTIE_EN_CASES = 1.4;

/** Le temps laissé à la voiture pour s'en aller avant les félicitations. */
const JOIE_AVANT_FELICITATIONS = 900;

/** Durée d'un indice à l'écran, le temps de trois allers-retours. */
const DUREE_INDICE = 1600;

let plateau = null;
let vehicules = [];
let positions = [];
let elements = [];
let depart = [];
let historique = [];
let optimum = 0;
let coups = 0;
let enCours = null;
let gagne = false;

/** La grille suivante, calculée d'avance pendant que l'enfant joue celle-ci. */
let prochaine = null;

/** Minuterie de l'indice en cours d'affichage. */
let minuterie = null;

/** Grille d'occupation réutilisée : on en demande une à chaque geste. */
let tampon = null;

const horizontal = (index) => vehicules[index].axe === HORIZONTAL;
const annonce = () => prononce(consigne.textContent);
const pluriel = (nombre) => (nombre > 1 ? "s" : "");

/* ================================================================== */
/* Le parking                                                          */
/* ================================================================== */

const construitLePlateau = () => {
  zone.style.setProperty("--lignes", plateau.lignes);
  zone.style.setProperty("--colonnes", plateau.colonnes);
  zone.style.setProperty("--sortie", plateau.sortie);

  grille.replaceChildren();

  for (let i = 0; i < plateau.lignes * plateau.colonnes; i += 1) {
    const place = document.createElement("span");
    place.className = "parking__place";
    grille.append(place);
  }
};

/** Ce que le lecteur d'écran annonce d'un véhicule. */
const decrit = (index) => {
  const vehicule = vehicules[index];
  const quoi = index === HEROS ? "la voiture rouge" : vehicule.taille >= 3 ? "un camion" : "une voiture";
  const ou = horizontal(index) ? `rangée ${vehicule.voie + 1}` : `colonne ${vehicule.voie + 1}`;

  return `${quoi}, ${horizontal(index) ? "horizontal" : "vertical"}, ${ou}`;
};

/** Repose le véhicule sur sa case : c'est le seul endroit qui écrit sa place. */
const place = (index) => {
  const vehicule = vehicules[index];
  const element = elements[index];

  element.style.setProperty("--ligne", horizontal(index) ? vehicule.voie : positions[index]);
  element.style.setProperty("--colonne", horizontal(index) ? positions[index] : vehicule.voie);
  element.style.setProperty("--largeur", horizontal(index) ? vehicule.taille : 1);
  element.style.setProperty("--hauteur", horizontal(index) ? 1 : vehicule.taille);
  element.style.setProperty("--taille", vehicule.taille);
};

const creeLeVehicule = (index) => {
  const vehicule = vehicules[index];
  const element = document.createElement("div");

  element.className = `vehicule vehicule--${horizontal(index) ? "horizontal" : "vertical"}`;
  element.classList.add(index === HEROS ? "vehicule--heros" : `vehicule--couleur-${(index - 1) % NOMBRE_DE_COULEURS}`);
  if (vehicule.taille >= 3) element.classList.add("vehicule--camion");

  element.setAttribute("role", "button");
  element.setAttribute("aria-label", decrit(index));
  element.tabIndex = 0;

  const corps = document.createElement("span");
  corps.className = "vehicule__corps";
  element.append(corps);

  elements[index] = element;
  place(index);
  installeLesGestes(index);
  installeLeClavier(index);
  grille.append(element);
};

/* ================================================================== */
/* Jouer un coup                                                       */
/* ================================================================== */

const casesOccupees = () => {
  tampon ??= new Int8Array(plateau.lignes * plateau.colonnes);
  return occupe(plateau, vehicules, positions, tampon);
};

/**
 * Le seul endroit par lequel un véhicule change de case.
 *
 * Le glissement et le clavier y débouchent tous les deux : le compte des
 * coups, le son, l'historique et l'instantané n'existent qu'ici. C'est la
 * leçon du PUZZLE, où le clavier avait fini par doubler la logique du geste et
 * par oublier la sauvegarde.
 */
const joue = (index, arrivee) => {
  historique.push([index, positions[index]]);
  positions[index] = arrivee;
  place(index);

  coups += 1;
  sonPose();
  effaceLIndice();
  afficheLesCoups();
  noteLaManche();
};

/** La voiture rouge s'en va : c'est le dernier coup de la manche. */
const sort = () => {
  gagne = true;
  coups += 1;

  const element = elements[HEROS];
  element.classList.remove("vehicule--tenu");
  element.style.removeProperty("transform");
  element.classList.add("vehicule--sorti");

  sonPose();
  effaceLIndice();
  afficheLesCoups();
  oublie("parking");

  /*
   * Une pause avant les félicitations : la voiture met un instant à quitter le
   * parking, et c'est le seul moment de la manche qui récompense vraiment.
   * L'écran de victoire la recouvrirait.
   */
  setTimeout(() => {
    const parfait = coups <= optimum;

    termineLaManche({
      jeu: "parking",
      mot: `parking-${optimum}`,
      texte: parfait
        ? `Bravo ! Sortie en ${coups} coup${pluriel(coups)}, personne ne fait mieux`
        : `Bravo ! La voiture est sortie en ${coups} coup${pluriel(coups)}`,
      emoji: parfait ? "🏁" : theme.vignette,
      surSuite: () => nouvelleManche(),
    });
  }, JOIE_AVANT_FELICITATIONS);
};

/** Un véhicule que rien ne laisse bouger : on le dit, sans le compter comme une erreur. */
const refuse = (index) => {
  const element = elements[index];

  sonRefus();
  element.classList.remove("vehicule--coince");
  // Forcer un reflow relance l'animation même sur un deuxième essai d'affilée.
  void element.offsetWidth;
  element.classList.add("vehicule--coince");
};

/* ================================================================== */
/* Le geste : attraper, pousser, lâcher                                */
/* ================================================================== */

const coteDeLaCase = () => grille.getBoundingClientRect().width / plateau.colonnes;

const translation = (index, pixels) =>
  horizontal(index) ? `translateX(${pixels}px)` : `translateY(${pixels}px)`;

/**
 * Rend le véhicule à sa case, en lui laissant glisser le reliquat de pixels
 * que le doigt avait en trop. Sans ce reste, il claquerait sur sa case.
 *
 * Le reflux forcé au milieu n'est pas un ornement : il fait constater au
 * navigateur la position tenue par le doigt, transition coupée, avant qu'on ne
 * la lui retire. C'est ce qui donne à la transition un point de départ. Une
 * trame d'animation ferait le même travail, mais elle ne vient jamais dans un
 * onglet masqué — le véhicule resterait alors figé où le doigt l'a laissé.
 */
const rendLeVehicule = (index, reliquat) => {
  const element = elements[index];

  element.style.transform = translation(index, reliquat);
  void element.offsetWidth;

  element.classList.remove("vehicule--tenu");
  element.style.removeProperty("transform");
};

/**
 * La course libre est calculée une seule fois, à la prise : rien d'autre ne
 * bouge pendant le glissement, elle reste vraie jusqu'au bout.
 */
const attrape = (index, debut) => {
  const cases = casesOccupees();
  const [recul, avance] = course(plateau, vehicules, positions, index, cases);
  const sortie = index === HEROS && voieDegagee(plateau, vehicules, positions, cases);
  const cote = coteDeLaCase();

  elements[index].classList.add("vehicule--tenu");

  enCours = {
    index,
    cote,
    debut,
    decalage: 0,
    minimum: recul * cote,
    maximum: (avance + (sortie ? SORTIE_EN_CASES : 0)) * cote,
  };

  if (recul === 0 && avance === 0 && !sortie) refuse(index);
};

const deplace = (e) => {
  const { index, debut, minimum, maximum } = enCours;
  const parcouru = horizontal(index) ? e.clientX - debut.x : e.clientY - debut.y;

  enCours.decalage = Math.max(minimum, Math.min(parcouru, maximum));
  elements[index].style.transform = translation(index, enCours.decalage);
};

const relache = ({ abandonne = false } = {}) => {
  const { index, cote, decalage } = enCours;
  enCours = null;

  const pas = abandonne ? 0 : Math.round(decalage / cote);

  if (pas !== 0) {
    // Tirée au-delà du mur, la voiture rouge ne revient pas : elle est sortie.
    if (index === HEROS && positions[index] + pas > limite(plateau, vehicules[HEROS])) return sort();
    joue(index, positions[index] + pas);
  }

  rendLeVehicule(index, decalage - pas * cote);
};

const installeLesGestes = (index) => {
  installeLeGeste(elements[index], {
    autorise: () => !gagne,
    surPrise: (e, debut) => attrape(index, debut),
    surDeplacement: deplace,
    surDepose: () => relache(),
    surAbandon: () => relache({ abandonne: true }),
  });
};

/* ================================================================== */
/* Le clavier                                                          */
/* ================================================================== */

/** Chaque flèche dit un sens et un axe : un véhicule ignore les deux autres. */
const TOUCHES = {
  ArrowLeft: [-1, HORIZONTAL],
  ArrowRight: [1, HORIZONTAL],
  ArrowUp: [-1, VERTICAL],
  ArrowDown: [1, VERTICAL],
};

const pousse = (index, sens) => {
  const cases = casesOccupees();
  const [recul, avance] = course(plateau, vehicules, positions, index, cases);

  if (sens > 0 && avance === 0) {
    // Contre le mur, sur la rangée de sortie, plus rien devant : elle s'en va.
    if (index === HEROS && voieDegagee(plateau, vehicules, positions, cases)) return sort();
    return refuse(index);
  }

  if (sens < 0 && recul === 0) return refuse(index);

  joue(index, positions[index] + sens);
};

const installeLeClavier = (index) => {
  elements[index].addEventListener("keydown", (e) => {
    const commande = TOUCHES[e.key];
    if (gagne || !commande) return;

    e.preventDefault();

    const [sens, axe] = commande;
    if (vehicules[index].axe === axe) pousse(index, sens);
  });
};

/* ================================================================== */
/* Les aides                                                           */
/* ================================================================== */

const effaceLIndice = () => {
  clearTimeout(minuterie);
  minuterie = null;
  elements.forEach((element) => element.classList.remove("vehicule--indice"));
};

/**
 * Le coup optimal, montré sur le véhicule concerné.
 *
 * C'est le solveur qui a fabriqué la grille qui répond ici : il n'y en a qu'un,
 * et il ne peut donc pas conseiller un coup que le parking ne permet pas.
 */
const montreUnIndice = () => {
  if (gagne) return;

  effaceLIndice();

  const coup = coupSuivant(plateau, vehicules, positions);
  const index = coup ? coup.vehicule : HEROS;
  const sens = coup ? Math.sign(coup.position - positions[index]) : 1;
  const element = elements[index];

  element.style.setProperty("--sens", sens);
  element.classList.add("vehicule--indice");
  element.focus({ preventScroll: true });

  minuterie = setTimeout(effaceLIndice, DUREE_INDICE);
};

const annuleLeDernierCoup = () => {
  if (gagne || !historique.length) return;

  const [index, ancienne] = historique.pop();
  positions[index] = ancienne;
  place(index);

  coups = Math.max(0, coups - 1);
  effaceLIndice();
  afficheLesCoups();
  noteLaManche();
};

const recommence = () => {
  if (gagne) return;

  positions = [...depart];
  historique = [];
  coups = 0;

  positions.forEach((_, index) => place(index));
  effaceLIndice();
  afficheLesCoups();
  noteLaManche();
};

/* ================================================================== */
/* La manche                                                           */
/* ================================================================== */

const afficheLesCoups = () => {
  zoneAnnonce.textContent = coups ? `${coups} coup${pluriel(coups)}` : "À toi de jouer";
  boutonAnnuler.disabled = gagne || !historique.length;
  boutonIndice.disabled = gagne;
};

const noteLaManche = () => {
  if (gagne) return;

  sauvegarde("parking", {
    plateau,
    vehicules,
    depart,
    positions: [...positions],
    optimum,
    coups,
  });
};

/** Une manche neuve, prise à la volée si elle a été calculée d'avance. */
const mancheNeuve = () => {
  const grilleTiree = prochaine ?? tireUneGrille(gabarit);
  prochaine = null;

  return {
    plateau: grilleTiree.plateau,
    vehicules: grilleTiree.vehicules,
    depart: [...grilleTiree.positions],
    positions: [...grilleTiree.positions],
    optimum: grilleTiree.coups,
    coups: 0,
  };
};

/**
 * La grille suivante se calcule pendant que l'enfant joue celle-ci.
 *
 * Explorer la composante d'un parking de onze véhicules demande quelques
 * dizaines de millisecondes ici, et peut-être une demi-seconde sur une vieille
 * tablette. Au moment où l'écran de félicitations s'efface, elle est prête :
 * seule la toute première grille d'une session se paie comptant.
 */
const prepareLaSuivante = () => {
  const calcule = () => {
    prochaine ??= tireUneGrille(gabarit);
  };

  if (window.requestIdleCallback) requestIdleCallback(calcule, { timeout: 3000 });
  else setTimeout(calcule, 600);
};

/** Un instantané exploitable : le parking et ses véhicules se tiennent. */
const estUtilisable = (manche) =>
  Number.isInteger(manche?.plateau?.lignes) &&
  Array.isArray(manche.positions) &&
  Array.isArray(manche.depart) &&
  disposeCorrectement(manche.plateau, manche.vehicules, manche.positions);

const nouvelleManche = (repris = null) => {
  demarreUneManche();

  enCours = null;
  gagne = false;
  elements = [];
  tampon = null;
  effaceLIndice();

  const manche = estUtilisable(repris) ? repris : mancheNeuve();

  plateau = manche.plateau;
  vehicules = manche.vehicules;
  positions = [...manche.positions];
  depart = [...manche.depart];
  optimum = manche.optimum;
  coups = manche.coups ?? 0;
  historique = [];

  construitLePlateau();
  vehicules.forEach((_, index) => creeLeVehicule(index));

  consigne.textContent = "Fais sortir la voiture rouge";
  afficheLesCoups();
  noteLaManche();
  annonce();
  prepareLaSuivante();
};

/*
 * Quitter la fenêtre en plein glissement ne produit pas toujours de
 * `pointercancel` : le véhicule rentrerait dans sa case au retour, à des
 * pixels de là où le doigt l'avait laissé.
 */
window.addEventListener("blur", () => {
  if (!enCours) return;

  const { index, decalage } = enCours;
  enCours = null;
  rendLeVehicule(index, decalage);
});

boutonIndice.addEventListener("click", montreUnIndice);
boutonAnnuler.addEventListener("click", annuleLeDernierCoup);
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);
document.querySelector('[data-action="recommencer"]').addEventListener("click", recommence);

// Le bouton repart d'un parking neuf : l'argument d'événement ne doit pas être
// pris pour une manche à reprendre.
document.querySelector('[data-action="rejouer"]').addEventListener("click", () => nouvelleManche());

nouvelleManche(reprise("parking"));
