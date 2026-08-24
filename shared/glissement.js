/**
 * Le geste : attraper, déplacer, lâcher — ou simplement toucher.
 *
 * Un seul geste, une seule issue : on attrape et on déplace. L'appui marque
 * l'intention — c'est là que la pièce se choisit — et la prise ne commence
 * qu'au-delà d'un seuil de quelques pixels, sinon la moindre dérive du doigt
 * ferait décoller la pièce sur un simple appui.
 *
 * Rien ne se joue au relâchement immobile. Faire cohabiter un toucher et un
 * glissement sur les mêmes éléments revenait à faire deviner au programme
 * lequel des deux l'enfant voulait, et il devinait mal.
 */

/** En deçà, le doigt n'a pas voulu déplacer quoi que ce soit. */
const SEUIL = 8;

/**
 * @param {Element} element
 * @param {object} gestes
 * @param {(e: PointerEvent) => boolean} [gestes.autorise] refuse l'appui
 * @param {(e: PointerEvent) => void} [gestes.surAppui] le doigt s'est posé
 * @param {(e: PointerEvent, depart: {x: number, y: number}) => void} [gestes.surPrise]
 *   seuil franchi ; `depart` est le point d'appui d'origine, celui qui dit
 *   quelle partie de l'élément le doigt tient vraiment
 * @param {(e: PointerEvent) => void} [gestes.surDeplacement]
 * @param {(e: PointerEvent) => void} [gestes.surDepose]
 * @param {(e: PointerEvent) => void} [gestes.surAbandon] geste interrompu
 */
export const installeLeGeste = (element, { autorise, surAppui, surPrise, surDeplacement, surDepose, surAbandon }) => {
  let pointeur = null;
  let depart = null;
  let pris = false;
  let controleur = null;

  const raccroche = () => {
    controleur?.abort();
    controleur = null;
    pointeur = null;
    depart = null;
    pris = false;
  };

  const surMouvement = (e) => {
    if (e.pointerId !== pointeur) return;

    if (!pris) {
      if (Math.hypot(e.clientX - depart.x, e.clientY - depart.y) < SEUIL) return;

      pris = true;
      surPrise?.(e, depart);
    }

    e.preventDefault();
    surDeplacement?.(e);
  };

  const termine = (e, interrompu) => {
    if (e.pointerId !== pointeur) return;

    const avaitPris = pris;
    raccroche();

    // Relâché sans avoir bougé : la pièce est choisie depuis l'appui, il n'y a
    // rien de plus à en faire.
    if (!avaitPris) return;

    if (interrompu) surAbandon?.(e);
    else surDepose?.(e);
  };

  element.addEventListener("pointerdown", (e) => {
    if (pointeur !== null || autorise?.(e) === false) return;

    pointeur = e.pointerId;
    depart = { x: e.clientX, y: e.clientY };
    pris = false;

    saisitLePointeur(element, e.pointerId);
    surAppui?.(e);

    /*
     * Les mouvements sont suivis sur la fenêtre, pas sur l'élément.
     *
     * Déplacer un élément dans le DOM lui retire sa capture du pointeur — la
     * spécification le dit, Firefox l'applique à la lettre, Chrome laisse
     * passer. Or la pièce voyage jusqu'au body à l'instant où on la soulève :
     * écoutée sur elle-même, elle ne recevrait plus jamais son relâchement et
     * resterait collée au curseur. La fenêtre, elle, voit tout — avec ou sans
     * capture, les événements de pointeur remontent jusqu'à elle.
     */
    controleur = new AbortController();
    const options = { signal: controleur.signal };

    window.addEventListener("pointermove", surMouvement, options);
    window.addEventListener("pointerup", (fin) => termine(fin, false), options);
    window.addEventListener("pointercancel", (fin) => termine(fin, true), options);

    // Le clavier garde son entrée sur la pièce : `preventDefault` empêche le
    // clic de lui donner le focus, on le rend à la main.
    element.focus?.({ preventScroll: true });
    e.preventDefault();
  });
};

/**
 * Réclame la capture du pointeur, et tant pis si le navigateur refuse.
 *
 * La capture n'est plus vitale — la fenêtre reçoit les événements de toute
 * façon — mais elle reste utile pour un cas que rien d'autre ne couvre : un
 * doigt ou une souris relâchés en dehors de la fenêtre. À redemander après
 * chaque déplacement de l'élément dans le DOM, qui la fait perdre.
 */
export const saisitLePointeur = (element, pointerId) => {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Capture indisponible : le suivi par la fenêtre suffit.
  }
};
