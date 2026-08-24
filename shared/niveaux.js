/**
 * Niveaux de difficulté, partagés par les six mini-jeux.
 *
 * La progression suit celle de la maternelle vers le CP : on commence par des
 * mots très courts et des quantités manipulables, puis on allonge les mots et
 * on passe du dénombrement concret au calcul abstrait.
 */

export const NIVEAUX = [
  {
    id: 1,
    nom: "Découverte",
    emoji: "🌱",
    age: "3-4 ans",
    /** Longueur maximale des mots proposés en LIRE et ÉCRIRE. */
    longueurMax: 4,
    /**
     * En ÉCRIRE, le mot est-il donné — écrit sous l'image et prononcé — ou
     * l'enfant doit-il le déduire de l'image seule ?
     */
    motDonne: true,
    /**
     * Et la lettre à chercher, le 🔊 la dicte-t-il ? La dicter transforme
     * l'exercice en suite d'instructions : l'enfant n'a plus qu'à obéir, sans
     * jamais épeler. Aux grands niveaux, le 🔊 ne souffle que le mot.
     */
    lettreDictee: true,
    /** Quantité maximale à dénombrer en COMPTER. */
    quantiteMax: 5,
    /** Nombre de paires à retrouver en MEMORY. */
    paires: 3,
    /**
     * Le plateau du PUZZLE : sa taille, et les pièces qui serviront à le
     * découper. La difficulté monte sur deux axes à la fois — la grille
     * s'agrandit et les petites pièces disparaissent. Le monomino, qui
     * bouche n'importe quel trou, n'existe qu'ici.
     *
     * `silhouettes` donne la fourchette de cases des formes jouables, ou
     * false pour rester au rectangle : en dessous d'une quinzaine de cases,
     * un bateau n'est qu'une tache.
     */
    puzzle: { lignes: 3, colonnes: 3, tailleMin: 1, tailleMax: 3, silhouettes: false },
    /** Opérations autorisées en CALCULER. */
    operations: ["collecte"],
    /** Plus grand nombre manipulé en CALCULER. */
    nombreMax: 5,
  },
  {
    id: 2,
    nom: "Apprenti",
    emoji: "🍀",
    age: "4-5 ans",
    longueurMax: 5,
    motDonne: true,
    lettreDictee: true,
    quantiteMax: 9,
    paires: 4,
    puzzle: { lignes: 4, colonnes: 4, tailleMin: 2, tailleMax: 4, silhouettes: false },
    operations: ["collecte"],
    nombreMax: 9,
  },
  {
    id: 3,
    nom: "Explorateur",
    emoji: "🧭",
    age: "5-6 ans",
    longueurMax: 7,
    motDonne: true,
    lettreDictee: true,
    quantiteMax: 12,
    paires: 6,
    puzzle: { lignes: 5, colonnes: 4, tailleMin: 3, tailleMax: 4, silhouettes: [15, 22] },
    operations: ["addition"],
    nombreMax: 10,
  },
  {
    id: 4,
    nom: "Aventurier",
    emoji: "🎯",
    age: "6-7 ans",
    longueurMax: 9,
    motDonne: false,
    lettreDictee: false,
    quantiteMax: 16,
    paires: 8,
    puzzle: { lignes: 5, colonnes: 5, tailleMin: 3, tailleMax: 5, silhouettes: [23, 29] },
    operations: ["addition", "soustraction"],
    nombreMax: 20,
  },
  {
    id: 5,
    nom: "Champion",
    emoji: "🏆",
    age: "7 ans et +",
    longueurMax: 99,
    motDonne: false,
    lettreDictee: false,
    quantiteMax: 20,
    paires: 10,
    puzzle: { lignes: 6, colonnes: 6, tailleMin: 4, tailleMax: 5, silhouettes: [30, 40] },
    operations: ["addition", "soustraction", "multiplication", "division"],
    nombreMax: 50,
  },
];

