import { reglages, modifieUnReglage, reglagesParDefaut } from "./reglages.js";
import * as progression from "./progression.js";
import { themes, themeActif, choisitLeTheme } from "./themes.js";
import { NIVEAUX, niveauParId } from "./niveaux.js";
import { prononce, laVoixEstDisponible, voixDisponibles, voixChoisie, choisitLaVoix } from "./voix.js";
import { resteAJour } from "./reactif.js";

/* ------------------------------------------------------------------ */
/* Barre supérieure                                                    */
/* ------------------------------------------------------------------ */

/**
 * @param {{titre?: string, retour?: string}} options
 *
 * Le titre est facultatif : l'accueil se nomme déjà par son grand titre, le
 * répéter dans la barre ne dit rien de plus. Un espace souple prend sa place
 * pour que les pastilles restent à droite.
 */
export const construitLaBarre = ({ titre = null, retour = null, niveau = null }) => {
  const barre = document.createElement("header");
  barre.className = "barre";

  if (retour) {
    const lien = document.createElement("a");
    lien.className = "bouton bouton--discret bouton--icone";
    lien.href = retour;
    lien.setAttribute("aria-label", "Retour à l'accueil");
    lien.textContent = "←";
    barre.append(lien);
  }

  if (titre) {
    const titreElement = document.createElement("h1");
    titreElement.className = "barre__titre";
    titreElement.textContent = titre;
    barre.append(titreElement);
  } else {
    const espace = document.createElement("span");
    espace.className = "barre__espace";
    barre.append(espace);
  }

  if (niveau) {
    const pastille = document.createElement("p");
    pastille.className = "barre__niveau";
    pastille.innerHTML = `<span aria-hidden="true">${niveau.emoji}</span><span>${niveau.nom}</span>`;
    pastille.setAttribute("aria-label", `Niveau ${niveau.id}, ${niveau.nom}`);
    barre.append(pastille);
  }

  const score = document.createElement("p");
  score.className = "barre__score";
  score.innerHTML = `<span aria-hidden="true">⭐</span><span class="barre__score-valeur">0</span>`;
  score.setAttribute("aria-label", "Réussites");
  barre.append(score);

  const rafraichitLeScore = () => {
    score.querySelector(".barre__score-valeur").textContent = progression.profil().reussites;
  };

  rafraichitLeScore();
  window.addEventListener("progression-modifiee", rafraichitLeScore);

  const reglagesBouton = document.createElement("button");
  reglagesBouton.className = "bouton bouton--discret bouton--icone";
  reglagesBouton.setAttribute("aria-label", "Réglages");
  reglagesBouton.textContent = "⚙️";
  reglagesBouton.addEventListener("click", ouvreLesReglages);
  barre.append(reglagesBouton);

  return barre;
};

/* ------------------------------------------------------------------ */
/* Panneau de réglages                                                 */
/* ------------------------------------------------------------------ */

const groupeDeSegments = (intitule, aide, valeurs, valeurCourante, surChoix) => {
  const bloc = document.createElement("div");
  bloc.className = "reglage";

  const titre = document.createElement("p");
  titre.className = "reglage__intitule";
  titre.textContent = intitule;
  bloc.append(titre);

  if (aide) {
    const texteAide = document.createElement("p");
    texteAide.className = "reglage__aide";
    texteAide.textContent = aide;
    bloc.append(texteAide);
  }

  const segments = document.createElement("div");
  segments.className = "segments";
  segments.setAttribute("role", "group");
  segments.setAttribute("aria-label", intitule);

  valeurs.forEach(({ valeur, libelle }) => {
    const bouton = document.createElement("button");
    bouton.className = "segment";
    bouton.textContent = libelle;
    bouton.setAttribute("aria-pressed", String(valeur === valeurCourante));

    bouton.addEventListener("click", () => {
      segments.querySelectorAll(".segment").forEach((autre) => autre.setAttribute("aria-pressed", "false"));
      bouton.setAttribute("aria-pressed", "true");
      surChoix(valeur);
    });

    segments.append(bouton);
  });

  bloc.append(segments);
  return bloc;
};

