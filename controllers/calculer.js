import { construitGrille } from "../shared/aleatoire.js";
import {
  demarreUneManche,
  enregistreUneErreur,
  prepareLaPage,
  sonJuste,
  termineLaManche,
} from "../shared/jeu.js";
import { enonce, leurresNumeriques, tireUneOperation } from "../shared/niveaux.js";
import { reglages } from "../shared/reglages.js";
import { creeCaractere, creeVisuel } from "../shared/rendu.js";
import { sonPose } from "../shared/sons.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "CALCULER" });

const consigne = document.querySelector(".consigne__texte");
const sectionCollecte = document.querySelector(".mode-collecte");
const sectionOperation = document.querySelector(".mode-operation");

const objet = theme.collecte.objet;
const contenant = theme.collecte.receptacle;

let operation = null;
let mancheGagnee = false;
let annonceCourante = "";

const annonce = () => prononce(annonceCourante);

/* ================================================================== */
/* Mode manipulation : composer une quantité avec des jetons           */
/* ================================================================== */

const zoneObjectif = document.querySelector(".objectif__valeur");
const zoneTotal = document.querySelector(".total__valeur");
const receptacle = document.querySelector(".receptacle");

/**
 * Où poser les jetons, dit en français.
 *
 * « dans le panier » marche pour un contenant, pas pour un destinataire :
 * un thème peut donc fournir sa propre tournure — « au chien » plutôt que
 * « dans le chien ».
 */
const ou = () => contenant.destination ?? `dans ${contenant.nom}`;
const reserve = document.querySelector(".reserve");

const VALEURS_DES_JETONS = [1, 2, 3, 4, 5];

/** Jetons actuellement déposés, par valeur. */
const poses = new Set();

let jetonEnCours = null;
let offset = { x: 0, y: 0 };

const total = () => [...poses].reduce((somme, valeur) => somme + valeur, 0);

const afficheUnNombre = (zone, valeur) => {
  zone.innerHTML = "";

  // Le total peut dépasser neuf : on le compose alors chiffre par chiffre.
  for (const chiffre of String(valeur)) {
    zone.append(creeCaractere(theme, chiffre));
  }

  zone.setAttribute("aria-label", String(valeur));
};

const construitLeReceptacle = () => {
  receptacle.innerHTML = "";
  receptacle.append(creeVisuel(theme, { visuel: contenant.visuel, affichage: contenant.nom }));
  receptacle.setAttribute("aria-label", contenant.nom);
};

const construitLesJetons = () => {
  reserve.innerHTML = "";

  VALEURS_DES_JETONS.filter((valeur) => valeur <= Math.max(5, niveau.nombreMax)).forEach((valeur) => {
    const jeton = document.createElement("div");
    jeton.className = "jeton";
    jeton.dataset.valeur = valeur;
    jeton.setAttribute("role", "button");
    jeton.setAttribute("tabindex", "0");
    jeton.setAttribute("aria-pressed", "false");
    jeton.setAttribute("aria-label", `${valeur} ${valeur > 1 ? objet.pluriel : objet.nom}`);

    for (let i = 0; i < valeur; i++) {
      jeton.append(creeVisuel(theme, { visuel: objet.visuel, affichage: "" }));
    }

    installeLeGlissement(jeton, valeur);
    reserve.append(jeton);
  });
};

/**
 * Un jeton est déposé si son centre tombe dans le disque du réceptacle.
 *
 * Le test est géométrique et non fondé sur elementFromPoint : un jeton déjà
 * posé ne peut donc pas masquer la zone de dépôt pour les suivants.
 */
const estDansLeReceptacle = (jeton) => {
  const zoneJeton = jeton.getBoundingClientRect();
  const zoneCible = receptacle.getBoundingClientRect();

  const rayonX = zoneCible.width / 2;
  const rayonY = zoneCible.height / 2;
  const ecartX = (zoneJeton.left + zoneJeton.width / 2 - (zoneCible.left + rayonX)) / rayonX;
  const ecartY = (zoneJeton.top + zoneJeton.height / 2 - (zoneCible.top + rayonY)) / rayonY;

  return ecartX * ecartX + ecartY * ecartY <= 1;
};

