import { asset, lettre as cheminDeLettre } from "./chemins.js";
import { reglages } from "./reglages.js";

/**
 * Fabrique les éléments visuels des mini-jeux.
 *
 * Toute la différence entre un thème illustré et un thème en emoji est
 * concentrée ici : les jeux appellent les mêmes fonctions dans les deux cas.
 */

/**
 * Les lettres restent du texte stylé, sauf pour un thème qui fournit ses
 * propres images d'alphabet.
 */
const lettresEnImage = (theme) => (theme.lettres ?? "texte") === "image";

/**
 * Un visuel est une image dès qu'il ressemble à un chemin de fichier, et un
 * emoji sinon. Cette détection au cas par cas permet d'illustrer un thème mot
 * par mot, sans avoir à le basculer d'un bloc.
 */
const estUnFichier = (visuel) => /\.(svg|png|jpe?g|webp|gif)$/i.test(String(visuel));

/** Image d'un item, ou emoji géant selon ce que le thème fournit. */
export const creeVisuel = (theme, item, ...classes) => {
  if (!estUnFichier(item.visuel)) {
    const span = document.createElement("span");
    span.classList.add("visuel-emoji", ...classes);
    span.textContent = item.visuel;
    span.setAttribute("role", "img");
    span.setAttribute("aria-label", item.affichage ?? item.nom ?? "");
    return span;
  }

  const img = document.createElement("img");
  img.classList.add("visuel-image", ...classes);
  img.src = asset(item.visuel);
  img.alt = item.affichage ?? item.nom ?? "";
  img.draggable = false;
  return img;
};

/** Une lettre ou un chiffre : image du pack illustré, ou caractère stylé. */
export const creeCaractere = (theme, caractere, ...classes) => {
  const affiche = appliqueLaCasse(caractere);

  if (!lettresEnImage(theme)) {
    const span = document.createElement("span");
    span.classList.add("caractere-texte", ...classes);
    span.textContent = affiche;
    return span;
  }

  const img = document.createElement("img");
  img.classList.add(...classes);
  img.src = cheminDeLettre(String(caractere).toLowerCase(), theme.dossierLettres);
  img.alt = affiche;
  img.draggable = false;
  return img;
};

export const appliqueLaCasse = (caractere) => {
  const texte = String(caractere);
  if (!Number.isNaN(Number(texte))) return texte;

  return reglages().casse === "minuscules" ? texte.toLowerCase() : texte.toUpperCase();
};

/** Applique la palette et le décor animé du thème à la page. */
export const applique = (theme) => {
  const racine = document.documentElement;

  racine.dataset.theme = theme.id;
  racine.dataset.rendu = theme.rendu;

  if (theme.couleurs) {
    for (const [nom, valeur] of Object.entries(theme.couleurs)) {
      racine.style.setProperty(`--couleur-${nom}`, valeur);
    }
  }

  poseLeDecor(theme);
};

/** Fond animé du thème, en une seule couche réutilisée d'un thème à l'autre. */
const poseLeDecor = (theme) => {
  let decor = document.querySelector(".decor");

  if (!decor) {
    decor = document.createElement("div");
    decor.className = "decor";
    decor.setAttribute("aria-hidden", "true");
    document.body.prepend(decor);
  }

  decor.className = `decor decor--${theme.decor ?? "douceur"}`;
};
