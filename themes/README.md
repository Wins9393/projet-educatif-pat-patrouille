# Thèmes

Un thème fournit **le vocabulaire illustré** dont les mini-jeux ont besoin. Les jeux
ne connaissent aucun personnage : ils demandent au thème actif une liste d'items et
savent les afficher.

## Pourquoi du vocabulaire et non des personnages

La version d'origine faisait épeler des noms propres (MARCUS, ZUMA). Cela ne
fonctionnait que parce que l'enfant connaissait déjà les personnages. Avec des
personnages inventés, le jeu demanderait de mémoriser des noms arbitraires.

Les thèmes reposent donc sur des mots que l'enfant reconnaît déjà : FUSEE, LUNE,
REQUIN, VOLCAN. L'exercice devient du vocabulaire réel, ce qui est à la fois plus
utile et indépendant de toute licence.

## Écrire un thème

```js
export default {
  id: "espace",
  nom: "Espace",
  vignette: "🚀",
  rendu: "emoji",        // "emoji" ou "image"
  decor: "etoiles",      // fond du thème, voir styles/decors.css
  couleurs: { fond: "#0b1a3a", fondClair: "#1e3a6e", accent: "#ffd166" },
  items: [
    { mot: "FUSEE", affichage: "FUSÉE", visuel: "🚀" },
  ],
  collecte: {
    objet: { visuel: "⭐", nom: "étoile", pluriel: "étoiles" },
    receptacle: { visuel: "🌙", nom: "la lune" },
  },
};
```

- `mot` : ce que l'enfant épelle. Majuscules, sans accent ni tiret, car il doit
  correspondre lettre à lettre à ce qui est proposé.
- `affichage` : la forme lisible, accents compris, utilisée à l'oral et sous l'image.
- `visuel` : un emoji, ou un chemin d'illustration (`illustrations/mars.svg`)
  quand aucun emoji ne convient. Le mode est déduit du contenu : un chemin qui
  finit par `.svg` est affiché comme une image, tout le reste comme un emoji.
  Le choix se fait donc mot par mot, sans basculer le thème d'un bloc.
  L'emoji est le défaut, et il l'emporte : si l'emoji montre autre chose que
  le mot, on change le mot pour qu'il corresponde à l'image — 🦢 devient CYGNE,
  pas OIE. Un seul mot garde un dessin, MARS, faute d'emoji et faute de
  remplaçant.
- `collecte` : l'objet à compter et son contenant, pour COMPTER et CALCULER.
  Le contenant peut fournir une `destination` quand « dans » ne convient pas :
  Animaux dit « au chien » plutôt que « dans le chien ».
- `decor` : l'un des fonds de `styles/decors.css` — `etoiles`, `bulles`,
  `feuilles`, `circuits`, `etincelles`, `prairie`, `route`, `douceur`, `pluie`,
  `ondes`, `energie`.
- `couleurs` : la palette appliquée à toute l'interface.

## Choisir les mots

Prévoir des longueurs variées : les mots de trois ou quatre lettres alimentent
les premiers niveaux, les plus longs les derniers. Un même visuel ne doit jamais
servir deux fois dans un thème — en LIRE, deux images identiques rendraient la
question insoluble. `mot` et `affichage` doivent désigner la même chose : un
mot BALLON illustré par une montgolfière fausse l'exercice.

Les deux modes de rendu cohabitent : un thème illustré et un thème emoji
fonctionnent avec exactement le même code de jeu.

## Ajouter un thème au catalogue

Déclarer son import dans `shared/themes.js`. Rien d'autre à modifier.

## L'univers « Tout »

`tout.js` n'est pas un univers comme les autres : il n'a pas de liste de mots,
il la compose à partir du catalogue. Rien à y ajouter quand on crée un univers —
il le reprend tout seul, y compris le pack local s'il est installé.

Il écarte deux choses : un mot déjà présent (PAPILLON est dans quatre univers)
et un visuel déjà pris par un autre mot (LAMPE et AMPOULE sont tous deux 💡).
Sans cela, LIRE poserait des questions sans réponse unique.
