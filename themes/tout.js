/**
 * L'univers « Tout » : le vocabulaire de tous les autres, mélangé.
 *
 * Il n'a pas de liste de mots à lui. Il compose la sienne à partir du
 * catalogue, et suit donc les univers automatiquement : ajouter un mot à
 * Océan l'ajoute ici, sans rien à recopier.
 */

/**
 * On prend un mot dans chaque univers à tour de rôle, plutôt que de mettre
 * les univers bout à bout. La liste reste ainsi mêlée de bout en bout, même
 * si on n'en lit qu'un morceau.
 */
const enAlternance = (univers) => {
  const melange = [];
  const plusLong = Math.max(...univers.map((u) => u.items.length));

  for (let rang = 0; rang < plusLong; rang += 1) {
    for (const u of univers) {
      if (u.items[rang]) melange.push(u.items[rang]);
    }
  }

  return melange;
};

/**
 * Deux mots ne peuvent pas partager un visuel : en LIRE, deux images
 * identiques rendraient la question insoluble. On écarte donc un mot déjà
 * rencontré — PAPILLON est dans quatre univers — et un visuel déjà pris —
 * LAMPE et AMPOULE sont tous deux 💡.
 */
export const construitTout = (univers) => {
  const items = [];
  const motsVus = new Set();
  const visuelsVus = new Set();

  for (const item of enAlternance(univers)) {
    if (motsVus.has(item.mot) || visuelsVus.has(item.visuel)) continue;

    motsVus.add(item.mot);
    visuelsVus.add(item.visuel);
    items.push(item);
  }

  return {
    id: "tout",
    nom: "Tout",
    vignette: "🌈",
    rendu: "emoji",
    decor: "melange",
    couleurs: { fond: "#241c3f", fondClair: "#4e3f86", accent: "#ffcf70" },
    items,
    collecte: {
      objet: { visuel: "⭐", nom: "étoile", pluriel: "étoiles" },
      receptacle: { visuel: "🧺", nom: "le panier" },
    },
  };
};
