import { melange } from "../shared/aleatoire.js";
import { decoupeSure } from "../shared/decoupe.js";
import { normalise, rotations } from "../shared/formes.js";
import { installeLeGeste, saisitLePointeur } from "../shared/glissement.js";
import { demarreUneManche, prepareLaPage, termineLaManche } from "../shared/jeu.js";
import { oublie, reprise, sauvegarde } from "../shared/reprise.js";
import { silhouettePour } from "../shared/silhouettes.js";
import { sonPose, sonRefus } from "../shared/sons.js";
import { prononce } from "../shared/voix.js";

const { theme, niveau } = prepareLaPage({ titre: "PUZZLE" });

const gabarit = niveau.puzzle;

const grille = document.querySelector(".puzzle__grille");
const bac = document.querySelector(".puzzle__bac");
const consigne = document.querySelector(".consigne__texte");
const zoneAnnonce = document.querySelector(".puzzle__annonce");
const boutonPivoter = document.querySelector('[data-action="pivoter"]');

/**
 * Combien de couleurs de pièces la feuille de style propose.
 *
 * Les couleurs elles-mêmes vivent dans `styles/jeux.css`, sous
 * `.piece--couleur-*` : le contrôleur ne manipule qu'un numéro.
 */
const NOMBRE_DE_COULEURS = 8;

/** De combien la pièce monte au-dessus du doigt, en cases. Le doigt cache la cible. */
const LEVEE_TACTILE = 0.9;

/** Le temps laissé à la silhouette dorée avant que la victoire ne la recouvre. */
const JOIE_AVANT_FELICITATIONS = 750;

