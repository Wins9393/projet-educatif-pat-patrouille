# Illustrations en réserve

Ces dessins respectent la [charte](../CHARTE.md) mais ne sont pas utilisés :
le mot qu'ils illustrent est rendu par un emoji, plus lisible et plus familier
aux enfants.

Ils restent ici parce qu'ils sont prêts à l'emploi. Pour en remettre un en
service : le déplacer dans `assets/illustrations/`, pointer l'item du thème
dessus (`visuel: "illustrations/mot.svg"`) et l'ajouter au précache du
`service-worker.js`.

Un mot ne passe en illustration que si aucun emoji ne le nomme **et** qu'aucun
autre mot ne peut prendre sa place. Quand l'emoji montre autre chose, on change
le mot plutôt que l'image : 🦢 est devenu CYGNE, 🌰 NOISETTE, 🧊 GLAÇON. Un seul
dessin reste en service, `mars.svg` : aucun emoji ne montre la planète, et aucun
mot d'univers spatial ne pouvait la remplacer.
