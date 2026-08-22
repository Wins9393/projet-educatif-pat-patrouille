import { reglages } from "./reglages.js";

/**
 * Sons de retour, synthétisés à la volée.
 *
 * Rien n'est téléchargé : les sons sont produits en Web Audio, ce qui évite
 * tout fichier sous licence et permet de les garder doux — un enfant se
 * trompe souvent, le son d'erreur ne doit jamais sonner comme une punition.
 */

let contexte = null;

const audio = () => {
  if (!contexte) {
    const Constructeur = window.AudioContext ?? window.webkitAudioContext;
    if (!Constructeur) return null;
    contexte = new Constructeur();
  }

  // Le navigateur suspend le contexte tant que l'utilisateur n'a pas agi.
  if (contexte.state === "suspended") contexte.resume();

  return contexte;
};

/**
 * Joue une note avec une attaque douce et une longue extinction : le timbre
 * obtenu évoque un xylophone plutôt qu'un bip.
 */
const note = (frequence, { debut = 0, duree = 0.35, volume = 0.22, forme = "sine" } = {}) => {
  const ctx = audio();
  if (!ctx) return;

  const depart = ctx.currentTime + debut;

  const oscillateur = ctx.createOscillator();
  oscillateur.type = forme;
  oscillateur.frequency.setValueAtTime(frequence, depart);

  // Une deuxième voix une octave au-dessus, très discrète, enrichit le timbre.
  const harmonique = ctx.createOscillator();
  harmonique.type = "sine";
  harmonique.frequency.setValueAtTime(frequence * 2, depart);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, depart);
  gain.gain.exponentialRampToValueAtTime(volume, depart + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, depart + duree);

  const gainHarmonique = ctx.createGain();
  gainHarmonique.gain.setValueAtTime(0.0001, depart);
  gainHarmonique.gain.exponentialRampToValueAtTime(volume * 0.18, depart + 0.02);
  gainHarmonique.gain.exponentialRampToValueAtTime(0.0001, depart + duree * 0.6);

  oscillateur.connect(gain).connect(ctx.destination);
  harmonique.connect(gainHarmonique).connect(ctx.destination);

  oscillateur.start(depart);
  oscillateur.stop(depart + duree + 0.05);
  harmonique.start(depart);
  harmonique.stop(depart + duree + 0.05);
};

const melodie = (notes) => {
  if (!reglages().sons) return;

  notes.forEach(([frequence, debut, duree, volume]) =>
    note(frequence, { debut, duree, volume })
  );
};

/* Gamme de do majeur, en hertz. */
const DO = 523.25;
const RE = 587.33;
const MI = 659.25;
const SOL = 783.99;
const LA = 880.0;
const DO_AIGU = 1046.5;

/** Bonne réponse : deux notes qui montent, brèves et claires. */
export const sonJuste = () => melodie([
  [MI, 0, 0.18, 0.2],
  [SOL, 0.09, 0.3, 0.2],
]);

/** Erreur : deux notes qui descendent, douces et sans agressivité. */
export const sonFaux = () => melodie([
  [RE, 0, 0.16, 0.13],
  [DO, 0.1, 0.26, 0.12],
]);

/** Victoire : un arpège ascendant qui se termine en l'air. */
export const sonVictoire = () => melodie([
  [DO, 0, 0.2, 0.2],
  [MI, 0.1, 0.2, 0.2],
  [SOL, 0.2, 0.22, 0.2],
  [DO_AIGU, 0.32, 0.55, 0.22],
  [LA, 0.34, 0.5, 0.1],
]);

/** Récompense débloquée : petit carillon supplémentaire. */
export const sonRecompense = () => melodie([
  [SOL, 0, 0.16, 0.16],
  [DO_AIGU, 0.12, 0.18, 0.16],
  [MI * 2, 0.24, 0.45, 0.18],
]);

/** Retour tactile discret sur un dépôt réussi. */
export const sonPose = () => melodie([[LA, 0, 0.12, 0.1]]);
