/**
 * Réglages transverses, partagés par tous les mini-jeux et conservés d'une
 * session à l'autre.
 */
const CLE_STOCKAGE = "reglages";

const DEFAUTS = {
  /** Nombre de réponses proposées : 2 (facile), 3, 4 ou 5 (difficile). */
  nombreDeChoix: 4,
  /** Niveau de difficulté, de 1 (découverte) à 5 (champion). */
  niveau: 1,
  /** Casse des lettres affichées : "majuscules" ou "minuscules". */
  casse: "majuscules",
  /** Énoncés lus à voix haute. */
  voix: true,
  /** Voix retenue (voiceURI) ; vide = la mieux notée de l'appareil. */
  voixURI: "",
  /** Débit de lecture : lent par défaut, pour être bien compris. */
  debitVoix: 0.8,
  /** Effets sonores. */
  sons: true,
  /** Confettis et animations de victoire. */
  animations: true,
};

const lus = () => {
  try {
    return { ...DEFAUTS, ...JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? "{}") };
  } catch {
    return { ...DEFAUTS };
  }
};

let courants = lus();

export const reglages = () => courants;

export const modifieUnReglage = (nom, valeur) => {
  if (!(nom in DEFAUTS)) return;

  courants = { ...courants, [nom]: valeur };
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(courants));
  window.dispatchEvent(new CustomEvent("reglages-modifies", { detail: courants }));
};

export const reglagesParDefaut = () => ({ ...DEFAUTS });