const sectionNiveau = () => {
  const bloc = document.createElement("div");
  bloc.className = "reglage";

  const titre = document.createElement("p");
  titre.className = "reglage__intitule";
  titre.textContent = "Niveau";
  bloc.append(titre);

  const aide = document.createElement("p");
  aide.className = "reglage__aide";
  bloc.append(aide);

  const liste = document.createElement("div");
  liste.className = "niveaux";
  liste.setAttribute("role", "group");
  liste.setAttribute("aria-label", "Niveau de difficulté");

  const decrit = (niveau) =>
    `${niveau.age} · mots jusqu'à ${niveau.longueurMax === 99 ? "tous" : niveau.longueurMax + " lettres"} · ${describeOperations(niveau)}`;

  NIVEAUX.forEach((niveau) => {
    const bouton = document.createElement("button");
    bouton.className = "niveau-jeton";
    bouton.setAttribute("aria-pressed", String(niveau.id === reglages().niveau));
    bouton.innerHTML = `
      <span class="niveau-jeton__emoji" aria-hidden="true">${niveau.emoji}</span>
      <span class="niveau-jeton__nom">${niveau.nom}</span>
      <span class="niveau-jeton__age">${niveau.age}</span>
    `;

    bouton.addEventListener("click", () => {
      modifieUnReglage("niveau", niveau.id);
      liste.querySelectorAll(".niveau-jeton").forEach((autre) => autre.setAttribute("aria-pressed", "false"));
      bouton.setAttribute("aria-pressed", "true");
      aide.textContent = decrit(niveau);
    });

    liste.append(bouton);
  });

  aide.textContent = decrit(niveauParId(reglages().niveau));
  bloc.append(liste);

  return bloc;
};

const describeOperations = (niveau) => {
  const noms = {
    collecte: "quantités à composer",
    addition: "additions",
    soustraction: "soustractions",
    multiplication: "multiplications",
    division: "divisions",
  };

  return niveau.operations.map((operation) => noms[operation]).join(", ");
};

const sectionVoix = () => {
  const bloc = document.createElement("div");
  bloc.className = "reglage";

  const titre = document.createElement("p");
  titre.className = "reglage__intitule";
  titre.textContent = "Voix";
  bloc.append(titre);

  if (!laVoixEstDisponible()) {
    const aide = document.createElement("p");
    aide.className = "reglage__aide";
    aide.textContent = "La lecture à voix haute n'est pas disponible sur ce navigateur.";
    bloc.append(aide);
    return bloc;
  }

  const segments = document.createElement("div");
  segments.className = "segments";

  [
    { valeur: true, libelle: "Activée" },
    { valeur: false, libelle: "Coupée" },
  ].forEach(({ valeur, libelle }) => {
    const bouton = document.createElement("button");
    bouton.className = "segment";
    bouton.textContent = libelle;
    bouton.setAttribute("aria-pressed", String(valeur === reglages().voix));
    bouton.addEventListener("click", () => {
      segments.querySelectorAll(".segment").forEach((autre) => autre.setAttribute("aria-pressed", "false"));
      bouton.setAttribute("aria-pressed", "true");
      modifieUnReglage("voix", valeur);
      if (valeur) prononce("La voix est activée");
    });
    segments.append(bouton);
  });

  bloc.append(segments);

  // Choix de la voix : leur qualité varie beaucoup d'un appareil à l'autre,
  // le mieux est d'écouter et de choisir.
  const liste = voixDisponibles();

  if (liste.length) {
    const champ = document.createElement("div");
    champ.className = "champ";

    const selecteur = document.createElement("select");
    selecteur.className = "selecteur";
    selecteur.setAttribute("aria-label", "Choix de la voix");

    liste.forEach((voix) => {
      const option = document.createElement("option");
      option.value = voix.voiceURI;
      option.textContent = `${voix.name} (${voix.lang})`;
      option.selected = voix.voiceURI === voixChoisie()?.voiceURI;
      selecteur.append(option);
    });

    selecteur.addEventListener("change", () => {
      choisitLaVoix(selecteur.value);
      prononce("Bonjour, on joue ensemble ?");
    });

    const essai = document.createElement("button");
    essai.className = "bouton";
    essai.textContent = "🔊 Écouter";
    essai.addEventListener("click", () => prononce("Bonjour, on joue ensemble ?"));

    champ.append(selecteur, essai);
    bloc.append(champ);

    const aide = document.createElement("p");
    aide.className = "reglage__aide";
    aide.textContent =
      "Une voix est difficile à comprendre ? Essayez-en une autre. Sur iPad et Mac, des voix de meilleure qualité s'ajoutent dans Réglages ▸ Accessibilité ▸ Contenu énoncé.";
    bloc.append(aide);
  }

  // Débit de lecture
  const debit = document.createElement("div");
  debit.className = "segments";

  [
    { valeur: 0.6, libelle: "Très lent" },
    { valeur: 0.8, libelle: "Lent" },
    { valeur: 1, libelle: "Normal" },
  ].forEach(({ valeur, libelle }) => {
    const bouton = document.createElement("button");
    bouton.className = "segment";
    bouton.textContent = libelle;
    bouton.setAttribute("aria-pressed", String(valeur === reglages().debitVoix));
    bouton.addEventListener("click", () => {
      debit.querySelectorAll(".segment").forEach((autre) => autre.setAttribute("aria-pressed", "false"));
      bouton.setAttribute("aria-pressed", "true");
      modifieUnReglage("debitVoix", valeur);
      prononce("On joue ensemble ?");
    });
    debit.append(bouton);
  });

  bloc.append(debit);

  return bloc;
};

