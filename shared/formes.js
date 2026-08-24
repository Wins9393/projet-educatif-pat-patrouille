/**
 * Vocabulaire géométrique du PUZZLE : les pièces et leurs rotations.
 *
 * Une forme est une liste de cases `[ligne, colonne]`, ramenée en haut à
 * gauche et rangée dans l'ordre de lecture. Deux formes identiques case à case
 * ont donc la même clé — c'est ce qui permet de reconnaître qu'une rotation
 * retombe sur elle-même, et de ne proposer à l'enfant que des orientations
 * réellement différentes.
 *
 * Les pièces tournent, elles ne se retournent jamais. Le bois se retourne, pas
 * un écran : distinguer un L de son miroir par la pensée est un exercice d'un
 * autre âge. La conséquence est assumée — L et J sont deux pièces distinctes,
 * S et Z aussi — et le découpage puise dans exactement le même jeu de pièces
 * que celui qu'on remet à l'enfant.
 */

/** Ramène une forme en haut à gauche et la range dans l'ordre de lecture. */
export const normalise = (cellules) => {
  const ligneMin = Math.min(...cellules.map(([ligne]) => ligne));
  const colonneMin = Math.min(...cellules.map(([, colonne]) => colonne));

  return cellules
    .map(([ligne, colonne]) => [ligne - ligneMin, colonne - colonneMin])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

/** Signature d'une forme normalisée, pour comparer deux orientations. */
export const cle = (cellules) => cellules.map(([ligne, colonne]) => `${ligne}.${colonne}`).join(" ");

/** Quart de tour dans le sens des aiguilles : (ligne, colonne) → (colonne, −ligne). */
export const pivote = (cellules) => normalise(cellules.map(([ligne, colonne]) => [colonne, -ligne]));

/**
 * Les orientations distinctes d'une forme, de une (le carré) à quatre (le L).
 *
 * L'interface s'en sert directement : sur une pièce à orientation unique, le
 * bouton ↻ est masqué plutôt que présent et sans effet.
 */
export const rotations = (cellules) => {
  const vues = new Map();
  let courante = normalise(cellules);

  for (let quart = 0; quart < 4; quart += 1) {
    vues.set(cle(courante), courante);
    courante = pivote(courante);
  }

  return [...vues.values()];
};

/** Lit une forme dessinée en toutes lettres : `X` une case, `.` du vide. */
export const dessine = (lignes) => {
  const cellules = [];

  lignes.forEach((ligne, numero) => {
    [...ligne].forEach((caractere, colonne) => {
      if (caractere !== ".") cellules.push([numero, colonne]);
    });
  });

  return normalise(cellules);
};

const CATALOGUE = [
  { nom: "le carré", dessin: ["X"] },
  { nom: "le domino", dessin: ["XX"] },
  { nom: "la barre", dessin: ["XXX"] },
  { nom: "le coin", dessin: ["X.", "XX"] },
  { nom: "le carré", dessin: ["XX", "XX"] },
  { nom: "la barre", dessin: ["XXXX"] },
  { nom: "le T", dessin: ["XXX", ".X."] },
  { nom: "le L", dessin: ["X.", "X.", "XX"] },
  { nom: "le J", dessin: [".X", ".X", "XX"] },
  { nom: "le S", dessin: [".XX", "XX."] },
  { nom: "le Z", dessin: ["XX.", ".XX"] },
  { nom: "la grande barre", dessin: ["XXXXX"] },
  { nom: "le grand L", dessin: ["X.", "X.", "X.", "XX"] },
  { nom: "le grand J", dessin: [".X", ".X", ".X", "XX"] },
  { nom: "le V", dessin: ["X..", "X..", "XXX"] },
  { nom: "le grand T", dessin: ["XXX", ".X.", ".X."] },
  { nom: "le U", dessin: ["X.X", "XXX"] },
  { nom: "le P", dessin: ["XX", "XX", "X."] },
  { nom: "le grand Z", dessin: ["XX.", ".X.", ".XX"] },
];

export const PIECES = CATALOGUE.map(({ nom, dessin }) => {
  const cellules = dessine(dessin);
  return { nom, cellules, taille: cellules.length, orientations: rotations(cellules) };
});

export const piecesDeTaille = (min, max) => PIECES.filter((piece) => piece.taille >= min && piece.taille <= max);