/** Les décalages tentés autour de la case visée, du plus proche au plus lointain. */
const AUTOUR = [
  [0, 0],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

let plateau = null;
let pieces = [];
let selectionnee = null;
let curseur = null;
let enCours = null;
let gagne = false;

/** Case du plateau → pièce qui l'occupe. */
const occupees = new Map();

/** Case du plateau → son élément, pour éclairer la visée sans requête CSS. */
const casesDuPlateau = new Map();

const clef = (ligne, colonne) => `${ligne}.${colonne}`;
const formeDe = (piece) => piece.orientations[piece.rotation];
const largeurDe = (forme) => Math.max(...forme.map(([, colonne]) => colonne)) + 1;
const hauteurDe = (forme) => Math.max(...forme.map(([ligne]) => ligne)) + 1;

const annonce = () => prononce(consigne.textContent);

/* ================================================================== */
/* Le plateau                                                          */
/* ================================================================== */

const construitLePlateau = () => {
  grille.style.setProperty("--lignes", plateau.lignes);
  grille.style.setProperty("--colonnes", plateau.colonnes);
  grille.replaceChildren();
  casesDuPlateau.clear();

  for (let ligne = 0; ligne < plateau.lignes; ligne += 1) {
    for (let colonne = 0; colonne < plateau.colonnes; colonne += 1) {
      const dedans = plateau.cases.has(clef(ligne, colonne));
      const cellule = document.createElement("span");

      cellule.className = dedans ? "case" : "case case--hors";
      cellule.dataset.ligne = ligne;
      cellule.dataset.colonne = colonne;

      grille.append(cellule);
      if (dedans) casesDuPlateau.set(clef(ligne, colonne), cellule);
    }
  }
};

/* ================================================================== */
/* Les pièces                                                          */
/* ================================================================== */

const creeLaPiece = (definition, index) => {
  const orientations = rotations(definition.cellules);
  const element = document.createElement("div");

  const piece = {
    id: index,
    nom: definition.nom,
    orientations,
    rotation: definition.rotation ?? Math.floor(Math.random() * orientations.length),
    couleur: definition.couleur ?? index % NOMBRE_DE_COULEURS,
    ligne: null,
    colonne: null,
    empreinte: null,
    element,
  };

  element.className = `piece piece--couleur-${piece.couleur}`;
  element.setAttribute("role", "button");
  element.tabIndex = 0;

  installeLesGestes(piece);
  dessineLaPiece(piece);

  return piece;
};

const dessineLaPiece = (piece) => {
  const forme = formeDe(piece);

  piece.element.style.setProperty("--largeur", largeurDe(forme));
  piece.element.style.setProperty("--hauteur", hauteurDe(forme));
  piece.element.setAttribute("aria-label", `${piece.nom}, ${forme.length} cases`);

  piece.element.replaceChildren(
    ...forme.map(([ligne, colonne]) => {
      const carreau = document.createElement("span");
      carreau.className = "piece__carreau";
      carreau.style.setProperty("--l", ligne);
      carreau.style.setProperty("--c", colonne);
      return carreau;
    })
  );
};

/** Le bac garde toujours le même ordre : une pièce reprise revient à sa place. */
const rangeDansLeBac = (piece) => {
  const suivante = pieces.find((autre) => autre.id > piece.id && autre.element.parentElement === bac);
  bac.insertBefore(piece.element, suivante?.element ?? null);
};

/* ================================================================== */
/* Poser, reprendre                                                    */
/* ================================================================== */

const libere = (piece) => {
  for (const [position, occupante] of occupees) {
    if (occupante === piece) occupees.delete(position);
  }

  piece.ligne = null;
  piece.colonne = null;
};

/**
 * Les cases que couvrirait la pièce si la case `prise` atterrissait là, ou
 * null si ça ne rentre pas. La pièce doit avoir été libérée au préalable :
 * sinon elle se gênerait elle-même.
 */
const poseCandidate = (piece, ligne, colonne, prise) => {
  const forme = formeDe(piece);
  const [priseLigne, priseColonne] = forme[prise];

  const cellules = forme.map(([l, c]) => [ligne + l - priseLigne, colonne + c - priseColonne]);
  const rentre = cellules.every(([l, c]) => plateau.cases.has(clef(l, c)) && !occupees.has(clef(l, c)));

  return rentre ? cellules : null;
};

/**
 * La pose valide la plus proche de la case visée.
 *
 * L'indulgence est délibérée : un doigt d'enfant vise à une case près, et
 * refuser pour un demi-centimètre transformerait le jeu en épreuve d'adresse
 * plutôt qu'en casse-tête.
 */
const chercheUnePose = (piece, ligne, colonne, prise) => {
  for (const [dl, dc] of AUTOUR) {
    const cellules = poseCandidate(piece, ligne + dl, colonne + dc, prise);
    if (cellules) return cellules;
  }

  return null;
};

/** Installe la pièce sur le plateau, sans rien annoncer. */
const installe = (piece, cellules) => {
  piece.ligne = Math.min(...cellules.map(([ligne]) => ligne));
  piece.colonne = Math.min(...cellules.map(([, colonne]) => colonne));

  cellules.forEach(([ligne, colonne]) => occupees.set(clef(ligne, colonne), piece));

  piece.element.classList.add("piece--posee");
  piece.element.style.setProperty("--ligne", piece.ligne);
  piece.element.style.setProperty("--colonne", piece.colonne);
  grille.append(piece.element);
};

/**
 * Le seul endroit par lequel une pièce se pose.
 *
 * Le glisser, le toucher et le clavier y débouchent tous les trois. C'est une
 * leçon déjà payée ici : le clavier de CALCULER doublait la logique du glisser
 * et oubliait la sauvegarde. Validation, son, annonce et instantané vivent
 * donc à un seul endroit.
 */
const pose = (piece, cellules) => {
  installe(piece, cellules);

  sonPose();
  compteLeReste();
  noteLaManche();
  selectionne(prochaineAPoser());
  verifieLaVictoire();
};

const renvoieAuBac = (piece, { refus = false } = {}) => {
  libere(piece);

  piece.element.classList.remove("piece--posee");
  piece.element.style.removeProperty("--ligne");
  piece.element.style.removeProperty("--colonne");
  rangeDansLeBac(piece);

  if (refus) sonRefus();

  compteLeReste();
  noteLaManche();
};

/**
 * Pose la pièce sur la case du curseur, au clavier. La pièce est tenue par sa
 * première case, celle que montre le fantôme.
 */
const poseSurLaCase = (piece, ligne, colonne) => {
  libere(piece);

  const cellules = chercheUnePose(piece, ligne, colonne, 0);
  if (!cellules) return renvoieAuBac(piece, { refus: true });

  pose(piece, cellules);
};

/* ================================================================== */
/* Sélection et rotation                                               */
/* ================================================================== */

const prochaineAPoser = () => pieces.find((piece) => piece.ligne === null) ?? null;

const selectionne = (piece) => {
  selectionnee?.element.classList.remove("piece--choisie");
  selectionnee = piece ?? null;
  selectionnee?.element.classList.add("piece--choisie");

  boutonPivoter.disabled = !selectionnee || selectionnee.orientations.length === 1;
  dessineLeFantome();
};

const pivoteLaSelection = () => {
  if (!selectionnee || gagne || selectionnee.orientations.length === 1) return;

  if (selectionnee.ligne !== null) renvoieAuBac(selectionnee);

  selectionnee.rotation = (selectionnee.rotation + 1) % selectionnee.orientations.length;
  dessineLaPiece(selectionnee);

  noteLaManche();
  dessineLeFantome();
};

/* ================================================================== */
/* Le geste : attraper, déplacer, lâcher                               */
/* ================================================================== */

/**
 * Quelle case de la pièce le doigt tient au moment de l'appui.
 *
 * C'est toute la règle d'ancrage du jeu — *la case que tu tiens est la case où
 * tu poses* — et la seule qui reste vraie sur un L, dont le coin haut-gauche
 * du cadre est vide. Un appui tombé dans un creux est rattrapé par la case la
 * plus proche.
 */
const caseTenue = (piece, x, y) => {
  const zone = piece.element.getBoundingClientRect();
  const forme = formeDe(piece);
  const cote = zone.width / largeurDe(forme);

  const viseeLigne = (y - zone.top) / cote;
  const viseeColonne = (x - zone.left) / cote;

  let tenue = 0;
  let plusProche = Infinity;

  forme.forEach(([ligne, colonne], index) => {
    const ecart = Math.hypot(ligne + 0.5 - viseeLigne, colonne + 0.5 - viseeColonne);
    if (ecart >= plusProche) return;

    plusProche = ecart;
    tenue = index;
  });

  return tenue;
};

const coteDeLaGrille = () => grille.getBoundingClientRect().width / plateau.colonnes;

const caseVisee = (e) => {
  const zone = grille.getBoundingClientRect();

  return [
    Math.floor((e.clientY - enCours.levee - zone.top) / enCours.cote),
    Math.floor((e.clientX - zone.left) / enCours.cote),
  ];
};

const effaceLaVisee = () => {
  for (const cellule of casesDuPlateau.values()) cellule.classList.remove("case--visee");
};

const montreLaVisee = (cellules) => {
  effaceLaVisee();
  cellules?.forEach(([ligne, colonne]) => casesDuPlateau.get(clef(ligne, colonne))?.classList.add("case--visee"));
};

const attrape = (piece, e, depart) => {
  // Filet : un geste précédent qui n'a jamais reçu son relâchement — fenêtre
  // quittée, onglet masqué — ne doit pas laisser deux pièces en l'air.
  if (enCours) {
    const oubliee = enCours.piece;
    rendLaPiece(oubliee);
    renvoieAuBac(oubliee);
  }

  const prise = caseTenue(piece, depart.x, depart.y);
  const cote = coteDeLaGrille();

  libere(piece);

  /*
   * La place de la pièce reste tenue dans le bac. Sans cette empreinte, tout
   * le bac se réorganise sous la main à l'instant où on soulève une pièce, et
   * la suivante n'est plus là où l'enfant l'avait vue.
   */
  if (piece.element.parentElement === bac) {
    const zone = piece.element.getBoundingClientRect();

    piece.empreinte = document.createElement("div");
    piece.empreinte.className = "puzzle__empreinte";
    piece.empreinte.style.width = `${zone.width}px`;
    piece.empreinte.style.height = `${zone.height}px`;
    bac.insertBefore(piece.empreinte, piece.element);
  }

  // La pièce prend la taille du plateau dès qu'on la soulève : on voit
  // exactement ce qu'on va poser.
  piece.element.classList.remove("piece--posee");
  piece.element.classList.add("piece--prise");
  piece.element.style.setProperty("--case", `${cote}px`);
  document.body.append(piece.element);

  // Le déménagement vient de lui retirer sa capture du pointeur : on la
  // redemande, pour que même un relâchement hors de la fenêtre nous revienne.
  saisitLePointeur(piece.element, e.pointerId);

  enCours = { piece, prise, cote, levee: e.pointerType === "touch" ? cote * LEVEE_TACTILE : 0 };
  selectionne(piece);
};

const deplace = (e) => {
  const { piece, prise, cote, levee } = enCours;
  const [priseLigne, priseColonne] = formeDe(piece)[prise];

  /*
   * Aucun bornage à la fenêtre : la pièce doit rester exactement sous le
   * doigt, sinon la case tenue n'est plus celle qu'on croit et la visée ment.
   */
  piece.element.style.left = `${e.clientX - (priseColonne + 0.5) * cote}px`;
  piece.element.style.top = `${e.clientY - levee - (priseLigne + 0.5) * cote}px`;

  const [ligne, colonne] = caseVisee(e);
  montreLaVisee(chercheUnePose(piece, ligne, colonne, prise));
};

/** Repose la pièce à plat : elle ne vole plus, où qu'elle finisse. */
const rendLaPiece = (piece) => {
  effaceLaVisee();

  piece.element.classList.remove("piece--prise");
  piece.element.style.removeProperty("left");
  piece.element.style.removeProperty("top");
  piece.element.style.removeProperty("--case");
  piece.empreinte?.remove();
  piece.empreinte = null;

  enCours = null;
};

const relache = (e, { abandonne = false } = {}) => {
  const { piece, prise } = enCours;
  const [ligne, colonne] = caseVisee(e);
  const cellules = abandonne ? null : chercheUnePose(piece, ligne, colonne, prise);

  rendLaPiece(piece);

  if (cellules) pose(piece, cellules);
  else renvoieAuBac(piece, { refus: !abandonne });

  dessineLeFantome();
};

const installeLesGestes = (piece) => {
  installeLeGeste(piece.element, {
    autorise: () => !gagne,

    /*
     * Poser le doigt sur une pièce la choisit — c'est ce qui donne son sens au
     * bouton ↻, sans avoir à distinguer un clic d'un glissement. Que le geste
     * devienne une prise ou s'arrête là ne change rien : dans les deux cas
     * c'est cette pièce que l'enfant désigne.
     */
    surAppui: () => selectionne(piece),

    surPrise: (e, depart) => attrape(piece, e, depart),
    surDeplacement: deplace,
    surDepose: relache,
    surAbandon: (e) => relache(e, { abandonne: true }),
  });
};

/* ================================================================== */
/* Le clavier                                                          */
/* ================================================================== */

const entre = (valeur, maximum) => Math.max(0, Math.min(valeur, maximum));

const dessineLeFantome = () => {
  if (enCours) return;

  effaceLaVisee();
  for (const cellule of casesDuPlateau.values()) cellule.classList.remove("case--curseur");

  if (!curseur) return;

  casesDuPlateau.get(clef(curseur[0], curseur[1]))?.classList.add("case--curseur");
  if (!selectionnee) return;

  montreLaVisee(chercheUnePose(selectionnee, curseur[0], curseur[1], 0));
};

const bougeLeCurseur = (dl, dc) => {
  curseur = curseur
    ? [entre(curseur[0] + dl, plateau.lignes - 1), entre(curseur[1] + dc, plateau.colonnes - 1)]
    : [0, 0];

  dessineLeFantome();
};

const TOUCHES = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

grille.addEventListener("keydown", (e) => {
  if (gagne) return;

  if (TOUCHES[e.key]) {
    e.preventDefault();
    return bougeLeCurseur(...TOUCHES[e.key]);
  }

  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    return pivoteLaSelection();
  }

  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (selectionnee && curseur) poseSurLaCase(selectionnee, curseur[0], curseur[1]);
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();

    const occupante = curseur && occupees.get(clef(curseur[0], curseur[1]));
    if (!occupante) return;

    renvoieAuBac(occupante);
    selectionne(occupante);
  }
});

