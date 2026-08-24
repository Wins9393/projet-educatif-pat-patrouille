# Les Petits Mondes

Six mini-jeux pour apprendre à **lire, écrire, compter et assembler**, dans seize univers
que l'enfant choisit : espace, océan, dinosaures, robots, princesses, ferme,
jungle, fruits et légumes, véhicules, maison, nature, sports, musique, météo,
fêtes, animaux — ou **Tout**, qui les mélange.

Application web sans dépendance ni build : un serveur statique suffit.
Installable comme application et jouable hors ligne.

## Les jeux

| Jeu | Ce que fait l'enfant |
| --- | --- |
| **ÉCRIRE** | Une image, un mot à composer lettre après lettre |
| **LIRE** | Un mot écrit, l'image correspondante à retrouver |
| **COMPTER** | Des objets à dénombrer, le bon nombre à désigner |
| **CALCULER** | Une quantité à composer, puis de vraies opérations |
| **MEMORY** | Des paires d'images à retrouver, et leur mot à entendre |
| **PUZZLE** | Une grille à remplir avec un set de formes, qu'on fait pivoter |

Chaque bonne réponse rapporte une étoile et fait progresser vers l'autocollant
suivant.

## Niveaux

Un seul réglage fait évoluer les cinq jeux ensemble.

| Niveau | Âge | Mots | Quantités | Calcul |
| --- | --- | --- | --- | --- |
| 🌱 Découverte | 3-4 ans | 4 lettres max | jusqu'à 5 | quantité à composer |
| 🍀 Apprenti | 4-5 ans | 5 lettres max | jusqu'à 9 | quantité à composer |
| 🧭 Explorateur | 5-6 ans | 7 lettres max | jusqu'à 12 | additions |
| 🎯 Aventurier | 6-7 ans | 9 lettres max | jusqu'à 16 | additions, soustractions |
| 🏆 Champion | 7 ans et + | tous | jusqu'à 20 | les quatre opérations |

MEMORY suit le même réglage : 3 paires au premier niveau, 10 au dernier.

PUZZLE aussi, sur deux axes à la fois : la grille passe de 3 × 3 à 6 × 6, et
les petites pièces disparaissent — le carré seul, qui bouche n'importe quel
trou, n'existe qu'au premier niveau. À partir du troisième, une manche sur
deux se joue sur une silhouette plutôt qu'un rectangle.

Aux deux premiers niveaux, CALCULER se joue en manipulant des jetons — on
compose une quantité en la touchant. À partir du troisième, l'opération est
posée, et les petites additions et soustractions restent illustrées par les
objets du thème.

En ÉCRIRE, le mot est écrit sous l'image et prononcé jusqu'au niveau 3, et le
🔊 dicte en plus la lettre à chercher. À partir du quatrième, les deux aides
tombent : le mot est masqué — l'image suffit à le nommer, et le reconnaître
fait partie de l'exercice — et le 🔊 ne souffle plus que le mot. Dicter la
lettre reviendrait à donner la réponse coup par coup : l'enfant finirait le mot
sans jamais l'épeler.

## Démarrer

Un serveur statique suffit — les modules ES et le service worker ne fonctionnent
pas en `file://` :

```bash
python3 -m http.server 5181
```

Puis ouvrir <http://localhost:5181>.

## Les univers

Un univers fournit le **vocabulaire illustré** des jeux — 277 mots au total. Le
choix du vocabulaire plutôt que de personnages est délibéré : un enfant
reconnaît FUSÉE ou REQUIN sans qu'on ait à le lui apprendre, alors qu'un
personnage inventé demanderait de mémoriser un nom arbitraire. Les mots
travaillés sont donc utiles en eux-mêmes.

Chaque univers apporte sa palette et son **fond** (ciel étoilé, bulles, pluie,
étincelles…), le tout en CSS, sans une seule image.

Ces fonds ont été animés, puis figés. Deux calques plein écran qui dérivent en
continu tiennent le processus graphique du navigateur éveillé en permanence :
sur un portable, la machine chauffe pour un mouvement que personne ne regarde.
Peints une fois, ils donnent la même identité pour rien.

