/**
 * Vocabulaire du PARKING : des véhicules qui n'avancent que sur leur voie.
 *
 * Un véhicule ne connaît que trois choses : sa longueur, son axe, et la voie
 * sur laquelle il est coincé — la ligne d'une voiture horizontale, la colonne
 * d'une verticale. Sa voie ne change jamais, seule sa position le long de
 * l'axe bouge. C'est ce qui permet de décrire une disposition entière par une
 * simple liste de nombres, et de comparer deux dispositions d'un coup.
 *
 * Le héros — la voiture à faire sortir — est toujours le véhicule d'indice 0,
 * toujours horizontal, toujours sur la rangée de sortie.
 */

export const HORIZONTAL = "h";
export const VERTICAL = "v";

/** Le héros est le premier véhicule : c'est lui qu'on fait sortir. */
export const HEROS = 0;

/** La position la plus avancée qu'un véhicule puisse occuper sur sa voie. */
export const limite = (plateau, vehicule) =>
  (vehicule.axe === HORIZONTAL ? plateau.colonnes : plateau.lignes) - vehicule.taille;

/** Les cases `[ligne, colonne]` couvertes par un véhicule à cette position. */
export const cellules = (vehicule, position) =>
  Array.from({ length: vehicule.taille }, (_, k) =>
    vehicule.axe === HORIZONTAL ? [vehicule.voie, position + k] : [position + k, vehicule.voie]
  );

/**
 * Grille d'occupation : −1 pour une case libre, sinon l'indice du véhicule.
 *
 * Le tampon est fourni par l'appelant. La génération en construit des dizaines
 * de milliers pour une seule grille : les allouer une par une coûtait la
 * moitié du temps de calcul.
 */
export const occupe = (plateau, vehicules, positions, tampon) => {
  const cases = tampon ?? new Int8Array(plateau.lignes * plateau.colonnes);
  cases.fill(-1);

  for (let i = 0; i < vehicules.length; i += 1) {
    const vehicule = vehicules[i];
    const horizontal = vehicule.axe === HORIZONTAL;

    for (let k = 0; k < vehicule.taille; k += 1) {
      const ligne = horizontal ? vehicule.voie : positions[i] + k;
      const colonne = horizontal ? positions[i] + k : vehicule.voie;
      cases[ligne * plateau.colonnes + colonne] = i;
    }
  }

  return cases;
};

/**
 * De combien de cases un véhicule peut reculer et avancer sur sa voie.
 *
 * On avance case par case en regardant celle qui entrerait sous le véhicule,
 * et on s'arrête à la première occupée : un véhicule ne traverse pas, il bute.
 *
 * @returns {[number, number]} le recul (négatif ou nul) et l'avance (positif ou nul)
 */
export const course = (plateau, vehicules, positions, index, cases) => {
  const vehicule = vehicules[index];
  const horizontal = vehicule.axe === HORIZONTAL;
  const depart = positions[index];
  const maximum = limite(plateau, vehicule);

  const libre = (bord) => {
    const ligne = horizontal ? vehicule.voie : bord;
    const colonne = horizontal ? bord : vehicule.voie;
    return cases[ligne * plateau.colonnes + colonne] === -1;
  };

  let recul = 0;
  while (depart + recul > 0 && libre(depart + recul - 1)) recul -= 1;

  let avance = 0;
  while (depart + avance < maximum && libre(depart + avance + vehicule.taille)) avance += 1;

  return [recul, avance];
};

/**
 * La voie du héros jusqu'au mur de droite est-elle dégagée ?
 *
 * C'est la condition de victoire, à un glissement près : dès qu'elle est
 * vraie, plus rien ne sépare la voiture rouge de la sortie.
 */
export const voieDegagee = (plateau, vehicules, positions, cases) => {
  const heros = vehicules[HEROS];

  for (let colonne = positions[HEROS] + heros.taille; colonne < plateau.colonnes; colonne += 1) {
    if (cases[plateau.sortie * plateau.colonnes + colonne] !== -1) return false;
  }

  return true;
};

/**
 * Une disposition tient-elle debout ? Rien ne dehors, rien qui se chevauche,
 * le héros sur la rangée de sortie, et aucun gêneur horizontal dessus.
 *
 * Sert à écarter un instantané de reprise devenu incohérent, et à contrôler
 * le générateur au banc d'essai.
 */
export const disposeCorrectement = (plateau, vehicules, positions) => {
  if (!vehicules?.length || vehicules.length !== positions?.length) return false;

  const heros = vehicules[HEROS];
  if (heros.axe !== HORIZONTAL || heros.voie !== plateau.sortie) return false;

  const occupees = new Set();

  for (let i = 0; i < vehicules.length; i += 1) {
    const vehicule = vehicules[i];
    if (positions[i] < 0 || positions[i] > limite(plateau, vehicule)) return false;
    if (i !== HEROS && vehicule.axe === HORIZONTAL && vehicule.voie === plateau.sortie) return false;

    for (const [ligne, colonne] of cellules(vehicule, positions[i])) {
      const repere = `${ligne}.${colonne}`;
      if (occupees.has(repere)) return false;
      occupees.add(repere);
    }
  }

  return true;
};
