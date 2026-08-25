/**
 * Fabrication des parkings — et le seul solveur du jeu.
 *
 * Une disposition de véhicules tirée au hasard est insoluble environ une fois
 * sur cinq, et rien ne le laisse voir : l'enfant pousse des voitures pendant
 * dix minutes devant un problème qui n'a pas de solution. Il ne conclut pas
 * que le programme a un défaut, il conclut qu'il est nul.
 *
 * Le jeu offre pourtant la sortie gratuitement : **un coup se défait**.
 * Reculer une voiture qu'on vient d'avancer est un coup légal, donc le graphe
 * des dispositions est non orienté. Il en découle les deux propriétés sur
 * lesquelles tout ce fichier repose :
 *
 *  - si une seule disposition de la composante connexe permet la sortie,
 *    toutes la permettent ;
 *  - un parcours en largeur *depuis les dispositions gagnantes* donne la
 *    distance exacte de toutes les autres à la sortie, en coups.
 *
 * On pose donc les véhicules au hasard, on explore toute la composante, et on
 * retient comme position de départ la disposition **la plus éloignée** de la
 * sortie. Le parking est soluble par construction, et sa difficulté n'est pas
 * estimée : elle est mesurée, en nombre exact de coups minimum.
 */
import { entierAleatoire } from "./aleatoire.js";
import { HEROS, HORIZONTAL, VERTICAL, course, limite, occupe, voieDegagee } from "./circulation.js";

/**
 * Au-delà, la composante est abandonnée et la disposition retirée. Les grandes
 * composantes viennent des parkings trop vides, qui font de mauvaises grilles
 * de toute façon : on ne perd rien à les laisser passer leur tour.
 */
const PLAFOND = 60000;

/** Dispositions essayées avant de rendre la meilleure trouvée. */
const ESSAIS = 8;

/** Un coup, c'est un véhicule glissé — d'une case ou de quatre, peu importe. */
const coupsPossibles = (plateau, vehicules, positions, cases, visite) => {
  for (let i = 0; i < vehicules.length; i += 1) {
    const [recul, avance] = course(plateau, vehicules, positions, i, cases);

    for (let pas = recul; pas <= avance; pas += 1) {
      if (pas !== 0) visite(i, positions[i] + pas);
    }
  }
};

/**
 * Toute la composante connexe, plus la distance de chaque disposition à la
 * sortie. Rend `null` si la composante déborde ou si aucune sortie n'existe.
 *
 * Les dispositions sont rangées à plat dans un seul tableau typé et
 * l'adjacence dans un seul tableau d'entiers : allouer un petit tableau par
 * disposition coûtait, à lui seul, la moitié du temps de génération.
 */
