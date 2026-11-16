'use strict';
/* Données modifiables : actions, repas, gestes, règles des sets.
   cat : soi, maison, courses, admin, dehors (essentielles) · bienetre · loisir (sans récompense)
   e : effort 1 (léger), 2 (moyen), 3 (costaud) · f : tous les f jours */
const A=(id,n,cat,e,f)=>({id,n,cat,e,f});
const ACTIONS=[
 A('dents','Se brosser les dents','soi',1,1),A('changer','Se changer','soi',1,1),A('affaires','Préparer ses affaires du lendemain','soi',1,1),
 A('douche','Prendre une douche','soi',2,2),A('cheveux','Se laver les cheveux','soi',2,7),A('ongles','Couper les ongles','soi',1,7),
 A('ranger5','Ranger 5 objets','maison',1,1),A('vaisselle','Faire la vaisselle','maison',3,1),A('poubelles','Sortir les poubelles','maison',1,1),
 A('lessive','Lancer une lessive','maison',2,7),A('linge','Étendre ou plier le linge','maison',2,7),A('draps','Changer les draps','maison',3,7),
 A('aspi','Passer l’aspirateur','maison',3,7),A('sdb','Nettoyer la salle de bain 5 min','maison',3,7),A('perimes','Jeter les aliments périmés','maison',1,7),
 A('liste','Faire la liste de courses','courses',1,7),A('courses','Faire les courses','courses',3,7),A('rangercourses','Ranger les courses','courses',2,7),
 A('agenda','Regarder son agenda de la semaine','admin',1,7),A('courrier','Ouvrir le courrier et les mails importants','admin',2,7),
 A('msg','Répondre à un message important','admin',2,7),A('banque','Vérifier son compte en banque','admin',2,7),
 A('facture','Payer ou régler une facture','admin',2,7),A('rdv','Prendre ou confirmer un rendez-vous','admin',2,7),
 A('sortir','Sortir de chez soi, même 5 minutes','dehors',2,1),
 A('marche','Marcher 10 minutes','bienetre',2,2),A('etire','Faire des étirements 5 minutes','bienetre',1,2),A('respi','Respirer 3 minutes','bienetre',1,2),
 A('lumiere','Prendre 10 minutes de lumière du jour','bienetre',1,2),A('eau','Boire un grand verre d’eau','bienetre',1,1),
 A('parler','Parler à quelqu’un (appel ou message)','bienetre',2,2),A('ressenti','Parler de ce que je ressens','bienetre',2,3),
 A('journee','Raconter ma journée','bienetre',1,2),A('vocal','Envoyer un vocal à une amie','bienetre',1,3),
 A('positif','Noter 3 choses positives','bienetre',1,2),A('ecrire','Écrire ce qui me préoccupe','bienetre',2,3),A('chanson','Choisir une chanson qui fait du bien','bienetre',1,3),
 A('episode','Regarder un épisode','loisir',1,1),A('youtube','Regarder une vidéo YouTube','loisir',1,1),A('musique','Écouter de la musique ou une playlist','loisir',1,1),
 A('podcast','Écouter un podcast','loisir',1,1),A('jeu','Jouer à un jeu mobile 10 minutes','loisir',1,1),A('colorier','Colorier ou gribouiller','loisir',1,1),
 A('photos','Regarder des photos','loisir',1,1),A('lire','Lire quelques pages','loisir',1,1),A('bain','Un bain ou un moment sous la couette avec une boisson chaude','loisir',1,1)
];
const MEALS={
 s:['Tartines beurre–confiture et un fruit','Yaourt, fruit et céréales','Pain de mie, beurre de cacahuète et banane','Sandwich jambon–fromage','Fromage, pain et raisin','Bol de céréales au lait','Houmous, crudités et pain','Salade de thon en boîte avec maïs et tomate, et du pain','Wrap au fromage frais et concombre','Tomates, mozzarella et pain','Fromage blanc, miel et noix','Pain, avocat écrasé et sel','Compote, biscuits secs et un verre de lait','Taboulé ou salade de pâtes en barquette, et un fruit','Plateau « apéro-repas » : charcuterie, fromage, crackers, tomates cerises'],
 l:['Œufs brouillés et pain (1 poêle)','Pâtes au beurre et fromage râpé (1 casserole)','Riz micro-ondes et œuf au plat (1 poêle)','Omelette au fromage (1 poêle)','Croque-monsieur (grille-pain ou poêle)','Soupe en brique réchauffée et pain','Quesadilla fromage–jambon (1 poêle)','Pâtes au pesto (1 casserole)','Purée instantanée et jambon','Raviolis en boîte','Nouilles instantanées avec un œuf (1 casserole)','Riz micro-ondes et légumes surgelés, avec du fromage','Tortilla chaude fromage–poulet (micro-ondes)','Œufs durs et pain (1 casserole, 10 min)','Pomme de terre au micro-ondes, beurre et thon']
};
const GESTES=['Ouvre les volets.','Bois un grand verre d’eau.','Passe-toi de l’eau fraîche sur le visage.','Va te poster près de la fenêtre, deux minutes.','Mets une chanson que tu aimes.'];
const MIRRORS=['08:08','09:09','10:10','11:11','12:12','13:13','14:14','15:15','16:16','17:17','18:18','19:19'];
/* Fenêtre cachée : 5 jours avant, 5 jours après la date. */
const SET_RULES={'Noël':{md:[12,25]},'Pâques':{easter:0},'Halloween':{md:[10,31]},'Anniversaire':{bday:true},'Nouvel An':{md:[1,1]},'Rois':{md:[1,6]},'Saint-Valentin':{md:[2,14]},'Carnaval':{easter:-47}};
const MILESTONES={30:'Jardin en fleurs',60:'Nuit gothique'};
