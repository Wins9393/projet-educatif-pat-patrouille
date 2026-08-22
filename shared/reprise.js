/**
 * Reprise de la manche en cours après un rechargement.
 *
 * Un rechargement efface l'exercice : le mot à moitié écrit, les paires déjà
 * retournées, les jetons posés. Plutôt que d'essayer de l'empêcher — une page
 * ne peut que demander confirmation, et le système recharge de toute façon
 * quand il reprend de la mémoire — on le rend indolore : chaque coup écrit un
 * instantané, et l'écran repart d'où il s'était arrêté.
 *
 * Ça couvre du même geste le plantage, la batterie vide, et l'éviction des
 * applications web en arrière-plan, fréquente sur iPad — trois cas où personne
 * n'aurait rien pu demander à personne.
 */
import { reglages } from "./reglages.js";
import * as progression from "./progression.js";
import { themeActif } from "./themes.js";

const CLE = "manche-en-cours";

/**
 * Au-delà, on repart d'une manche neuve : retrouver un mot à moitié écrit
 * plusieurs heures après n'aide personne, et l'enfant a oublié où il en était.
 */
const FRAICHEUR = 2 * 60 * 60 * 1000;

/** Le contexte auquel une manche appartient : elle n'a de sens que dedans. */
const contexte = () => ({
  theme: themeActif().id,
  niveau: reglages().niveau,
  profil: progression.profilActif(),
});

const lu = () => {
  try {
    return JSON.parse(localStorage.getItem(CLE) ?? "null");
  } catch {
    return null;
  }
};

/**
 * Écrit l'instantané de la manche. À appeler après chaque coup.
 *
 * @param {string} jeu identifiant du mini-jeu
 * @param {object} etat de quoi reconstruire la manche, sérialisable
 */
export const sauvegarde = (jeu, etat) => {
  try {
    localStorage.setItem(CLE, JSON.stringify({ jeu, ...contexte(), quand: Date.now(), etat }));
  } catch {
    // Stockage plein ou refusé : la reprise est un confort, pas une exigence.
  }
};

/**
 * L'instantané à reprendre, ou `null` s'il n'y a rien de valable.
 *
 * On écarte tout ce qui ne correspond plus : un autre jeu, un univers ou un
 * niveau changés entre-temps, un autre enfant aux commandes, une manche trop
 * ancienne. Dans tous ces cas la manche sauvegardée n'a plus de sens.
 */
export const reprise = (jeu) => {
  const enregistre = lu();
  if (!enregistre || enregistre.jeu !== jeu) return null;
  if (Date.now() - enregistre.quand > FRAICHEUR) return null;

  const attendu = contexte();
  const memeContexte = Object.keys(attendu).every((cle) => enregistre[cle] === attendu[cle]);

  return memeContexte ? enregistre.etat : null;
};

/** La manche est finie ou abandonnée : plus rien à reprendre. */
export const oublie = (jeu) => {
  const enregistre = lu();
  if (enregistre && enregistre.jeu !== jeu) return;

  localStorage.removeItem(CLE);
};
