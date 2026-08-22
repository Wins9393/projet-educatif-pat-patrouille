import espace from "../themes/espace.js";
import ocean from "../themes/ocean.js";
import dinosaures from "../themes/dinosaures.js";
import robots from "../themes/robots.js";
import princesses from "../themes/princesses.js";
import ferme from "../themes/ferme.js";
import jungle from "../themes/jungle.js";
import fruits from "../themes/fruits.js";
import vehicules from "../themes/vehicules.js";
import maison from "../themes/maison.js";
import nature from "../themes/nature.js";
import sports from "../themes/sports.js";
import musique from "../themes/musique.js";
import meteo from "../themes/meteo.js";
import fetes from "../themes/fetes.js";
import animaux from "../themes/animaux.js";
import { construitTout } from "../themes/tout.js";

const CLE_STOCKAGE = "theme-actif";

const univers = [
  espace,
  ocean,
  dinosaures,
  robots,
  princesses,
  ferme,
  jungle,
  fruits,
  vehicules,
  maison,
  nature,
  sports,
  musique,
  meteo,
  fetes,
  animaux,
];

/**
 * Le pack sous licence n'est pas publié : il est chargé s'il est présent sur
 * le disque, et simplement ignoré s'il ne l'est pas (voir .gitignore).
 *
 * Sur une installation sans ce pack, le navigateur journalise un 404 pour ce
 * fichier. C'est attendu et sans effet : le catalogue se limite alors aux
 * thèmes libres.
 */
try {
  const packLocal = await import("../themes/pat-patrouille.js");
  univers.unshift(packLocal.default);
} catch {
  // Pack local absent : le jeu fonctionne avec les seuls thèmes libres.
}

/**
 * « Tout » ouvre la liste : c'est l'univers par défaut, et le plus varié.
 * Il est construit en dernier pour englober le pack local quand il est là.
 */
export const themes = [construitTout(univers), ...univers];

export const themeParId = (id) => themes.find((theme) => theme.id === id);

export const themeActif = () => themeParId(localStorage.getItem(CLE_STOCKAGE)) ?? themes[0];

export const choisitLeTheme = (id) => {
  if (!themeParId(id)) return;
  localStorage.setItem(CLE_STOCKAGE, id);
};

/**
 * Thème tiré au sort parmi les autres, pour le bouton « surprise ».
 *
 * « Tout » en est écarté : le bouton promet un changement de décor, et le
 * mélange est déjà à portée de doigt en tête de liste.
 */
export const themeSuivant = () => {
  const actif = themeActif();
  const autres = themes.filter((theme) => theme.id !== actif.id && theme.id !== "tout");
  return autres[Math.floor(Math.random() * autres.length)] ?? actif;
};
