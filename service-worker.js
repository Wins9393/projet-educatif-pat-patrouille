/**
 * Mise en cache hors ligne.
 *
 * Le noyau (pages, styles, scripts, sons) est précaché à l'installation ;
 * le reste — visuels des thèmes — est mis en cache au fil de l'utilisation.
 */
const VERSION = "petits-mondes-v14";
const NOYAU = [
  "./",
  "./index.html",
  "./index.js",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/polices/fredoka-latin.woff2",
  "./particles/particles-options.js",
  "./vendor/confetti.min.js",
  "./styles/accueil.css",
  "./styles/base.css",
  "./styles/decors.css",
  "./styles/jeux.css",
  "./styles/panneaux.css",
  "./views/ecrire.html",
  "./views/lire.html",
  "./views/compter.html",
  "./views/calculer.html",
  "./views/memory.html",
  "./controllers/ecrire.js",
  "./controllers/lire.js",
  "./controllers/compter.js",
  "./controllers/calculer.js",
  "./controllers/memory.js",
  "./shared/aleatoire.js",
  "./shared/chemins.js",
  "./shared/confettis.js",
  "./shared/interface.js",
  "./shared/jeu.js",
  "./shared/niveaux.js",
  "./shared/progression.js",
  "./shared/reactif.js",
  "./shared/reglages.js",
  "./shared/reprise.js",
  "./shared/rendu.js",
  "./shared/sons.js",
  "./shared/themes.js",
  "./shared/voix.js",
  "./themes/animaux.js",
  "./themes/tout.js",
  "./themes/dinosaures.js",
  "./themes/espace.js",
  "./themes/ferme.js",
  "./themes/fetes.js",
  "./themes/fruits.js",
  "./themes/jungle.js",
  "./themes/maison.js",
  "./themes/meteo.js",
  "./themes/musique.js",
  "./themes/nature.js",
  "./themes/ocean.js",
  "./themes/princesses.js",
  "./themes/robots.js",
  "./themes/sports.js",
  "./themes/vehicules.js",
  "./assets/illustrations/mars.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      // Une ressource absente ne doit pas faire échouer toute l'installation.
      await Promise.allSettled(NOYAU.map((url) => cache.add(url)));
      self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter((nom) => nom !== VERSION).map((nom) => caches.delete(nom))))
      .then(() => self.clients.claim())
  );
});

/**
 * Réponse immédiate depuis le cache, mise à jour en arrière-plan.
 *
 * Un cache-first strict servirait indéfiniment une version périmée : ici la
 * page s'affiche sans attendre le réseau, et la version suivante est déjà à
 * jour au prochain lancement.
 */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const requete = e.request;
  if (new URL(requete.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const enCache = await cache.match(requete);

      const surLeReseau = fetch(requete)
        .then((reponse) => {
          if (reponse.ok) cache.put(requete, reponse.clone());
          return reponse;
        })
        .catch(() => null);

      if (enCache) return enCache;

      const reponse = await surLeReseau;
      if (reponse) return reponse;

      // Hors ligne et jamais visité : on renvoie l'accueil s'il est en cache.
      return (await cache.match("./index.html")) ?? Response.error();
    })
  );
});
