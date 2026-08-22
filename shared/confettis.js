import { reglages } from "./reglages.js";
import { options } from "../particles/particles-options.js";

/**
 * Confettis de victoire.
 *
 * L'instance précédente est systématiquement détruite avant d'en lancer une
 * autre : sans cela, les confettis d'une manche continuaient de tomber sur la
 * suivante et s'accumulaient au fil des parties.
 */
const CONTENEUR = "tsparticles";

let instance = null;

const disponible = () => typeof tsParticles !== "undefined";

export const arreteLesConfettis = () => {
  if (!disponible()) return;

  instance?.destroy();
  instance = null;

  // Une instance a pu être créée ailleurs (rechargement, double appel) :
  // on nettoie tout ce qui porte notre conteneur.
  tsParticles.dom?.()
    .filter((conteneur) => conteneur.id === CONTENEUR)
    .forEach((conteneur) => conteneur.destroy());
};

export const lanceLesConfettis = async () => {
  if (!reglages().animations || !disponible()) return;

  arreteLesConfettis();
  instance = await tsParticles.load(CONTENEUR, options);
};

/** Prépare le conteneur si la page ne le déclare pas déjà. */
export const prepareLeConteneur = () => {
  if (document.querySelector(`#${CONTENEUR}`)) return;

  const element = document.createElement("div");
  element.id = CONTENEUR;
  element.setAttribute("aria-hidden", "true");
  document.body.append(element);
};