const explore = (plateau, vehicules, depart) => {
  const nombreDeVehicules = vehicules.length;

  /*
   * Chaque disposition se résume à un nombre, en numérotant les positions en
   * base « voie la plus longue ». Les plateaux du jeu ne dépassent pas six
   * cases de côté : le compte reste très en deçà des entiers exacts.
   */
  const base = Math.max(...vehicules.map((vehicule) => limite(plateau, vehicule))) + 1;

  const dispositions = new Int8Array(PLAFOND * nombreDeVehicules);
  const index = new Map();
  const voisins = [];
  const debut = new Int32Array(PLAFOND + 1);
  const cases = new Int8Array(plateau.lignes * plateau.colonnes);
  const candidate = new Int8Array(nombreDeVehicules);
  const gagnantes = [];

  let nombre = 1;
  dispositions.set(depart, 0);

  const clef = (source, decalage) => {
    let valeur = 0;
    for (let i = 0; i < nombreDeVehicules; i += 1) valeur = valeur * base + source[decalage + i];
    return valeur;
  };

  index.set(clef(depart, 0), 0);

  for (let i = 0; i < nombre; i += 1) {
    const decalage = i * nombreDeVehicules;
    debut[i] = voisins.length;

    occupe(plateau, vehicules, dispositions.subarray(decalage, decalage + nombreDeVehicules), cases);
    if (voieDegagee(plateau, vehicules, dispositions.subarray(decalage), cases)) gagnantes.push(i);

    let deborde = false;

    coupsPossibles(plateau, vehicules, dispositions.subarray(decalage), cases, (vehicule, position) => {
      if (deborde) return;

      candidate.set(dispositions.subarray(decalage, decalage + nombreDeVehicules));
      candidate[vehicule] = position;

      const empreinte = clef(candidate, 0);
      let suivante = index.get(empreinte);

      if (suivante === undefined) {
        if (nombre >= PLAFOND) {
          deborde = true;
          return;
        }

        suivante = nombre;
        dispositions.set(candidate, nombre * nombreDeVehicules);
        index.set(empreinte, nombre);
        nombre += 1;
      }

      voisins.push(suivante);
    });

    if (deborde) return null;
  }

  debut[nombre] = voisins.length;
  if (!gagnantes.length) return null;

  // Les coups se défont : partir des dispositions gagnantes donne la distance
  // de toutes les autres. Le 1 de départ est le dernier glissement, celui qui
  // fait sortir la voiture rouge.
  const distance = new Int32Array(nombre).fill(-1);
  const file = new Int32Array(nombre);
  let fin = gagnantes.length;

  gagnantes.forEach((gagnante, rang) => {
    distance[gagnante] = 1;
    file[rang] = gagnante;
  });

  for (let tete = 0; tete < fin; tete += 1) {
    const courante = file[tete];

    for (let lien = debut[courante]; lien < debut[courante + 1]; lien += 1) {
      const suivante = voisins[lien];
      if (distance[suivante] !== -1) continue;

      distance[suivante] = distance[courante] + 1;
      file[fin] = suivante;
      fin += 1;
    }
  }

  return { dispositions, nombreDeVehicules, nombre, distance, voisins, debut };
};

/**
 * Pose les véhicules au hasard.
 *
 * Une seule règle de placement écarte la plupart des parkings insolubles :
 * **aucun véhicule horizontal sur la rangée de sortie** à part le héros. Il ne
 * pourrait jamais quitter cette rangée, et une fois poussé contre le mur il
 * boucherait la sortie pour toujours.
 */
const dispose = (plateau, gabarit) => {
  const vehicules = [{ taille: 2, axe: HORIZONTAL, voie: plateau.sortie }];
  const positions = [entierAleatoire(plateau.colonnes - 1)];
  const cases = occupe(plateau, vehicules, positions);

  let camions = gabarit.camions;
  let essais = 0;

  while (vehicules.length <= gabarit.vehicules && essais < 500) {
    essais += 1;

    const taille = camions > 0 && Math.random() < 0.5 ? 3 : 2;
    const axe = Math.random() < 0.5 ? HORIZONTAL : VERTICAL;
    const horizontal = axe === HORIZONTAL;

    if (taille > (horizontal ? plateau.colonnes : plateau.lignes)) continue;

    const voie = horizontal ? entierAleatoire(plateau.lignes) : entierAleatoire(plateau.colonnes);
    if (horizontal && voie === plateau.sortie) continue;

    const vehicule = { taille, axe, voie };
    const position = entierAleatoire(limite(plateau, vehicule) + 1);
    const occupees = [];

    for (let k = 0; k < taille; k += 1) {
      const ligne = horizontal ? voie : position + k;
      const colonne = horizontal ? position + k : voie;
      occupees.push(ligne * plateau.colonnes + colonne);
    }

    if (occupees.some((repere) => cases[repere] !== -1)) continue;

    occupees.forEach((repere) => (cases[repere] = vehicules.length));
    vehicules.push(vehicule);
    positions.push(position);
    if (taille === 3) camions -= 1;
  }

  return vehicules.length > gabarit.vehicules ? { vehicules, positions } : null;
};

/**
 * La meilleure grille de quelques dispositions.
 *
 * Deux seuils, et ils ne servent pas à la même chose : le **plancher** est la
 * cible, atteinte on s'arrête là ; le **minimum** est intransigeant, car une
 * grille déjà résolue n'est pas une manche. Sans cette distinction, un tirage
 * malchanceux rendait sa moins mauvaise trouvaille — parfois une voiture rouge
 * qui n'avait plus qu'à sortir.
 */
