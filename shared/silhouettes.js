/**
 * Les silhouettes du PUZZLE : ce qui sépare « remplir un rectangle » du jeu de
 * bois dont il s'inspire.
 *
 * Un masque se dessine en toutes lettres, et se relit d'un coup d'œil. La
 * découpe travaillant sur un ensemble de cases quelconque, une silhouette ne
 * lui coûte rien de plus qu'un rectangle — un rectangle n'est qu'une
 * silhouette pleine.
 *
 * Deux règles ont guidé le catalogue :
 *
 *  - **Rien en dessous d'une quinzaine de cases.** Un bateau de neuf cases est
 *    une tache. Les deux premiers niveaux jouent donc en rectangle, et ce
 *    n'est pas une facilité d'auteur : c'est une question de lisibilité.
 *  - **Chaque masque est vérifié à la fabrication**, jamais à l'exécution. Un
 *    isthme d'une seule case tue le pavage par pentominos et ne se voit pas à
 *    l'œil nu ; le script de contrôle, lui, le trouve.
 */
import { dessine } from "./formes.js";

const CATALOGUE = [
  /* Petites silhouettes : une quinzaine à une vingtaine de cases. */
  { nom: "le cœur", masque: ["XX.XX", "XXXXX", "XXXXX", ".XXX.", "..X.."] },
  { nom: "la maison", masque: ["..X..", ".XXX.", "XXXXX", "XXXXX", "XXXXX"], univers: ["maison"] },
  { nom: "la croix", masque: ["..XX..", "..XX..", "XXXXXX", "XXXXXX", "..XX..", "..XX.."] },
  { nom: "le bateau", masque: ["..X..", "..XX.", "XXXXX", "XXXXX", ".XXX."], univers: ["ocean"] },
  { nom: "la flèche", masque: ["..XX..", ".XXXX.", "XXXXXX", "..XX..", "..XX..", "..XX.."] },
  { nom: "le poisson", masque: [".XXX.X", "XXXXXX", "XXXXXX", ".XXX.X"], univers: ["ocean"] },
  { nom: "le papillon", masque: ["XX.XX", "XXXXX", ".XXX.", "XXXXX", "XX.XX"], univers: ["jungle", "nature"] },
  { nom: "le sapin", masque: ["..X..", ".XXX.", "XXXXX", ".XXX.", "XXXXX", "..X.."], univers: ["nature", "fetes"] },
  { nom: "l'étoile", masque: ["..X..", "XXXXX", ".XXX.", "XXXXX", "X...X"], univers: ["espace"] },
  { nom: "le chat", masque: ["X...X", "XXXXX", "XXXXX", "XXXXX", ".X.X."], univers: ["animaux", "ferme"] },
  { nom: "la fusée", masque: ["..X..", ".XXX.", ".XXX.", ".XXX.", "XXXXX", "X.X.X"], univers: ["espace"] },

  /* Moyennes : de vingt-trois à vingt-neuf cases. */
  { nom: "la maison", masque: ["...X...", "..XXX..", ".XXXXX.", "XXXXXXX", ".XXXXX.", ".XXXXX."], univers: ["maison"] },
  { nom: "le cœur", masque: [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."] },
  { nom: "l'étoile", masque: ["...X...", "XXXXXXX", ".XXXXX.", "..XXX..", ".XXXXX.", "XX...XX"], univers: ["espace"] },
  { nom: "le papillon", masque: ["XX...XX", "XXX.XXX", ".XXXXX.", "XXX.XXX", "XX...XX"], univers: ["jungle", "nature"] },
  { nom: "le chat", masque: ["X.....X", "XX...XX", "XXXXXXX", "XXXXXXX", "XXXXXXX", ".X...X."], univers: ["animaux", "ferme"] },
  { nom: "la voiture", masque: [".XXXX..", "XXXXXXX", "XXXXXXX", "XXXXXXX", ".X...X."], univers: ["vehicules"] },

  /* Grandes : une trentaine de cases et au-delà. */
  { nom: "la fusée", masque: ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", ".XXXX.", "XXXXXX", "X.XX.X"], univers: ["espace"] },
  { nom: "le sapin", masque: ["...X...", "..XXX..", ".XXXXX.", "..XXX..", ".XXXXX.", "XXXXXXX", "XXXXXXX", "...X..."], univers: ["nature", "fetes"] },
  { nom: "le château", masque: ["X.X.X.X", "XXXXXXX", "XXXXXXX", "XXXXXXX", "XXX.XXX"], univers: ["princesses"] },
  { nom: "la maison", masque: ["...X...", "..XXX..", ".XXXXX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", ".XXXXX."], univers: ["maison"] },
  { nom: "le cœur", masque: [".XX.XX.", "XXXXXXX", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."] },
];

export const SILHOUETTES = CATALOGUE.map(({ nom, masque, univers = [] }) => {
  const cellules = dessine(masque);

  return {
    nom,
    cellules,
    cases: cellules.length,
    lignes: Math.max(...cellules.map(([ligne]) => ligne)) + 1,
    colonnes: Math.max(...cellules.map(([, colonne]) => colonne)) + 1,
    univers,
  };
});

/**
 * Une silhouette du bon gabarit, avec une préférence pour l'univers en cours.
 *
 * La préférence n'est pas un monopole : un univers qui n'a qu'une silhouette à
 * lui la verrait sortir à toutes les manches. Une fois sur deux, le tirage
 * repart donc du catalogue entier.
 */
export const silhouettePour = ({ min, max, univers }) => {
  const gabarit = SILHOUETTES.filter((forme) => forme.cases >= min && forme.cases <= max);
  if (!gabarit.length) return null;

  const duTheme = gabarit.filter((forme) => forme.univers.includes(univers));
  const parmi = duTheme.length && Math.random() < 0.5 ? duTheme : gabarit;

  return parmi[Math.floor(Math.random() * parmi.length)];
};