const sectionProfils = () => {
  const bloc = document.createElement("div");
  bloc.className = "reglage";

  const titre = document.createElement("p");
  titre.className = "reglage__intitule";
  titre.textContent = "Qui joue ?";
  bloc.append(titre);

  const liste = document.createElement("div");
  liste.className = "profils";

  // Le clic ne redessine plus lui-même : il écrit dans la progression, qui
  // annonce le changement, et tout ce qui en dépend se remet à jour — ici
  // comme dans l'espace parent et dans la barre supérieure.
  resteAJour(liste, () => {
    liste.replaceChildren(
      ...progression.nomsDesProfils().map((nom) => {
        const jeton = document.createElement("button");
        jeton.className = "profil-jeton";
        jeton.textContent = nom;
        jeton.setAttribute("aria-pressed", String(nom === progression.profilActif()));
        jeton.addEventListener("click", () => progression.choisitLeProfil(nom));
        return jeton;
      })
    );
  });

  bloc.append(liste);

  const champ = document.createElement("div");
  champ.className = "champ";

  const saisie = document.createElement("input");
  saisie.type = "text";
  saisie.placeholder = "Ajouter un prénom";
  saisie.maxLength = 16;
  saisie.setAttribute("aria-label", "Prénom du nouveau profil");

  const ajout = document.createElement("button");
  ajout.className = "bouton";
  ajout.textContent = "Ajouter";
  ajout.addEventListener("click", () => {
    const nom = saisie.value.trim();
    if (!nom) return;

    progression.choisitLeProfil(nom);
    saisie.value = "";
    dessine();
  });

  champ.append(saisie, ajout);
  bloc.append(champ);

  return bloc;
};

/**
 * Le bilan du profil actif : compteurs et mots qui coincent.
 *
 * Renvoie des éléments plutôt que de les poser : c'est ce qui permet de le
 * rappeler à chaque changement de profil sans rien savoir de son conteneur.
 */
const bilanDuProfil = () => {
  const courant = progression.profil();
  const total = courant.reussites + courant.erreurs;
  const taux = total ? Math.round((courant.reussites / total) * 100) : 0;

  const stats = document.createElement("div");
  stats.className = "stats";
  stats.innerHTML = `
    <div class="stat"><p class="stat__valeur">${courant.reussites}</p><p class="stat__intitule">Réussites</p></div>
    <div class="stat"><p class="stat__valeur">${taux}%</p><p class="stat__intitule">Bonnes réponses</p></div>
    <div class="stat"><p class="stat__valeur">${courant.meilleureSerie}</p><p class="stat__intitule">Meilleure série</p></div>
  `;

  const difficiles = progression.motsDifficiles();
  if (!difficiles.length) return [stats];

  const sousTitre = document.createElement("p");
  sousTitre.className = "reglage__aide";
  sousTitre.textContent = "Mots qui demandent encore de l'entraînement :";

  const liste = document.createElement("div");
  liste.className = "liste-mots";
  difficiles.forEach(({ mot, erreurs, reussites }) => {
    const ligne = document.createElement("div");
    ligne.className = "liste-mots__ligne";
    ligne.innerHTML = `<span>${mot}</span><span class="liste-mots__erreurs">${erreurs} erreur${erreurs > 1 ? "s" : ""} · ${reussites} réussite${reussites > 1 ? "s" : ""}</span>`;
    liste.append(ligne);
  });

  return [stats, sousTitre, liste];
};

const sectionParent = () => {
  const bloc = document.createElement("div");
  bloc.className = "reglage";

  const titre = document.createElement("p");
  titre.className = "reglage__intitule";
  titre.textContent = "Espace parent";
  bloc.append(titre);

  // Tout ce qui dépend du profil vit dans ce conteneur, refait d'un bloc à
  // chaque changement. Le bouton de remise à zéro reste dehors : il ne dépend
  // de rien, et le refaire lui ferait perdre le focus sous les doigts.
  const contenu = document.createElement("div");
  contenu.className = "espace-parent";
  bloc.append(contenu);

  resteAJour(contenu, () => contenu.replaceChildren(...bilanDuProfil()));

  const remiseAZero = document.createElement("button");
  remiseAZero.className = "bouton bouton--discret";
  remiseAZero.textContent = "Remettre la progression à zéro";
  remiseAZero.addEventListener("click", () => {
    if (!confirm(`Effacer toute la progression de ${progression.profilActif()} ?`)) return;
    progression.remetAZero();
    remiseAZero.textContent = "Progression effacée";
  });
  bloc.append(remiseAZero);

  return bloc;
};

