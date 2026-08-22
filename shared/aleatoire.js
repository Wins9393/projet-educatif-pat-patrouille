/**
 * Utilitaires de tirage aléatoire partagés par les mini-jeux.
 *
 * Corrige deux défauts historiques des QCM :
 *  - la bonne réponse ne pouvait pas tomber sur la dernière case,
 *  - elle pouvait apparaître plusieurs fois parmi les leurres.
 */

export const entierAleatoire = (max) => Math.floor(Math.random() * max);

export const choisirAleatoire = (tableau) => tableau[entierAleatoire(tableau.length)];

/**
 * Construit une grille de QCM : la bonne réponse une seule fois, à une place
 * réellement aléatoire, complétée par des leurres tous distincts.
 *
 * @param {Array} pool toutes les réponses possibles
 * @param {*} bonneReponse la réponse attendue
 * @param {number} nombreDeCases taille de la grille à remplir
 * @returns {Array} la grille, bonne réponse comprise
 */
export const construitGrille = (pool, bonneReponse, nombreDeCases) => {
  const leurresPossibles = pool.filter((element) => element !== bonneReponse);
  const grille = [bonneReponse];

  while (grille.length < nombreDeCases && leurresPossibles.length) {
    const index = entierAleatoire(leurresPossibles.length);
    grille.push(leurresPossibles.splice(index, 1)[0]);
  }

  return melange(grille);
};

/** Mélange de Fisher-Yates : chaque case a la même chance d'accueillir la bonne réponse. */
export const melange = (tableau) => {
  const copie = [...tableau];

  for (let i = copie.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }

  return copie;
};
