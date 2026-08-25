import { construitLaBarre, construitLeSelecteurDeThemes } from "./shared/interface.js";
import * as progression from "./shared/progression.js";
import { applique } from "./shared/rendu.js";
import { themeActif, themeSuivant, choisitLeTheme } from "./shared/themes.js";
import { niveauParId } from "./shared/niveaux.js";
import { reglages } from "./shared/reglages.js";
import { prononce } from "./shared/voix.js";

const JEUX = [
  { id: "ecrire", nom: "ÉCRIRE", icone: "✏️", desc: "Retrouve les lettres du mot", lien: "views/ecrire.html" },
  { id: "lire", nom: "LIRE", icone: "📖", desc: "Associe le mot à son image", lien: "views/lire.html" },
  { id: "compter", nom: "COMPTER", icone: "🔢", desc: "Combien y en a-t-il ?", lien: "views/compter.html" },
  { id: "calculer", nom: "CALCULER", icone: "➕", desc: "Compose le bon total", lien: "views/calculer.html" },
  { id: "memory", nom: "MEMORY", icone: "🃏", desc: "Retrouve les paires", lien: "views/memory.html" },
  { id: "puzzle", nom: "PUZZLE", icone: "🧩", desc: "Remplis la grille avec les formes", lien: "views/puzzle.html" },
  { id: "parking", nom: "PARKING", icone: "🚗", desc: "Fais sortir la voiture rouge", lien: "views/parking.html" },
];

const accueil = document.querySelector(".accueil");
const listeDesJeux = document.querySelector(".jeux");
const zoneThemes = document.querySelector(".selecteur-themes");
const zoneAutocollants = document.querySelector(".autocollants");
const jauge = document.querySelector(".progression-barre__jauge");
const legende = document.querySelector(".progression-legende");
const titre = document.querySelector(".accueil__titre");

const construitLesJeux = () => {
  listeDesJeux.innerHTML = "";
  const stats = progression.profil().parJeu;

  JEUX.forEach((jeu) => {
    const carte = document.createElement("a");
    carte.className = "jeu";
    carte.href = jeu.lien;

    const reussites = stats[jeu.id]?.reussites ?? 0;

    carte.innerHTML = `
      <span class="jeu__icone" aria-hidden="true">${jeu.icone}</span>
      <span class="jeu__nom">${jeu.nom}</span>
      <span class="jeu__desc">${jeu.desc}</span>
      <span class="jeu__compteur">${reussites > 0 ? `⭐ ${reussites}` : "à découvrir"}</span>
    `;

    carte.addEventListener("pointerenter", () => prononce(jeu.nom));
    listeDesJeux.append(carte);
  });
};

const construitLesAutocollants = () => {
  zoneAutocollants.innerHTML = "";
  const obtenus = progression.autocollantsObtenus();

  progression.AUTOCOLLANTS.forEach((autocollant) => {
    const debloque = obtenus.includes(autocollant);
    const jeton = document.createElement("span");

    jeton.className = debloque ? "autocollant" : "autocollant autocollant--verrouille";
    jeton.textContent = autocollant.emoji;
    jeton.setAttribute("role", "img");
    jeton.setAttribute(
      "aria-label",
      debloque ? `${autocollant.nom}, débloqué` : `${autocollant.nom}, à débloquer à ${autocollant.seuil} réussites`
    );
    jeton.title = jeton.getAttribute("aria-label");

    zoneAutocollants.append(jeton);
  });

  const reussites = progression.profil().reussites;
  const prochain = progression.prochainAutocollant();

  if (prochain) {
    const precedent = progression.autocollantsObtenus().at(-1)?.seuil ?? 0;
    const avance = ((reussites - precedent) / (prochain.seuil - precedent)) * 100;

    jauge.style.width = `${Math.max(0, Math.min(100, avance))}%`;
    legende.textContent = `Encore ${prochain.seuil - reussites} réussite${prochain.seuil - reussites > 1 ? "s" : ""} pour débloquer ${prochain.emoji}`;
  } else {
    jauge.style.width = "100%";
    legende.textContent = "Tous les autocollants sont débloqués. Bravo !";
  }
};

const rafraichit = () => {
  const theme = themeActif();
  applique(theme);

  titre.textContent = "Les Petits Mondes";
  document.querySelector(".accueil__sous-titre").textContent = `Univers : ${theme.nom} ${theme.vignette}`;

  construitLesJeux();
  construitLesAutocollants();
};

accueil.prepend(construitLaBarre({ niveau: niveauParId(reglages().niveau) }));
zoneThemes.append(construitLeSelecteurDeThemes(rafraichit));

document.querySelector('[data-action="theme-surprise"]').addEventListener("click", () => {
  const theme = themeSuivant();
  choisitLeTheme(theme.id);

  zoneThemes.innerHTML = "";
  zoneThemes.append(construitLeSelecteurDeThemes(rafraichit));

  rafraichit();
  prononce(`Univers ${theme.nom}`);
});

window.addEventListener("progression-modifiee", rafraichit);
window.addEventListener("reglages-modifies", rafraichit);

rafraichit();

/**
 * Le catalogue de thèmes utilise un await de plus haut niveau : ce module
 * s'exécute donc après l'événement load. Attendre cet événement ne
 * déclencherait jamais l'enregistrement, on teste l'état du document.
 */
const activeLeModeHorsLigne = () => {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("service-worker.js").catch(() => {
    // Hors ligne indisponible : le jeu fonctionne quand même en ligne.
  });
};

if (document.readyState === "complete") {
  activeLeModeHorsLigne();
} else {
  window.addEventListener("load", activeLeModeHorsLigne, { once: true });
}