Un dix-septième univers, **Tout**, mélange le vocabulaire de tous les autres.
Il n'a pas de liste de mots à lui : il compose la sienne à partir du catalogue,
en prenant un mot dans chaque univers à tour de rôle. Il suit donc les autres
automatiquement, et écarte les répétitions — PAPILLON est dans quatre univers,
LAMPE et AMPOULE partagent le même emoji.

## Emoji d'abord, et le mot suit

Les visuels sont des **emoji**. Ils sont expressifs, familiers, colorés, et
l'appareil les affiche nets à n'importe quelle taille sans rien télécharger.

Quand un emoji ne nomme pas le mot, ce n'est pas l'image qu'on remplace, c'est
**le mot**. 🦢 est un cygne, pas une oie : le mot devient CYGNE. 🌰 est une
noisette, 🧊 un glaçon, 🐊 un crocodile — chaque fois, le vocabulaire s'aligne
sur ce que l'image montre vraiment. C'est gratuit, c'est immédiat, et l'enfant
apprend un mot juste plutôt qu'un mot approximatif.

Quand aucun mot ne convient, le mot sort de son univers. Deux mots qui se
partageaient un emoji, un emoji trop récent pour s'afficher partout : dans les
deux cas le mot est retiré plutôt que rafistolé.

Il reste **une seule illustration dessinée** : `mars.svg`. Aucun emoji ne nomme
la planète — 🔴 n'est qu'un rond rouge — et aucun autre mot ne pouvait la
remplacer dans un univers spatial. Elle suit la charte décrite dans
[assets/illustrations/CHARTE.md](assets/illustrations/CHARTE.md).

`assets/illustrations/reserve/` garde les 253 dessins réalisés en chemin. Ils
sont conformes à la charte et prêts à reprendre du service : le déplacer dans
`assets/illustrations/`, pointer l'item dessus, l'ajouter au précache.

Ajouter un univers tient en un fichier dans `themes/`. Le format est décrit dans
[themes/README.md](themes/README.md).

## Un puzzle qui ne peut pas être insoluble

Si les pièces du PUZZLE étaient tirées au hasard, la grille serait insoluble
une fois sur deux. Et un enfant de cinq ans devant un puzzle impossible ne
conclut pas que le programme a un bug : il conclut qu'il est nul.

Alors on ne tire pas les pièces, **on découpe la grille**. Un remplissage
complet par retour sur trace, dans `shared/decoupe.js`, et les morceaux
obtenus *sont* le jeu. La solution existe par construction, et l'enfant en
trouvera peut-être une autre.

Deux détails font la différence entre une découpe qui marche et une découpe
jouable. Une seule pose est possible à chaque étape — la première case de la
pièce doit couvrir la première case libre — ce qui réduit l'arbre de recherche
à presque rien. Et le tirage est pondéré par la taille : sans ça, la grille
revient en pluie de miettes.

`decoupe()` travaille sur **un ensemble de cases quelconque**, pas sur un
rectangle. C'est ce qui rend les silhouettes presque gratuites : un rectangle
n'est qu'une silhouette pleine, et c'est le même chemin de code.

Les pièces tournent, elles ne se retournent jamais. Le bois se retourne, pas
un écran : distinguer un L de son miroir par la pensée est un exercice d'un
autre âge. L et J sont donc deux pièces distinctes, S et Z aussi — et la
découpe puise dans exactement le même jeu que celui remis à l'enfant.

Les vingt-deux silhouettes de `shared/silhouettes.js` se dessinent en toutes
lettres et se relisent d'un coup d'œil. Aucune ne descend sous une quinzaine
de cases : un bateau de neuf cases est une tache. Chacune est vérifiée à la
fabrication, jamais à l'exécution — un isthme d'une seule case tue le pavage
par pentominos et ne se voit pas à l'œil nu.

## Attraper, pivoter, poser

Un enfant ne fait pas la différence entre un toucher et un glissement, et son
doigt encore moins : un « toucher » dérive presque toujours de trois pixels,
et un « glissement » commence toujours par un appui immobile. Deux
gestionnaires en concurrence donneraient des sélections fantômes et des pièces
qui restent collées. `shared/glissement.js` n'expose donc **qu'un seul geste à
deux issues** : l'appui ouvre un glissement candidat, qui devient une prise
au-delà de huit pixels et retombe en simple toucher s'il est relâché avant.

