# Charte visuelle des illustrations

Les visuels du jeu sont des emoji. Une illustration ne prend le relais que
lorsqu'aucun emoji ne nomme le mot **et** qu'aucun autre mot ne peut prendre sa
place — un seul cas aujourd'hui, la planète Mars. Les autres dessins attendent
en réserve.

Elles s'adressent à des enfants de 3 à 7 ans qui ne lisent pas encore :
**l'image doit nommer l'objet à elle seule**, sans légende et sans hésitation
possible. Elle doit en plus tenir la comparaison avec les emoji qui l'entourent —
même encombrement, même densité de couleur, même relief.

Trois exigences, dans cet ordre :

1. **Reconnaissable en une seconde.** Si un adulte hésite une demi-seconde, un
   enfant ne reconnaîtra pas.
2. **Fidèle au réel.** Les proportions et les couleurs sont celles de l'objet, pas
   celles d'un pictogramme. Une carotte est orange à fanes vertes, jamais un
   triangle orange.
3. **Simple.** On garde ce qui distingue l'objet, on retire le reste.

---

## Format

- `viewBox="0 0 120 120"`, toujours carré.
- **Marge de sécurité de 8 unités** sur les quatre bords : rien d'important
  au-delà de `x<8`, `x>112`, `y<8`, `y>112`.
- Le sujet occupe **75 à 90 %** de la hauteur utile. Un sujet trop petit se perd,
  un sujet à ras bord paraît coupé.
- Sujet **centré horizontalement**, posé optiquement sur la ligne `y≈100` quand il
  a un « sol » (animal, véhicule, objet posé). Ce qui vole ou flotte est centré
  verticalement.
- Objet **de trois quarts ou de profil**, jamais en perspective complexe. Le profil
  est souvent le plus lisible pour un animal, le trois quarts pour un véhicule.

## Ombre au sol

Tout sujet posé porte la même ombre, qui l'ancre et donne la profondeur :

```xml
<ellipse cx="60" cy="110" rx="30" ry="5.5" fill="#000" opacity="0.18"/>
```

`rx` s'adapte à la largeur du sujet (environ 40 % de sa largeur). Un sujet qui vole
n'a pas d'ombre au sol.

## Couleur

- **Couleurs réelles de l'objet.** On ne stylise pas la teinte : le citron est
  jaune citron, la vache noire et blanche.
- **Trois à cinq teintes par illustration**, plus les nuances de volume. Au-delà,
  le dessin devient bruité à petite taille.
- Les couleurs restent **franches et saturées** — les tons pastel ou grisés
  passent mal sur les fonds sombres des thèmes.
- Chaque teinte se décline en trois valeurs : claire (lumière), moyenne (base),
  foncée (ombre). Écart d'environ 15 % de luminosité entre chacune.

## Volume

C'est ce qui donne l'aspect fini. Trois moyens, toujours les mêmes :

**1. Un dégradé de base** sur les grandes surfaces, la lumière venant du haut à gauche :

```xml
<radialGradient id="mars-corps" cx="36%" cy="32%" r="78%">
  <stop offset="0"   stop-color="#ff9d5c"/>  <!-- clair -->
  <stop offset="55%" stop-color="#e5642f"/>  <!-- base  -->
  <stop offset="100%" stop-color="#a63a17"/> <!-- ombre -->
</radialGradient>
```

**2. Un reflet**, petite forme claire en haut à gauche, `opacity` entre 0.5 et 0.8 :

```xml
<circle cx="49" cy="46" r="5" fill="#fff" opacity="0.7"/>
```

**3. Un contour sombre** sur la silhouette principale : la teinte de base assombrie,
jamais du noir. Épaisseur **3 à 4 unités**, `opacity` 0.4 à 0.6. Il détache le sujet
des fonds animés.

## Traits

- Épaisseur **4 à 6** pour les traits structurants (membres, tiges, câbles),
  **3 à 4** pour les détails.
