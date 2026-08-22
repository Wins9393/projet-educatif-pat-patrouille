/**
 * Résolution des chemins d'assets.
 *
 * L'URL est calculée à partir de l'emplacement de ce module, et non de la page
 * qui l'importe : le même appel fonctionne donc depuis la racine comme depuis
 * views/, et le site reste déployable dans un sous-dossier (GitHub Pages).
 */
const RACINE_ASSETS = new URL("../assets/", import.meta.url);

export const asset = (chemin) => new URL(chemin, RACINE_ASSETS).href;

/** Image d'une lettre pour un thème illustré, dans le dossier qu'il déclare. */
export const lettre = (caractere, dossier = "alphabet") => asset(`${dossier}/${caractere}.png`);