Le mouvement est suivi **sur la fenêtre, pas sur la pièce**. Déplacer un
élément dans le DOM lui retire sa capture du pointeur : la spécification le
dit, Firefox l'applique, Chrome laisse passer. Or la pièce voyage jusqu'au
`body` à l'instant où on la soulève — écoutée sur elle-même, elle ne recevrait
jamais son relâchement et resterait collée au curseur. La capture est
redemandée après le déménagement, pour le seul cas que la fenêtre ne couvre
pas : un doigt relâché en dehors d'elle.

Une seule règle d'ancrage, aussi : **la case que tu tiens est la case où tu
poses**. C'est la seule qui reste vraie sur un L, dont le coin haut-gauche du
cadre est vide, et elle couvre les trois façons de poser — la case attrapée en
glissant, la case touchée dans le bac, la première case au clavier. La pièce
prend la taille du plateau dès qu'on la soulève, monte un peu au-dessus du
doigt qui la cacherait, et les cases visées s'éclairent en vert avant qu'on
lâche.

Une pose ratée n'est pas une erreur : elle n'est jamais enregistrée comme
telle. Au puzzle, essayer une case n'est pas se tromper, et compter ces essais
fausserait l'espace parent. La pose est même indulgente — si la case visée ne
convient pas, les huit voisines sont essayées avant de rendre la pièce.

Tout se joue aussi au clavier : les flèches déplacent un curseur, `Entrée`
pose, `R` pivote, `Retour arrière` reprend la pièce sous le curseur. Les trois
chemins débouchent sur une seule fonction. C'est une leçon déjà payée ici : le
clavier de CALCULER doublait la logique du glisser et oubliait la sauvegarde.

## Papier et blocs

L'interface était en verre dépoli : des surfaces translucides floutées sur un
dégradé sombre. C'est devenu l'inverse.

- **Un aplat par univers.** Une seule couleur pleine, sans dégradé. C'est elle
  qui porte l'identité du thème, et elle porte bien plus loin qu'une pastille.
- **Des blocs opaques.** Tout ce sur quoi on appuie est un bloc blanc posé sur
  une **lèvre** — une ombre nette, sans flou, qui lui donne son épaisseur. Au
  clic, le bloc descend et la lèvre s'écrase : le bouton s'enfonce vraiment.
- **Une seule couleur d'action**, le même jaune dans les dix-huit univers. Un
  enfant l'apprend une fois : jaune, c'est là qu'on appuie. Le vert ne dit que
  « c'est ça », le rouge que « pas celui-là ».
- **Zéro `backdrop-filter`.** Il y en avait neuf déclarations, et trente
  éléments floutés rien que sur l'accueil. C'est l'effet le plus coûteux d'une
  page, et il n'en reste rien.

Le contraste est vérifié sur les dix-huit univers : le texte blanc sur l'aplat
et sur la barre tient au moins 4,5:1, l'encre sur un bloc monte à 15,7:1.

## Sons et voix

Les sons de retour sont **synthétisés en Web Audio** : aucun fichier à
télécharger, aucune licence, et un timbre volontairement doux — un enfant se
trompe souvent, le son d'erreur ne doit pas sonner comme une punition.

Les consignes sont lues à voix haute. La qualité des voix varie beaucoup d'un
appareil à l'autre : les réglages permettent de choisir la voix, de l'écouter
avant de valider, et de régler le débit. Sur iPad et Mac, des voix nettement
meilleures s'installent dans *Réglages ▸ Accessibilité ▸ Contenu énoncé*.

## Réglages

Accessibles par l'engrenage, conservés d'une session à l'autre :

- **Niveau** — voir le tableau plus haut
- **Nombre de réponses** (2 à 5)
- **Majuscules ou minuscules**
- **Voix** — activation, choix de la voix, débit
- **Sons** et **animations**
- **Profils** — plusieurs enfants, chacun sa progression
- **Espace parent** — réussites, taux de bonnes réponses, mots qui coincent