const metAJourLeTotal = () => {
  const valeur = total();
  afficheUnNombre(zoneTotal, valeur);

  receptacle.classList.toggle("receptacle--pret", valeur === operation.resultat);

  if (valeur !== operation.resultat || mancheGagnee) return;

  mancheGagnee = true;
  reussite(`Bravo ! Ça fait ${operation.resultat}`);
};

/** Rend le jeton au flux de la réserve. */
const rangeLeJeton = (jeton) => {
  jeton.classList.remove("jeton--pris");
  jeton.style.removeProperty("left");
  jeton.style.removeProperty("top");
  jeton.style.removeProperty("width");
};

const poseLeJeton = (jeton, valeur) => {
  const dedans = estDansLeReceptacle(jeton);

  if (dedans) {
    poses.add(valeur);
    sonPose();
  } else {
    poses.delete(valeur);
    rangeLeJeton(jeton);
  }

  jeton.classList.toggle("jeton--pose", dedans);
  jeton.setAttribute("aria-pressed", String(dedans));

  metAJourLeTotal();
};

/**
 * Maintient le jeton dans la fenêtre. La dimension de référence passe par
 * documentElement, plus fiable que window.innerWidth, et le clamp est ignoré
 * si elle n'est pas exploitable.
 */
const borne = (valeur, taille, dimension) => {
  const disponible =
    dimension === "largeur"
      ? document.documentElement.clientWidth || window.innerWidth
      : document.documentElement.clientHeight || window.innerHeight;

  const maximum = disponible - taille;
  if (!(maximum > 0)) return Math.max(valeur, 0);

  return Math.min(Math.max(valeur, 0), maximum);
};

const installeLeGlissement = (jeton, valeur) => {
  jeton.addEventListener("pointerdown", (e) => {
    if (mancheGagnee) return;

    jetonEnCours = jeton;

    // La capture garantit de recevoir les pointermove et pointerup même si le
    // doigt sort de l'élément. Si le navigateur la refuse, le glissement doit
    // malgré tout rester possible.
    try {
      jeton.setPointerCapture(e.pointerId);
    } catch {
      // Capture indisponible : on continue sans elle.
    }

    const zone = jeton.getBoundingClientRect();
    offset = { x: e.clientX - zone.left, y: e.clientY - zone.top };

    jeton.classList.add("jeton--pris");
    jeton.style.left = `${zone.left}px`;
    jeton.style.top = `${zone.top}px`;
    jeton.style.width = `${zone.width}px`;

    e.preventDefault();
  });

  jeton.addEventListener("pointermove", (e) => {
    if (jetonEnCours !== jeton) return;

    e.preventDefault();

    jeton.style.left = `${borne(e.clientX - offset.x, jeton.offsetWidth, "largeur")}px`;
    jeton.style.top = `${borne(e.clientY - offset.y, jeton.offsetHeight, "hauteur")}px`;

    receptacle.classList.toggle("receptacle--pret", estDansLeReceptacle(jeton));
  });

  const relache = () => {
    if (jetonEnCours !== jeton) return;

    jetonEnCours = null;
    poseLeJeton(jeton, valeur);
  };

  jeton.addEventListener("pointerup", relache);
  jeton.addEventListener("pointercancel", relache);

  // Équivalent au clavier : Entrée dépose ou retire le jeton.
  jeton.addEventListener("keydown", (e) => {
    if (mancheGagnee || (e.key !== "Enter" && e.key !== " ")) return;

    e.preventDefault();

    if (poses.has(valeur)) {
      poses.delete(valeur);
      jeton.classList.remove("jeton--pose");
      rangeLeJeton(jeton);
    } else {
      poses.add(valeur);
      jeton.classList.add("jeton--pose");
      sonPose();
    }

    jeton.setAttribute("aria-pressed", String(poses.has(valeur)));
    metAJourLeTotal();
  });
};

const demarreLaCollecte = () => {
  poses.clear();

  afficheUnNombre(zoneObjectif, operation.resultat);
  afficheUnNombre(zoneTotal, 0);
  receptacle.classList.remove("receptacle--pret");

  construitLeReceptacle();
  construitLesJetons();

  const quantite = `${operation.resultat} ${operation.resultat > 1 ? objet.pluriel : objet.nom}`;
  annonceCourante = `Mets ${quantite} ${ou()}`;
  consigne.textContent = annonceCourante;
};

