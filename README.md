# Mon carnet — app de Josepha

Une petite appli web installable (PWA) : actions du jour, sommeil, repas, et des licornes à collectionner.
Tout fonctionne sans compte : les données restent **sur le téléphone** (stockage du navigateur).

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | page de l'appli |
| `style.css` | le design « carnet » (rose vif) |
| `app.js` | la logique (plan du jour, tirage des licornes, sommeil, repas) |
| `data.js` | **les listes à modifier** : actions, repas, gestes du matin, règles des fêtes |
| `pieces.js` | les dessins des licornes (têtes, crinières, cornes, accessoires, sets) |
| `sw.js`, `manifest.webmanifest`, `icons/` | installation sur l'écran d'accueil et usage hors ligne |

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt GitHub (par exemple `carnet`), public.
2. Envoie-y **tout le contenu de ce dossier** (le fichier `index.html` doit être à la racine du dépôt).
3. Dans le dépôt : **Settings → Pages → Build and deployment → Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une minute, l'adresse est `https://TON-PSEUDO.github.io/carnet/`.
5. Sur le téléphone Android (Chrome) : ouvre l'adresse, menu **⋮ → Installer l'application** (ou « Ajouter à l'écran d'accueil »).

## Modifier les listes

Ouvre `data.js` :
- `ACTIONS` : `A('id','Texte','catégorie',effort,fréquence)`. Catégories qui rapportent des licornes : `soi`, `maison`, `courses`, `admin`, `dehors`, `bienetre`. Les `loisir` sont des pauses sans récompense. Effort : 1 léger, 2 moyen, 3 costaud. Fréquence : tous les N jours.
- `MEALS.s` (sans cuisine) et `MEALS.l` (peu de cuisine).
- `GESTES` : le premier geste proposé après le réveil.
- `SET_RULES` : les dates des sets de fête (fenêtre de 5 jours avant et 5 jours après, jamais affichée dans l'appli).

Josepha peut aussi ajouter ses propres actions et recettes directement dans l'appli (⚙ Réglages, et l'onglet Alimentation).

## Les règles du jeu (tirage des licornes)

- Une licorne toutes les **5 actions** faites (essentielles et bien-être ; les loisirs ne comptent pas).
- Pour chaque licorne : **80 %** du temps, la tête, la crinière et la corne sont de la **même rareté** ; **20 %** du temps, tirage libre sur toutes les pièces.
- Chaque pièce a la **même chance** : la rareté vient du nombre de pièces (22 communes, 12 rares, 7 épiques par emplacement).
- **Jamais deux fois la même licorne.**
- **Sets de fête** : la première licorne gagnée dans la fenêtre de 10 jours autour d'une fête est le set complet (Noël, Pâques, Halloween, Anniversaire, Nouvel An, Rois, Saint-Valentin, Carnaval). Les années suivantes, elle reçoit l'accessoire de la fête sur une licorne tirée au hasard. L'anniversaire se règle dans ⚙ Réglages.
- **Sets de thème** (hypothèse à valider) : *Jardin en fleurs* à la 30e licorne, *Nuit gothique* à la 60e (`MILESTONES` dans `data.js`).

## Sommeil

- Le **réveil sonne sur le téléphone** (appli Horloge). Le bouton « Régler l'alarme du téléphone » tente d'ouvrir l'Horloge d'Android avec l'heure choisie (**à tester** : sinon, règle-la à la main).
- Dans l'appli, « Je me lève » demande 5 appuis puis un premier geste, et enregistre l'heure du lever.
- **Heures miroir** : 12 créneaux (08h08 à 19h19). On choisit l'heure dans le menu puis on valide, jusqu'à **1 h après** l'heure miroir. Le bouton « Ajouter les rappels au calendrier » télécharge un fichier `.ics` à importer dans Google Agenda : il crée les 12 rappels quotidiens (une appli web ne peut pas faire sonner de rappels toute seule quand elle est fermée).

## Mise à jour de l'appli

Après chaque modification, renvoie les fichiers sur GitHub. L'appli récupère la nouvelle version à l'ouverture suivante quand le téléphone est en ligne.

## Limites actuelles

- Pas de sauvegarde ni de synchronisation (prévu après les premiers tests) : effacer les données du navigateur efface la progression.
- Les polices (Caveat, Nunito) viennent de Google Fonts : hors ligne, l'appli utilise des polices de secours.
- **À faire avant diffusion** : ajouter le crédit et la licence exacts du jeu d'émojis d'origine des licornes (voir la source du SVG).