- Toujours `stroke-linecap="round"` et `stroke-linejoin="round"` : aucun angle vif.
- Jamais de trait inférieur à 3 : il disparaît à 48 px.

## Niveau de détail

**Trois à cinq éléments distinctifs, pas davantage.** On identifie ce qui fait
reconnaître l'objet et on ne dessine que ça.

| Sujet | Ce qu'on garde | Ce qu'on retire |
| --- | --- | --- |
| Mars | disque roux, calotte polaire, deux ou trois cratères | relief fin, atmosphère, étoiles |
| Vache | corps blanc, taches noires, museau rose, cornes | pis, poils, expression détaillée |
| Fusée | cône rouge, corps blanc, hublot, ailerons, flamme | rivets, inscriptions, étages |
| Guitare | caisse en 8, rosace, manche, cordes | mécaniques, frettes, veinage |

Un enfant reconnaît une vache à ses taches, pas à son anatomie.

## Visages et animaux

- **Yeux ronds, sombres, avec un reflet blanc** en haut à gauche. Deux points sans
  reflet donnent un regard mort.
- Yeux placés dans le tiers supérieur, écartés d'environ une largeur d'œil.
- **Expression neutre ou légèrement souriante.** Jamais d'expression forte : le
  dessin sert de mot de vocabulaire, pas de personnage.
- Pas de bouche ouverte, pas de dents, sauf si c'est le trait distinctif de
  l'animal (requin, crocodile).
- Animaux de profil ou de trois quarts, jamais de face stricte — sauf les félins
  et primates, plus lisibles de face.

## Ce qui est interdit

- **Aucun texte, aucune police.** Le rendu dépendrait des polices du système.
- **Aucun filtre** (`feGaussianBlur`, `filter`) : coûteux et rendu variable selon
  les navigateurs. Le flou se simule avec un dégradé.
- Aucune image bitmap intégrée.
- Aucune couleur en dehors du sujet : pas de fond, pas de cadre, pas de cartouche.
  Le fond est transparent, le décor du thème doit rester visible.
- Aucune transparence globale sur le sujet : seuls les reflets et les ombres
  utilisent `opacity`.

## Contraintes techniques

- Attributs `role="img"` et `aria-label="<nom en français>"` sur la balise `<svg>`.
- **Identifiants préfixés par le nom du fichier** : `id="mars-corps"`, jamais
  `id="grad1"`. Deux SVG inlinés dans la même page se voleraient leurs dégradés.
- Pas de déclaration XML ni de commentaire superflu : le fichier doit rester
  sous **2 Ko**.
- Coordonnées entières ou à une décimale.
- Ordre de dessin : ombre au sol, masses de fond, masses principales, détails,
  reflets.

## Contrôle avant validation

1. **Réduire à 48 px.** L'objet doit rester identifiable. C'est le test décisif :
   la plupart des jeux affichent les réponses à cette taille.
2. **Poser sur fond sombre et sur fond clair.** Le contour doit détacher le sujet
   dans les deux cas.
3. **Le faire nommer.** Montrer l'image seule et demander « c'est quoi ? ». Si la
   réponse n'est pas le mot attendu, l'illustration est à refaire.
4. **Comparer aux voisines du thème.** Même épaisseur de trait, même niveau de
   détail, même traitement du volume.

## Squelette de référence

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Nom">
  <defs>
    <radialGradient id="nom-corps" cx="36%" cy="32%" r="76%">
      <stop offset="0" stop-color="#CLAIR"/>
      <stop offset="55%" stop-color="#BASE"/>
      <stop offset="100%" stop-color="#OMBRE"/>
    </radialGradient>
  </defs>
  <ellipse cx="60" cy="110" rx="30" ry="5.5" fill="#000" opacity="0.18"/>
  <!-- masses principales -->
  <!-- détails distinctifs -->
  <!-- reflet -->
</svg>
```
