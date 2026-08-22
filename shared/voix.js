import { reglages, modifieUnReglage } from "./reglages.js";

/**
 * Énoncés lus à voix haute.
 *
 * La qualité des voix installées varie énormément d'un appareil à l'autre, et
 * les voix compressées sont difficiles à comprendre pour un enfant. On classe
 * donc les voix disponibles et on laisse le choix final à l'adulte.
 */

const supportee = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Voix françaises de mauvaise intelligibilité, à écarter par défaut. */
const A_EVITER = /compact|eloquence|novelty|whisper|zarvox|trinoids|bells|bad news|good news|bubbles|jester|organ|cellos|boing|bahh|albert|wobble|superstar/i;

/** Voix de synthèse récentes, nettement plus naturelles que les anciennes. */
const QUALITE_SUPERIEURE = /premium|enhanced|neural|natural|siri|google/i;

/** Voix expressives modernes d'Apple, préférables aux voix historiques. */
const EXPRESSIVES = /eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|jacques/i;

let disponibles = [];

const rafraichitLaListe = () => {
  if (!supportee()) return [];

  disponibles = speechSynthesis
    .getVoices()
    .filter((voix) => voix.lang?.toLowerCase().startsWith("fr"))
    .filter((voix) => !A_EVITER.test(voix.name))
    .sort((a, b) => note(b) - note(a));

  return disponibles;
};

/**
 * Score de préférence.
 *
 * La voix par défaut du système n'est pas favorisée : sur macOS il s'agit
 * d'une voix historique peu naturelle, difficile à suivre pour un enfant.
 */
const note = (voix) => {
  let score = 0;

  if (QUALITE_SUPERIEURE.test(voix.name)) score += 12;
  if (EXPRESSIVES.test(voix.name)) score += 6;
  if (voix.lang === "fr-FR") score += 3;
  if (voix.localService) score += 1;

  return score;
};

if (supportee()) {
  rafraichitLaListe();
  speechSynthesis.addEventListener("voiceschanged", rafraichitLaListe);
}

export const voixDisponibles = () => (disponibles.length ? disponibles : rafraichitLaListe());

export const voixChoisie = () => {
  const liste = voixDisponibles();
  if (!liste.length) return null;

  return liste.find((voix) => voix.voiceURI === reglages().voixURI) ?? liste[0];
};

export const choisitLaVoix = (voiceURI) => modifieUnReglage("voixURI", voiceURI);

export const prononce = (texte, { interrompt = true, debit = null } = {}) => {
  if (!texte || !reglages().voix || !supportee()) return;

  if (interrompt) speechSynthesis.cancel();

  const enonce = new SpeechSynthesisUtterance(String(texte));
  const voix = voixChoisie();

  if (voix) {
    enonce.voice = voix;
    enonce.lang = voix.lang;
  } else {
    enonce.lang = "fr-FR";
  }

  // Un débit lent laisse à l'enfant le temps de distinguer les sons.
  enonce.rate = debit ?? reglages().debitVoix;
  enonce.pitch = 1;
  enonce.volume = 1;

  speechSynthesis.speak(enonce);
};

/** Prononce une lettre isolée, plus lentement et détachée. */
export const prononceUneLettre = (caractere) => prononce(caractere, { debit: Math.min(reglages().debitVoix, 0.7) });

/** Épelle un mot, puis le prononce en entier. */
export const epelle = (mot, affichage = mot) => {
  if (!reglages().voix || !supportee()) return;

  speechSynthesis.cancel();

  [...mot].forEach((caractere) => prononce(caractere, { interrompt: false, debit: 0.6 }));
  prononce(affichage, { interrompt: false });
};

export const laVoixEstDisponible = () => supportee();

export const arreteDeParler = () => {
  if (supportee()) speechSynthesis.cancel();
};