/**
 * Choisir une pièce au clavier envoie sur le plateau : c'est là que tout se
 * joue ensuite, et l'enfant n'a pas à retrouver la tabulation qui y mène.
 */
const installeLeClavierDesPieces = (piece) => {
  piece.element.addEventListener("keydown", (e) => {
    if (gagne) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectionne(piece);
      if (!curseur) bougeLeCurseur(0, 0);
      grille.focus();
      return;
    }

    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      selectionne(piece);
      pivoteLaSelection();
    }
  });
};

/* ================================================================== */
/* La manche                                                           */
/* ================================================================== */

const rectangle = (lignes, colonnes) => {
  const cases = [];

  for (let ligne = 0; ligne < lignes; ligne += 1) {
    for (let colonne = 0; colonne < colonnes; colonne += 1) cases.push([ligne, colonne]);
  }

  return cases;
};

/**
 * Une manche neuve : une silhouette une fois sur deux quand le niveau en
 * propose, un rectangle sinon.
 */
const mancheNeuve = () => {
  const fourchette = gabarit.silhouettes;
  const silhouette =
    fourchette && Math.random() < 0.5
      ? silhouettePour({ min: fourchette[0], max: fourchette[1], univers: theme.id })
      : null;

  const cases = silhouette ? silhouette.cellules : rectangle(gabarit.lignes, gabarit.colonnes);
  const morceaux = melange(decoupeSure(cases, gabarit));

  return {
    plateau: {
      nom: silhouette ? silhouette.nom : "la grille",
      lignes: silhouette ? silhouette.lignes : gabarit.lignes,
      colonnes: silhouette ? silhouette.colonnes : gabarit.colonnes,
      cases,
    },
    pieces: morceaux.map((morceau, index) => ({
      nom: morceau.nom,
      cellules: normalise(morceau.cellules),
      couleur: index % NOMBRE_DE_COULEURS,
    })),
  };
};