## Accessibilité

- Tout se joue au clavier : les réponses sont des boutons, les jetons se posent
  avec Entrée
- Chaque visuel porte une alternative textuelle
- `prefers-reduced-motion` fige les décors et les animations
- Cibles tactiles d'au moins 44 px

## Reprendre une manche interrompue

Un rechargement effaçait l'exercice en cours : le mot à moitié écrit, les
paires déjà retournées, les jetons posés. On aurait pu demander confirmation
avant de quitter, mais ça ne couvre que le geste volontaire d'un adulte devant
un clavier. Le cas qui fait vraiment mal — l'application web mise en arrière-
plan puis déchargée par le système, fréquent sur iPad — ne demande rien à
personne.

Alors plutôt que d'empêcher le rechargement, on le rend indolore. Chaque coup
écrit un instantané de la manche dans `shared/reprise.js`, et l'écran repart
d'où il s'était arrêté. Ça couvre du même geste le plantage et la batterie
vide.

L'instantané est écarté dès qu'il n'a plus de sens : un autre jeu, un univers
ou un niveau changés entre-temps, un autre enfant aux commandes, ou une manche
vieille de plus de deux heures. Il est effacé dès que la manche est gagnée.

Ce qui est conservé se limite au strict nécessaire — le mot et l'avancée pour
ÉCRIRE, la grille de choix pour LIRE et COMPTER, l'opération et les jetons
posés pour CALCULER, l'ordre des cartes et les paires trouvées pour MEMORY, le
plateau et la position de chaque pièce pour PUZZLE.

## Interface réactive sans framework

Garder l'écran en accord avec l'état — le travail d'un React — tient ici en
trois pièces :

1. **Une source de vérité qui s'annonce.** Toute écriture passe par
   `shared/progression.js` ou `shared/reglages.js`, qui émettent un événement
   sur `window`. C'est le magasin et le canal d'abonnement, en deux lignes.
2. **De petites fonctions qui refont leur fragment.** Aucune comparaison
   d'arbres : une ligne de statistiques ou une liste de cinq mots se
   reconstruit plus vite qu'elle ne se compare.
3. **Un abonnement qui meurt avec le fragment**, dans `shared/reactif.js`.

Le troisième point est le seul qui demande de l'attention. `resteAJour` prend
l'élément qu'il maintient, et **coupe l'abonnement dès que cet élément quitte
le document**. On aurait pu le raccrocher à un événement de fermeture, mais
c'est fragile : un nœud simplement retiré du DOM n'en émet aucun, et tous les
chemins de suppression ne passent pas par le même endroit. Un panneau rouvert
dix fois laisserait sinon dix écouteurs derrière lui, chacun redessinant un
fragment que plus personne ne regarde.

```js
resteAJour(contenu, () => contenu.replaceChildren(...bilanDuProfil()));
```

C'est tout ce qu'il faut pour que changer de profil mette à jour l'espace
parent, les mots difficiles et le score de la barre en même temps.

## Organisation

```
index.html / index.js      accueil : jeux, univers, progression
views/ + controllers/      un écran et un contrôleur par mini-jeu
shared/                    tirages, niveaux, rendu, sons, voix, confettis,
                           progression, réglages, interface, réactivité, reprise,
                           formes et découpe du puzzle, silhouettes, glissement
themes/                    les seize univers, plus « Tout » qui les mélange
styles/                    fondations, décors de thème, accueil, jeux, panneaux
assets/illustrations/      Mars, la réserve de dessins et la charte
service-worker.js          cache hors ligne
vendor/                    tsParticles (confettis), copie locale
assets/polices/            Fredoka (SIL OFL), servie en local
```

## Licence des contenus

Le code et les illustrations sont publiés sous licence MIT : les dessins ont été
réalisés pour ce projet, sans reprendre d'œuvre existante. Les emoji sont ceux
du système, ils ne sont pas redistribués. La police Fredoka est
sous SIL Open Font License.

Un pack local sous licence peut être posé dans `themes/` : il est exclu du dépôt
par `.gitignore` et reste sur la machine.
