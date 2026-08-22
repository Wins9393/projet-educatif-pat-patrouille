import { reglages } from "./reglages.js";
import * as progression from "./progression.js";
import { celebre, construitLaBarre } from "./interface.js";
import { applique } from "./rendu.js";
import { themeActif } from "./themes.js";
import { niveauParId } from "./niveaux.js";
import { prononce } from "./voix.js";
import { sonJuste, sonFaux, sonVictoire, sonRecompense } from "./sons.js";
import { lanceLesConfettis, arreteLesConfettis, prepareLeConteneur } from "./confettis.js";

export { sonJuste, sonFaux, sonVictoire, sonRecompense } from "./sons.js";
export { lanceLesConfettis, arreteLesConfettis } from "./confettis.js";

/**
 * Installe le décor commun d'un écran de jeu : palette et fond du thème,
 * barre supérieure, conteneur de confettis.
 *
 * @returns {{theme: object, niveau: object}} le contexte de la partie
 */
export const prepareLaPage = ({ titre }) => {
  const theme = themeActif();
  const niveau = niveauParId(reglages().niveau);

  applique(theme);
  prepareLeConteneur();

  const page = document.querySelector(".jeu-page");
  page.prepend(
    construitLaBarre({
      titre: `${titre} · ${theme.nom}`,
      retour: "../index.html",
      niveau,
    })
  );

  return { theme, niveau };
};

/**
 * À appeler au début de chaque manche : coupe les confettis et la voix
 * hérités de la manche précédente.
 */
export const demarreUneManche = () => {
  arreteLesConfettis();
};

/** Enregistre la réussite, félicite l'enfant et enchaîne. */
export const termineLaManche = ({ jeu, mot, texte, emoji = "🎉", surSuite }) => {
  const { autocollantsDebloques } = progression.enregistre(jeu, { reussi: true, mot });

  sonVictoire();
  lanceLesConfettis();
  prononce(texte);

  if (autocollantsDebloques.length) setTimeout(sonRecompense, 700);

  celebre({ texte, emoji, autocollants: autocollantsDebloques, surSuite });
};

export const enregistreUneErreur = (jeu, mot) => {
  progression.enregistre(jeu, { reussi: false, mot });
  sonFaux();
};