const compteLeReste = () => {
  const restantes = pieces.filter((piece) => piece.ligne === null).length;

  zoneAnnonce.textContent = restantes
    ? `${restantes} forme${restantes > 1 ? "s" : ""} à poser`
    : "La grille est pleine !";
};

/** Une manche se décrit par son plateau et l'état de chacune de ses pièces. */
const noteLaManche = () => {
  if (gagne) return;

  sauvegarde("puzzle", {
    plateau: plateau.description,
    pieces: pieces.map((piece) => ({
      nom: piece.nom,
      cellules: piece.orientations[0],
      couleur: piece.couleur,
      rotation: piece.rotation,
      ligne: piece.ligne,
      colonne: piece.colonne,
    })),
  });
};

const verifieLaVictoire = () => {
  if (gagne || occupees.size !== plateau.description.cases.length) return;

  gagne = true;
  oublie("puzzle");
  selectionne(null);
  grille.classList.add("puzzle__grille--pleine");

  /*
   * Une pause avant les félicitations : c'est le seul moment où la silhouette
   * apparaît d'un seul tenant, et l'écran de victoire la recouvre. Sans ce
   * répit, la récompense du puzzle passerait inaperçue.
   */
  setTimeout(
    () =>
      termineLaManche({
        jeu: "puzzle",
        mot: `puzzle-${plateau.description.cases.length}`,
        texte: `Bravo ! Tu as rempli ${plateau.nom}`,
        emoji: theme.vignette,
        surSuite: () => nouvelleManche(),
      }),
    JOIE_AVANT_FELICITATIONS
  );
};