const cherche = (plateau, gabarit) => {
  let meilleure = null;

  for (let essai = 0; essai < ESSAIS; essai += 1) {
    if (meilleure && meilleure.coups >= gabarit.plancher) break;

    const depart = dispose(plateau, gabarit);
    if (!depart) continue;

    const composante = explore(plateau, depart.vehicules, Int8Array.from(depart.positions));
    if (!composante) continue;

    const { dispositions, nombreDeVehicules, nombre, distance } = composante;

    let profondeur = 0;
    for (let i = 0; i < nombre; i += 1) profondeur = Math.max(profondeur, distance[i]);
    if (meilleure && profondeur <= meilleure.coups) continue;

    // Toutes les dispositions les plus éloignées se valent : en tirer une au
    // hasard évite que deux parkings voisins se ressemblent trop.
    const plusLoin = [];
    for (let i = 0; i < nombre; i += 1) if (distance[i] === profondeur) plusLoin.push(i);

    const choisie = plusLoin[entierAleatoire(plusLoin.length)];
    const decalage = choisie * nombreDeVehicules;

    meilleure = {
      plateau,
      vehicules: depart.vehicules,
      positions: [...dispositions.subarray(decalage, decalage + nombreDeVehicules)],
      coups: profondeur,
    };
  }

  return meilleure && meilleure.coups >= gabarit.minimum ? meilleure : null;
};

/** Un parking de secours, si jamais le hasard ne donnait rien d'exploitable. */
const grilleDeSecours = (plateau) => ({
  plateau,
  vehicules: [
    { taille: 2, axe: HORIZONTAL, voie: plateau.sortie },
    { taille: 2, axe: VERTICAL, voie: plateau.colonnes - 1 },
  ],
  positions: [0, plateau.sortie === 0 ? 0 : plateau.sortie - 1],
  coups: 2,
});

/**
 * Un parking prêt à jouer : le plateau, ses véhicules, leurs positions de
 * départ, et le nombre de coups de la meilleure solution.
 */
export const tireUneGrille = (gabarit) => {
  const plateau = { lignes: gabarit.lignes, colonnes: gabarit.colonnes, sortie: gabarit.sortie };

  // Le hasard a rendu huit dispositions injouables d'affilée : plutôt qu'une
  // grille déjà résolue, on en retire un véhicule et on retente. Le cas est
  // rare — quelques tirages sur mille — et une grille un peu plus facile vaut
  // mieux qu'une manche sans énigme.
  for (let vehicules = gabarit.vehicules; vehicules >= 2; vehicules -= 1) {
    const grille = cherche(plateau, { ...gabarit, vehicules });
    if (grille) return grille;
  }

  return cherche(plateau, { ...gabarit, vehicules: 2, minimum: 1 }) ?? grilleDeSecours(plateau);
};

/**
 * Le coup à jouer maintenant pour sortir au plus vite, ou `null` si la voie
 * est déjà libre. C'est le même parcours que la génération : un seul solveur,
 * qui fabrique les grilles et souffle les indices.
 *
 * @returns {{vehicule: number, position: number} | null}
 */
export const coupSuivant = (plateau, vehicules, positions) => {
  const composante = explore(plateau, vehicules, Int8Array.from(positions));
  if (!composante) return null;

  const { dispositions, nombreDeVehicules, distance, voisins, debut } = composante;
  if (distance[0] <= 1) return null;

  for (let lien = debut[0]; lien < debut[1]; lien += 1) {
    const suivante = voisins[lien];
    if (distance[suivante] !== distance[0] - 1) continue;

    const decalage = suivante * nombreDeVehicules;
    for (let i = 0; i < nombreDeVehicules; i += 1) {
      if (dispositions[decalage + i] !== positions[i]) {
        return { vehicule: i, position: dispositions[decalage + i] };
      }
    }
  }

  return null;
};

/** Nombre de coups de la meilleure solution, ou −1 si la sortie est murée. */
export const compteLesCoups = (plateau, vehicules, positions) => {
  const composante = explore(plateau, vehicules, Int8Array.from(positions));
  return composante ? composante.distance[0] : -1;
};
