/**
 * Interface réactive, sans framework.
 *
 * Le problème que résout React — garder le DOM en accord avec l'état — se
 * règle ici en trois temps, et deux étaient déjà en place :
 *
 *  1. **Une source de vérité qui s'annonce.** Toute écriture passe par
 *     `progression.js` ou `reglages.js`, qui émettent un événement sur
 *     `window`. C'est le magasin et le canal d'abonnement, en deux lignes.
 *  2. **De petites fonctions qui refont leur fragment.** Pas de comparaison
 *     d'arbres : une ligne de statistiques ou une liste de cinq mots se
 *     reconstruit plus vite qu'elle ne se compare.
 *  3. **Un abonnement qui meurt avec le fragment.** C'est le point qui
 *     manquait, et le seul qui demande un peu d'attention : un panneau
 *     rouvert dix fois laisserait dix écouteurs derrière lui, chacun
 *     redessinant un DOM que plus personne ne regarde.
 */

/** Les événements par lesquels l'état se déclare modifié. */
export const CHANGEMENTS = {
  progression: "progression-modifiee",
  reglages: "reglages-modifies",
};

/**
 * Maintient un fragment à jour : dessine maintenant, puis à chaque changement.
 *
 * L'abonnement se détache seul dès que l'élément quitte le document. On aurait
 * pu le raccrocher à un événement de fermeture, mais c'est fragile : un nœud
 * simplement retiré du DOM n'en émet aucun, et tous les chemins de suppression
 * ne passent pas par le même endroit. Ici il n'y a rien à penser — un fragment
 * détaché cesse de s'abonner à la première annonce qui suit, et le pire cas est
 * un écouteur inerte jusque-là.
 *
 * @param {Element} element le fragment maintenu ; son retrait coupe le fil
 * @param {() => void} dessine le reconstruit depuis l'état courant. Sera
 *   rappelé un nombre imprévisible de fois : il doit être idempotent.
 * @param {{sur?: string[]}} [options] les événements à suivre
 * @returns {() => void} pour couper l'abonnement à la main si besoin
 */
export const resteAJour = (element, dessine, { sur = [CHANGEMENTS.progression] } = {}) => {
  const controleur = new AbortController();

  const surChangement = () => {
    if (!element.isConnected) return controleur.abort();
    dessine();
  };

  dessine();

  for (const evenement of sur) {
    window.addEventListener(evenement, surChangement, { signal: controleur.signal });
  }

  return () => controleur.abort();
};