/** Remet en place les pièces d'une manche reprise, sans son ni annonce. */
const reposeLesPieces = (definitions) => {
  pieces.forEach((piece, index) => {
    const { ligne, colonne } = definitions[index];

    if (ligne === null || colonne === null) return rangeDansLeBac(piece);

    const cellules = formeDe(piece).map(([l, c]) => [ligne + l, colonne + c]);
    const valide = cellules.every(([l, c]) => plateau.cases.has(clef(l, c)) && !occupees.has(clef(l, c)));

    if (valide) installe(piece, cellules);
    else rangeDansLeBac(piece);
  });
};

/** Un instantané exploitable : le plateau et les pièces se tiennent. */
const estUtilisable = (manche) =>
  Array.isArray(manche?.plateau?.cases) && manche.plateau.cases.length > 0 && Array.isArray(manche.pieces) && manche.pieces.length > 0;

const nouvelleManche = (repris = null) => {
  demarreUneManche();

  selectionnee = null;
  curseur = null;
  enCours = null;
  gagne = false;
  occupees.clear();

  const manche = estUtilisable(repris) ? repris : mancheNeuve();

  plateau = {
    ...manche.plateau,
    description: manche.plateau,
    cases: new Set(manche.plateau.cases.map(([ligne, colonne]) => clef(ligne, colonne))),
  };

  grille.classList.remove("puzzle__grille--pleine");
  construitLePlateau();

  bac.replaceChildren();
  pieces = manche.pieces.map((definition, index) => creeLaPiece(definition, index));
  pieces.forEach(installeLeClavierDesPieces);
  reposeLesPieces(manche.pieces);

  consigne.textContent = `Remplis ${plateau.nom}`;
  selectionne(prochaineAPoser());
  compteLeReste();
  noteLaManche();
  annonce();
};

/*
 * Quitter la fenêtre en pleine prise — changer d'onglet, passer à une autre
 * application — ne produit pas toujours de `pointercancel`. La pièce rentre
 * alors d'elle-même plutôt que de rester suspendue au retour.
 */
window.addEventListener("blur", () => {
  if (!enCours) return;

  const { piece } = enCours;
  rendLaPiece(piece);
  renvoieAuBac(piece);
});

boutonPivoter.addEventListener("click", pivoteLaSelection);
document.querySelector('[data-action="ecouter"]').addEventListener("click", annonce);

document.querySelector('[data-action="vider"]').addEventListener("click", () => {
  if (gagne) return;

  for (const piece of [...pieces].reverse()) {
    if (piece.ligne !== null) renvoieAuBac(piece);
  }

  selectionne(prochaineAPoser());
});

// Le bouton repart d'une grille neuve : l'argument d'événement ne doit pas
// être pris pour une manche à reprendre.
document.querySelector('[data-action="rejouer"]').addEventListener("click", () => nouvelleManche());

nouvelleManche(reprise("puzzle"));
