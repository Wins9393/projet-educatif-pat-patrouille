/**
 * Progression de l'enfant : réussites, séries et autocollants débloqués.
 *
 * Tout est conservé dans le navigateur, par profil, sans aucun envoi réseau.
 */
const CLE_STOCKAGE = "progression";

/** Paliers d'autocollants, atteints avec le nombre total de réussites. */
export const AUTOCOLLANTS = [
  { seuil: 1, emoji: "🌱", nom: "Première réussite" },
  { seuil: 5, emoji: "🍀", nom: "Cinq bonnes réponses" },
  { seuil: 10, emoji: "🥉", nom: "Dix bonnes réponses" },
  { seuil: 20, emoji: "🎈", nom: "Vingt bonnes réponses" },
  { seuil: 35, emoji: "🥈", nom: "Trente-cinq bonnes réponses" },
  { seuil: 50, emoji: "🎨", nom: "Cinquante bonnes réponses" },
  { seuil: 75, emoji: "🥇", nom: "Soixante-quinze bonnes réponses" },
  { seuil: 100, emoji: "🏆", nom: "Cent bonnes réponses" },
  { seuil: 150, emoji: "🚀", nom: "Cent cinquante bonnes réponses" },
  { seuil: 200, emoji: "👑", nom: "Deux cents bonnes réponses" },
];

const profilVierge = (nom) => ({
  nom,
  reussites: 0,
  erreurs: 0,
  serieEnCours: 0,
  meilleureSerie: 0,
  parJeu: {},
  /** Nombre de réussites par mot, pour repérer ce qui coince. */
  parMot: {},
});

const etatVierge = () => ({ profilActif: "Moi", profils: { Moi: profilVierge("Moi") } });

const lu = () => {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? "null");
    if (!brut?.profils) return etatVierge();
    return brut;
  } catch {
    return etatVierge();
  }
};

let etat = lu();

const sauve = () => {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
  window.dispatchEvent(new CustomEvent("progression-modifiee", { detail: profil() }));
};

export const profil = () => etat.profils[etat.profilActif] ?? profilVierge(etat.profilActif);

export const nomsDesProfils = () => Object.keys(etat.profils);

export const profilActif = () => etat.profilActif;

export const choisitLeProfil = (nom) => {
  if (!etat.profils[nom]) etat.profils[nom] = profilVierge(nom);

  etat.profilActif = nom;
  sauve();
};

export const supprimeLeProfil = (nom) => {
  if (Object.keys(etat.profils).length <= 1) return;

  delete etat.profils[nom];
  if (etat.profilActif === nom) etat.profilActif = Object.keys(etat.profils)[0];
  sauve();
};

/**
 * Enregistre une réponse.
 * @returns {{autocollantsDebloques: Array}} les récompenses obtenues à l'instant
 */
export const enregistre = (jeu, { reussi, mot = null }) => {
  const courant = profil();
  const avant = autocollantsObtenus(courant.reussites);

  courant.parJeu[jeu] ??= { reussites: 0, erreurs: 0 };

  if (reussi) {
    courant.reussites += 1;
    courant.parJeu[jeu].reussites += 1;
    // La série est conservée dans le profil : chaque mini-jeu étant une page
    // distincte, une variable en mémoire repartirait de zéro à chaque écran.
    courant.serieEnCours = (courant.serieEnCours ?? 0) + 1;
    courant.meilleureSerie = Math.max(courant.meilleureSerie, courant.serieEnCours);

    if (mot) {
      courant.parMot[mot] ??= { reussites: 0, erreurs: 0 };
      courant.parMot[mot].reussites += 1;
    }
  } else {
    courant.erreurs += 1;
    courant.parJeu[jeu].erreurs += 1;
    courant.serieEnCours = 0;

    if (mot) {
      courant.parMot[mot] ??= { reussites: 0, erreurs: 0 };
      courant.parMot[mot].erreurs += 1;
    }
  }

  etat.profils[etat.profilActif] = courant;
  sauve();

  const apres = autocollantsObtenus(courant.reussites);
  return { autocollantsDebloques: apres.slice(avant.length) };
};

export const autocollantsObtenus = (reussites = profil().reussites) =>
  AUTOCOLLANTS.filter((autocollant) => reussites >= autocollant.seuil);

export const prochainAutocollant = (reussites = profil().reussites) =>
  AUTOCOLLANTS.find((autocollant) => reussites < autocollant.seuil) ?? null;

export const serie = () => profil().serieEnCours ?? 0;

/** Mots les plus souvent ratés, pour l'écran parent. */
export const motsDifficiles = (limite = 5) =>
  Object.entries(profil().parMot)
    .filter(([, stats]) => stats.erreurs > 0)
    .sort((a, b) => b[1].erreurs - a[1].erreurs)
    .slice(0, limite)
    .map(([mot, stats]) => ({ mot, ...stats }));

export const remetAZero = () => {
  etat.profils[etat.profilActif] = profilVierge(etat.profilActif);
  sauve();
};