/* ================================================================== */
/* Mode opération : résoudre un calcul posé                            */
/* ================================================================== */

const ligneEnonce = document.querySelector(".operation__enonce");
const illustration = document.querySelector(".operation__illustration");
const zoneChoix = document.querySelector(".choix");

/** Illustration des petites additions et soustractions, en objets du thème. */
const illustre = () => {
  illustration.innerHTML = "";

  // Au-delà d'une dizaine d'objets par groupe, l'illustration devient
  // illisible et n'aide plus : on s'en tient au calcul écrit.
  const illustrable =
    (operation.type === "addition" || operation.type === "soustraction") &&
    operation.a <= 10 &&
    operation.b <= 10;

  if (!illustrable) return;

  const groupe = (nombre, barres = 0) => {
    const bloc = document.createElement("span");
    bloc.className = "operation__groupe";

    for (let i = 0; i < nombre; i++) {
      const visuel = creeVisuel(theme, { visuel: objet.visuel, affichage: "" });
      // Les objets retirés sont barrés : la soustraction devient visible.
      if (i >= nombre - barres) visuel.classList.add("operation__retire");
      bloc.append(visuel);
    }

    return bloc;
  };

  if (operation.type === "addition") {
    const signe = document.createElement("span");
    signe.className = "operation__signe";
    signe.textContent = "+";
    illustration.append(groupe(operation.a), signe, groupe(operation.b));
  } else {
    illustration.append(groupe(operation.a, operation.b));
  }
};

const demarreLOperation = () => {
  const lisible = enonce(operation);

  ligneEnonce.textContent = `${lisible.ecrit} = ?`;
  ligneEnonce.setAttribute("aria-label", `${lisible.parle}, égale combien ?`);

  illustre();

  const pool = leurresNumeriques(operation.resultat, reglages().nombreDeChoix, niveau.nombreMax);
  const grille = construitGrille([operation.resultat, ...pool], operation.resultat, reglages().nombreDeChoix);

  zoneChoix.innerHTML = "";
  grille.forEach((valeur) => {
    const bouton = document.createElement("button");
    bouton.className = "choix__bouton";
    bouton.setAttribute("aria-label", String(valeur));

    for (const caractere of String(valeur)) {
      bouton.append(creeCaractere(theme, caractere));
    }

    bouton.addEventListener("click", () => verifieLaReponse(valeur, bouton));
    zoneChoix.append(bouton);
  });

  annonceCourante = `${lisible.parle}, ça fait combien ?`;
  consigne.textContent = `${lisible.ecrit} = ?`;
};

const verifieLaReponse = (valeur, bouton) => {
  if (mancheGagnee) return;

  if (valeur !== operation.resultat) {
    enregistreUneErreur("calculer", `${operation.type}-${operation.a}-${operation.b}`);
    bouton.classList.add("choix__bouton--faux");
    setTimeout(() => bouton.classList.remove("choix__bouton--faux"), 400);
    return;
  }

  mancheGagnee = true;
  bouton.classList.add("choix__bouton--juste");

  zoneChoix.querySelectorAll(".choix__bouton").forEach((autre) => {
    if (autre !== bouton) autre.classList.add("choix__bouton--efface");
  });

  reussite(`Bravo ! ${enonce(operation).parle} égale ${operation.resultat}`);
};

/* ================================================================== */
/* Enchaînement des manches                                            */
/* ================================================================== */

const reussite = (texte) => {
  sonJuste();

  termineLaManche({
    jeu: "calculer",
    mot: operation.type === "collecte" ? `collecte-${operation.resultat}` : `${operation.type}-${operation.a}-${operation.b}`,
    texte,
    emoji: objet.visuel,
    surSuite: nouvelleManche,
  });
};

const nouvelleManche = () => {
  demarreUneManche();

  mancheGagnee = false;
  operation = tireUneOperation(niveau);

  const enCollecte = operation.type === "collecte";
  sectionCollecte.hidden = !enCollecte;
  sectionOperation.hidden = enCollecte;

  if (enCollecte) {
    demarreLaCollecte();
  } else {
    demarreLOperation();
  }

  annonce();
};

document.querySelector('[data-action="rejouer"]').addEventListener("click", nouvelleManche);
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

nouvelleManche();