export const niveauParId = (id) => NIVEAUX.find((niveau) => niveau.id === Number(id)) ?? NIVEAUX[0];

/**
 * Nombre minimal de mots par manche : en dessous, l'enfant retombe sans cesse
 * sur les mêmes et le jeu perd tout intérêt.
 */
const VARIETE_MINIMALE = 8;

/**
 * Mots du thème compatibles avec le niveau.
 *
 * Les thèmes ne comptent pas tous assez de mots très courts. Plutôt que de
 * renvoyer une poignée de mots qui tourneraient en boucle, on complète avec
 * les plus courts disponibles jusqu'à obtenir une variété suffisante.
 */
export const motsDuNiveau = (items, niveau) => {
  const retenus = items.filter((item) => item.mot.length <= niveau.longueurMax);
  if (retenus.length >= VARIETE_MINIMALE) return retenus;

  const parLongueur = [...items].sort((a, b) => a.mot.length - b.mot.length);
  return parLongueur.slice(0, Math.min(items.length, VARIETE_MINIMALE));
};

/* ------------------------------------------------------------------ */
/* Génération des opérations de CALCULER                               */
/* ------------------------------------------------------------------ */

const entier = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const SIGNES = {
  addition: "+",
  soustraction: "−",
  multiplication: "×",
  division: "÷",
};

/**
 * Tire une opération adaptée au niveau.
 *
 * Les opérations sont construites pour tomber juste : la soustraction ne
 * descend jamais sous zéro et la division tombe toujours sur un entier.
 */
export const tireUneOperation = (niveau) => {
  const type = niveau.operations[entier(0, niveau.operations.length - 1)];

  if (type === "collecte") {
    return { type, resultat: entier(1, niveau.nombreMax) };
  }

  // Les opérandes restent modestes même à haut niveau : l'objectif est le
  // calcul mental, pas la manipulation de grands nombres.
  const plafondOperande = Math.min(niveau.nombreMax, 12);

  if (type === "addition") {
    const a = entier(1, plafondOperande);
    const b = entier(1, Math.min(plafondOperande, niveau.nombreMax - a));
    return { type, a, b, signe: SIGNES.addition, resultat: a + b };
  }

  if (type === "soustraction") {
    const a = entier(2, Math.min(niveau.nombreMax, 20));
    const b = entier(1, a);
    return { type, a, b, signe: SIGNES.soustraction, resultat: a - b };
  }

  if (type === "multiplication") {
    const a = entier(2, 5);
    const b = entier(2, Math.max(2, Math.min(10, Math.floor(niveau.nombreMax / a))));
    return { type, a, b, signe: SIGNES.multiplication, resultat: a * b };
  }

  // Division : on part du résultat pour garantir un quotient entier.
  const b = entier(2, 5);
  const resultat = entier(1, Math.max(2, Math.floor(niveau.nombreMax / b)));
  return { type: "division", a: b * resultat, b, signe: SIGNES.division, resultat };
};

/** Énoncé lisible et prononçable d'une opération. */
export const enonce = (operation) => {
  const mots = {
    "+": "plus",
    "−": "moins",
    "×": "fois",
    "÷": "divisé par",
  };

  if (operation.type === "collecte") return null;

  return {
    ecrit: `${operation.a} ${operation.signe} ${operation.b}`,
    parle: `${operation.a} ${mots[operation.signe]} ${operation.b}`,
  };
};

/** Réponses fausses plausibles : proches du bon résultat, jamais négatives. */
export const leurresNumeriques = (resultat, nombre, maximum) => {
  const candidats = new Set();
  let ecart = 1;

  while (candidats.size < nombre * 3 && ecart <= 12) {
    if (resultat - ecart >= 0) candidats.add(resultat - ecart);
    if (resultat + ecart <= maximum + 10) candidats.add(resultat + ecart);
    ecart += 1;
  }

  return [...candidats];
};
