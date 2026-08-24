/**
 * Fabrication des grilles du PUZZLE.
 *
 * C'est le cœur du jeu, et il tient dans une inversion. Si les pièces étaient
 * tirées au hasard, la grille serait insoluble une fois sur deux — et un
 * enfant devant un puzzle impossible ne conclut pas que le programme a un
 * bug : il conclut qu'il est nul.
 *
 * Alors on ne tire pas les pièces, **on découpe la grille**. Un remplissage
 * complet par retour sur trace, et les morceaux obtenus sont le jeu. La
 * solution existe par construction, et l'enfant en trouvera peut-être une
 * autre.
 *
 * La fonction travaille sur un ensemble de cases quelconque, pas sur un
 * rectangle : c'est ce qui fait que les silhouettes ne coûtent presque rien —
 * un rectangle n'est qu'une silhouette pleine.
 */
import { normalise, piecesDeTaille } from "./formes.js";

const cle = (ligne, colonne) => `${ligne}.${colonne}`;

const VOISINS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Aucune zone vide n'est trop petite pour la plus petite pièce disponible.
 *
 * Sans cette coupe, les niveaux où le monomino a disparu partent en
 * exploration inutile : le retour sur trace ne découvrirait qu'au tout dernier
 * moment qu'un trou d'une case ne se bouchera jamais.
 */
const aucuneImpasse = (libres, tailleMin) => {
  if (tailleMin <= 1) return true;

  const restant = new Set(libres);

  while (restant.size) {
    const depart = restant.values().next().value;
    const pile = [depart];
    restant.delete(depart);
    let taille = 0;

    while (pile.length) {
      const [ligne, colonne] = pile.pop().split(".").map(Number);
      taille += 1;

      for (const [dl, dc] of VOISINS) {
        const voisin = cle(ligne + dl, colonne + dc);
        if (!restant.has(voisin)) continue;

        restant.delete(voisin);
        pile.push(voisin);
      }
    }

    if (taille < tailleMin) return false;
  }

  return true;
};

/**
 * L'ordre d'essai des pièces, penché vers les grandes.
 *
 * Un tirage uniforme finit en pluie de miettes : le hasard pondéré par la
 * taille garde de vraies pièces sans jamais exclure les petites.
 */
const parTailleDecroissanteAuHasard = (candidats) =>
  candidats
    .map((candidat) => ({ candidat, poids: Math.random() * candidat.taille }))
    .sort((a, b) => b.poids - a.poids)
    .map(({ candidat }) => candidat);

/** Un découpage complet, ou null si la région résiste. */
const unDecoupage = (cases, candidats, tailleMin) => {
  const libres = new Set(cases.map(([ligne, colonne]) => cle(ligne, colonne)));
  const morceaux = [];

  const premiereLibre = () => cases.find(([ligne, colonne]) => libres.has(cle(ligne, colonne)));

  const remplit = () => {
    const cible = premiereLibre();
    if (!cible) return true;

    for (const { nom, orientation } of parTailleDecroissanteAuHasard(candidats)) {
      /*
       * Une seule pose est possible : la première case de la pièce dans
       * l'ordre de lecture doit couvrir la première case libre. Toute autre
       * pose placerait une case de la pièce plus haut ou plus à gauche, donc
       * sur une case déjà prise.
       */
      const decalage = orientation[0][1];
      const pose = orientation.map(([ligne, colonne]) => [cible[0] + ligne, cible[1] + colonne - decalage]);

      if (!pose.every(([ligne, colonne]) => libres.has(cle(ligne, colonne)))) continue;

      pose.forEach(([ligne, colonne]) => libres.delete(cle(ligne, colonne)));

      if (aucuneImpasse(libres, tailleMin) && remplit()) {
        morceaux.push({ nom, cellules: pose });
        return true;
      }

      pose.forEach(([ligne, colonne]) => libres.add(cle(ligne, colonne)));
    }

    return false;
  };

  return remplit() ? morceaux.reverse() : null;
};

/**
 * Découpe une région en pièces jouables.
 *
 * Plusieurs découpages sont tentés et le moins émietté l'emporte : c'est moins
 * coûteux qu'un quota à respecter, et ça ne peut pas échouer sur un caprice du
 * hasard.
 *
 * @param {number[][]} cases la région à paver, dans l'ordre de lecture
 * @param {{tailleMin: number, tailleMax: number, tentatives?: number}} contraintes
 * @returns {{nom: string, cellules: number[][]}[] | null}
 */
export const decoupe = (cases, { tailleMin, tailleMax, tentatives = 12 }) => {
  const candidats = piecesDeTaille(tailleMin, tailleMax).flatMap((piece) =>
    piece.orientations.map((orientation) => ({ nom: piece.nom, taille: piece.taille, orientation }))
  );

  if (!candidats.length) return null;

  /*
   * Quand les tailles autorisées se touchent — 4 et 5 par exemple — aucune
   * pièce n'est une miette : la plus petite est une vraie pièce, et chercher à
   * la fuir ferait tourner douze découpages pour rien.
   */
  const emiettable = tailleMax - tailleMin >= 2;

  let meilleur = null;

  for (let essai = 0; essai < tentatives; essai += 1) {
    const morceaux = unDecoupage(cases, candidats, tailleMin);
    if (!morceaux) continue;

    const miettes = morceaux.filter((morceau) => morceau.cellules.length === tailleMin).length;
    if (!meilleur || miettes < meilleur.miettes) meilleur = { morceaux, miettes };

    if (!emiettable || meilleur.miettes <= Math.floor(morceaux.length / 3)) break;
  }

  return meilleur?.morceaux ?? null;
};

/**
 * Découpe qui aboutit toujours, en desserrant la contrainte de taille plutôt
 * que de rendre la main sans grille. Une silhouette validée n'a jamais besoin
 * du filet, mais une grille absente serait un écran vide.
 */
export const decoupeSure = (cases, { tailleMin, tailleMax }) => {
  for (let plancher = tailleMin; plancher >= 1; plancher -= 1) {
    const morceaux = decoupe(cases, { tailleMin: plancher, tailleMax });
    if (morceaux) return morceaux;
  }

  return cases.map(([ligne, colonne]) => ({ nom: "le carré", cellules: [[ligne, colonne]] }));
};

/** La forme d'un morceau, ramenée en haut à gauche. */
export const formeDuMorceau = (morceau) => normalise(morceau.cellules);