export const ouvreLesReglages = () => {
  document.querySelector(".panneau-reglages")?.remove();

  const panneau = document.createElement("dialog");
  panneau.className = "panneau panneau-reglages";

  const entete = document.createElement("div");
  entete.className = "panneau__entete";
  entete.innerHTML = `<p class="panneau__titre">Réglages</p>`;

  const fermer = document.createElement("button");
  fermer.className = "bouton bouton--discret bouton--icone";
  fermer.setAttribute("aria-label", "Fermer");
  fermer.textContent = "✕";
  fermer.addEventListener("click", () => panneau.close());
  entete.append(fermer);

  const corps = document.createElement("div");
  corps.className = "panneau__corps";

  const courants = reglages();

  corps.append(
    sectionNiveau(),
    groupeDeSegments(
      "Nombre de réponses",
      "Moins de choix, c'est plus facile.",
      [2, 3, 4, 5].map((n) => ({ valeur: n, libelle: String(n) })),
      courants.nombreDeChoix,
      (valeur) => modifieUnReglage("nombreDeChoix", valeur)
    ),
    groupeDeSegments(
      "Lettres",
      "On commence par les majuscules à l'école maternelle.",
      [
        { valeur: "majuscules", libelle: "ABC" },
        { valeur: "minuscules", libelle: "abc" },
      ],
      courants.casse,
      (valeur) => modifieUnReglage("casse", valeur)
    ),
    sectionVoix(),
    groupeDeSegments(
      "Sons",
      null,
      [
        { valeur: true, libelle: "Activés" },
        { valeur: false, libelle: "Coupés" },
      ],
      courants.sons,
      (valeur) => modifieUnReglage("sons", valeur)
    ),
    groupeDeSegments(
      "Animations",
      "Les confettis et les effets de victoire.",
      [
        { valeur: true, libelle: "Activées" },
        { valeur: false, libelle: "Réduites" },
      ],
      courants.animations,
      (valeur) => modifieUnReglage("animations", valeur)
    ),
    sectionProfils(),
    sectionParent()
  );

  panneau.append(entete, corps);
  document.body.append(panneau);
  panneau.showModal();

  panneau.addEventListener("close", () => panneau.remove());
};

/* ------------------------------------------------------------------ */
/* Célébration de fin de manche                                        */
/* ------------------------------------------------------------------ */

export const celebre = ({ texte, emoji = "🎉", autocollants = [], surSuite }) => {
  const voile = document.createElement("div");
  voile.className = "victoire victoire--visible";

  const emojiElement = document.createElement("p");
  emojiElement.className = "victoire__emoji";
  emojiElement.textContent = emoji;

  const texteElement = document.createElement("p");
  texteElement.className = "victoire__texte";
  texteElement.textContent = texte;

  voile.append(emojiElement, texteElement);

  autocollants.forEach((autocollant) => {
    const recompense = document.createElement("p");
    recompense.className = "victoire__recompense";
    recompense.textContent = `${autocollant.emoji} Nouvel autocollant : ${autocollant.nom}`;
    voile.append(recompense);
  });

  const suite = document.createElement("button");
  suite.className = "bouton";
  suite.textContent = "Continuer";
  suite.addEventListener("click", () => {
    voile.remove();
    surSuite?.();
  });
  voile.append(suite);

  document.body.append(voile);
  suite.focus();

  return voile;
};

/* ------------------------------------------------------------------ */
/* Sélecteur de thème                                                  */
/* ------------------------------------------------------------------ */

export const construitLeSelecteurDeThemes = (surChangement) => {
  const liste = document.createElement("div");
  liste.className = "themes";

  themes.forEach((theme) => {
    const vignette = document.createElement("button");
    vignette.className = "theme-vignette";
    vignette.setAttribute("aria-pressed", String(theme.id === themeActif().id));
    vignette.innerHTML = `
      <span class="theme-vignette__emoji" aria-hidden="true">${theme.vignette}</span>
      <span class="theme-vignette__nom">${theme.nom}</span>
    `;

    vignette.addEventListener("click", () => {
      choisitLeTheme(theme.id);
      liste.querySelectorAll(".theme-vignette").forEach((autre) => autre.setAttribute("aria-pressed", "false"));
      vignette.setAttribute("aria-pressed", "true");
      surChangement?.(theme);
    });

    liste.append(vignette);
  });

  return liste;
};

export const reglagesActuels = reglages;
export const valeursParDefaut = reglagesParDefaut;
