# Locamex Project

## Project Overview

This is a Next.js application bootstrapped with `create-next-app`. The project uses the App Router and TypeScript.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: CSS (with PostCSS)
- **Font**: Geist font family (via next/font)

## Project Structure

- `/app` - Next.js app router pages and components
- `/public` - Static assets

## Development

- Run dev server: `npm run dev`
- Main page: `app/page.tsx`
- Local URL: http://localhost:3000

## Notes

- Page auto-updates when editing files
- Uses automatic font optimization with next/font

# 🏊 LOCAMEX - Correcteur de Rapports Automatique

## 📋 Vue d'ensemble du projet

### Qui est LOCAMEX ?

LOCAMEX est le premier réseau d'experts en recherche de fuites de piscines en France. Fondée en 2017, l'entreprise compte plus de 70 agences indépendantes réparties en France, Espagne et Suisse. Leur métier : détecter et réparer les fuites dans les piscines à l'aide de technologies avancées (plongée sous-marine, tests de pression, injection de fluorescéine, électro-induction).

### Le problème à résoudre

Actuellement, les techniciens LOCAMEX créent des rapports d'inspection dans Word. Ces rapports arrivent souvent avec :

- Des fautes d'orthographe et de grammaire
- Une mise en page désordonnée et incohérente
- Des images mal positionnées ou manquantes
- Des tableaux difficiles à lire
- Aucune cohérence visuelle avec la charte graphique LOCAMEX

Les techniciens passent beaucoup de temps à corriger et reformater ces rapports manuellement.

### La solution que nous construisons

Une application web moderne où les techniciens peuvent simplement déposer leur rapport Word brut et recevoir instantanément un PDF professionnel, corrigé et parfaitement formaté selon la charte graphique LOCAMEX.

### Objectifs business

- **Gain de temps** : Réduire le temps de création de rapport de 30+ minutes à moins de 2 minutes
- **Qualité** : Éliminer 100% des fautes d'orthographe et grammaire
- **Standardisation** : Tous les rapports LOCAMEX auront la même apparence professionnelle
- **Image de marque** : Améliorer l'image professionnelle auprès des clients finaux

---

## 🎯 Fonctionnalités principales

### 1. Upload de fichiers Word

L'utilisateur doit pouvoir déposer facilement son rapport Word (format .docx uniquement). L'interface doit être intuitive avec drag & drop, et afficher clairement les fichiers acceptés et la taille maximale (10 MB).

### 2. Extraction intelligente du contenu

Le système doit extraire du fichier Word :

- **Le texte complet** : Tous les paragraphes, titres, descriptions
- **Les images** : Toutes les photos d'inspection (avant, pendant, après)
- **Les tableaux** : Tous les tableaux de résultats et d'équipements
- **Les métadonnées** : Date, nom du client, adresse si présents

### 3. Correction automatique par IA

Une fois le texte extrait, il doit être envoyé à l'intelligence artificielle (OpenAI GPT-4) qui va :

- Corriger toutes les fautes d'orthographe (exemple : "plies" → "plis")
- Corriger toutes les fautes de grammaire (exemple : "constatée" → "constatés")
- Améliorer la clarté des phrases
- Standardiser le vocabulaire technique (utiliser les termes exacts : "PVC armé", "skimmer", "bonde de fond")
- **IMPORTANT** : Ne JAMAIS modifier les chiffres, dates, noms propres, adresses

### 4. Génération PDF professionnelle

Le système doit créer un PDF avec :

- **Branding LOCAMEX** : Logo, couleurs officielles, polices de caractère
- **Mise en page cohérente** : Marges, espacements, alignements parfaits
- **En-tête et pied de page** : Sur chaque page avec nom de l'entreprise et coordonnées
- **Tableaux stylisés** : Bordures, couleurs alternées, lisibilité optimale
- **Images bien placées** : Redimensionnées et positionnées correctement
- **Structure claire** : Sections bien définies et faciles à naviguer

### 5. Téléchargement instantané

Dès que le PDF est généré, l'utilisateur doit pouvoir le télécharger immédiatement avec un nom de fichier clair (exemple : "rapport_corrige_2025-11-09.pdf").

---

## 🏗️ Choix de la stack technique

### Pourquoi 100% JavaScript ?

Nous avons choisi de tout faire en JavaScript/TypeScript pour :

- **Simplicité** : Un seul langage, un seul environnement
- **Déploiement gratuit** : Hébergement sur Vercel sans frais
- **Maintenance facile** : Pas besoin de gérer deux projets séparés (frontend + backend Python)
- **Performance** : Next.js offre d'excellentes performances avec ses API Routes

### Technologies choisies

#### Frontend (Interface utilisateur)

- **Next.js 14+** : Framework React moderne avec App Router pour une expérience utilisateur fluide
- **TypeScript** : Pour la sécurité des types et éviter les bugs
- **Tailwind CSS** : Pour un design rapide et cohérent
- **shadcn/ui** : Composants UI modernes et accessibles (boutons, cartes, barres de progression)
- **Lucide React** : Bibliothèque d'icônes propres et cohérentes
- **react-dropzone** : Pour le drag & drop de fichiers

#### Backend (Traitement des données)

- **Next.js API Routes** : Pour gérer les requêtes sans serveur séparé
- **officeparser** : Bibliothèque JavaScript pour extraire le contenu des fichiers Word (texte, images, tableaux)
- **OpenAI API (GPT-4)** : Pour la correction orthographique et grammaticale intelligente
- **jsPDF** : Pour générer des PDF de haute qualité
- **jsPDF-autoTable** : Extension pour créer des tableaux stylisés dans les PDF

#### Hébergement et déploiement

- **Vercel** : Plateforme d'hébergement gratuite, optimisée pour Next.js
- **Node.js 18+** : Environnement d'exécution JavaScript côté serveur

### Pourquoi ces choix spécifiques ?

**officeparser** : C'est la meilleure bibliothèque JavaScript pour extraire le contenu des fichiers Word. Elle récupère fiablement le texte, les images (en base64), et les tableaux. Alternative testée : mammoth.js, mais moins fiable pour les images.

**OpenAI GPT-4** : Le modèle le plus performant pour la correction de texte en français. Il comprend le contexte technique des rapports de piscine et ne modifie pas les informations importantes (dates, noms, chiffres). Alternative envisagée : Claude API, mais OpenAI a une meilleure documentation.

**jsPDF** : La solution la plus mature pour générer des PDF en JavaScript. Elle offre un contrôle total sur la mise en page, les polices, les images et les tableaux. Alternative : PDFKit, mais jsPDF est plus simple à utiliser.

**Vercel** : Gratuit pour nos besoins, déploiement automatique à chaque push Git, excellent support de Next.js, CDN mondial inclus. Alternative : Netlify, mais Vercel est créé par l'équipe de Next.js.

---

## 🎨 Charte graphique LOCAMEX (CRUCIAL)

### Couleurs officielles

Toutes les couleurs utilisées dans l'application et dans les PDF générés DOIVENT respecter ces codes exacts :

**Bleu principal** : #0066CC

- Utilisation : Titres principaux, boutons d'action, en-tête du PDF, lignes de séparation
- C'est LA couleur de marque LOCAMEX, elle doit être dominante

**Bleu foncé** : #004080

- Utilisation : États hover (survol des boutons), textes secondaires importants
- Apporte de la profondeur au design

**Cyan accent** : #00A3E0

- Utilisation : Icônes, éléments d'interface, highlights
- Évoque l'eau et les piscines (thème métier)

**Blanc** : #FFFFFF

- Utilisation : Arrière-plans principaux, texte sur fond bleu

**Gris clair** : #F5F5F5

- Utilisation : Arrière-plans secondaires, zones de séparation, lignes alternées dans les tableaux

**Gris moyen** : #CCCCCC

- Utilisation : Bordures subtiles, lignes de séparation

**Texte foncé** : #2C3E50

- Utilisation : Texte principal du contenu (meilleure lisibilité que le noir pur)

### Typographie

**Titres et en-têtes** : Police Montserrat (ou Arial si non disponible)

- Style : Bold (gras)
- Donne un aspect moderne et professionnel

**Texte courant** : Police Open Sans (ou Helvetica si non disponible)

- Style : Regular
- Excellente lisibilité pour de longs textes

**Tableaux** : Police Roboto (ou Arial si non disponible)

- Optimisée pour la lecture de données chiffrées

### Identité visuelle

**Logo LOCAMEX** : Toujours positionné en haut à gauche

- Taille minimum : 50px de largeur
- Couleur : Bleu #0066CC sur fond blanc
- Accompagné du tagline : "1er Réseau d'experts en recherche de fuites piscine"

**Style général** :

- Design épuré et moderne
- Beaucoup d'espace blanc (ne pas surcharger)
- Utilisation généreuse du bleu (rappelle l'eau des piscines)
- Lignes nettes et angles droits (pas de courbes excessives)
- Photos encadrées avec bordures subtiles
- Interface organisée en cartes avec ombres douces

---

## 📂 Organisation du projet

### Structure des dossiers

Le projet doit être organisé de manière claire et logique :

**app/** : Cœur de l'application Next.js

- Contient la page principale (interface d'upload)
- Contient le layout racine (avec les fonts et styles globaux)
- Contient les API Routes dans app/api/

**components/** : Tous les composants réutilisables

- Composants UI (boutons, cartes, alertes)
- Composants métier (zone d'upload, barre de progression, header, footer)
- Chaque composant dans son propre fichier

**lib/** : Bibliothèques et utilitaires

- Fonctions d'extraction Word
- Fonctions de correction IA
- Fonctions de génération PDF
- Fonctions utilitaires diverses

**types/** : Définitions TypeScript

- Interfaces pour les données structurées
- Types personnalisés du projet

**public/** : Assets statiques

- Logo LOCAMEX officiel
- Polices de caractères si nécessaire
- Autres images fixes

### Fichiers de configuration

- **.env.local** : Variables d'environnement (clés API) - NE JAMAIS commit ce fichier
- **CLAUDE.md** : Ce fichier, mémoire permanente du projet
- **README.md** : Documentation utilisateur du projet
- **package.json** : Dépendances et scripts
- **next.config.js** : Configuration Next.js
- **tailwind.config.ts** : Configuration Tailwind (couleurs LOCAMEX)
- **tsconfig.json** : Configuration TypeScript

---

## 🔄 Flux de traitement (Workflow)

### Étape 1 : Upload

L'utilisateur arrive sur la page d'accueil et voit :

- Une zone de drag & drop attractive avec les couleurs LOCAMEX
- Un texte explicatif clair : "Déposez votre rapport Word ici"
- Les formats acceptés (.docx) et taille max (10 MB)
- Des icônes illustrant les bénéfices (correction, mise en page, PDF)

### Étape 2 : Validation

Quand l'utilisateur dépose ou sélectionne un fichier :

- Vérifier que c'est bien un fichier .docx
- Vérifier que la taille ne dépasse pas 10 MB
- Afficher le nom et la taille du fichier
- Montrer un bouton "Traiter le rapport" bien visible (bleu LOCAMEX)
- Si erreur : message d'erreur clair en français

### Étape 3 : Extraction

Au clic sur "Traiter" :

- Afficher une barre de progression
- Montrer le statut : "Extraction du contenu Word..."
- En coulisses : utiliser officeparser pour extraire texte, images et tableaux
- Gérer les erreurs : si l'extraction échoue, message clair à l'utilisateur

### Étape 4 : Correction IA

- Statut : "Correction orthographique avec IA..."
- Envoyer le texte extrait à l'API OpenAI GPT-4
- Utiliser un prompt spécifique qui :
  - Demande de corriger orthographe et grammaire
  - Insiste pour ne PAS modifier dates, noms, chiffres, adresses
  - Demande d'utiliser le vocabulaire technique exact (PVC armé, skimmer, etc.)
- Récupérer le texte corrigé
- Gérer timeout et erreurs API

### Étape 5 : Génération PDF

- Statut : "Génération du PDF professionnel..."
- Créer un nouveau document PDF au format A4
- Appliquer le template LOCAMEX :
  - En-tête bleu avec logo et titre
  - Pied de page avec coordonnées sur chaque page
  - Numérotation des pages
- Insérer le texte corrigé avec mise en forme
- Insérer les tableaux avec le style LOCAMEX (en-tête bleu, lignes alternées grises)
- Insérer les images avec légendes
- Ajouter une section conclusion avec encadré

### Étape 6 : Téléchargement

- Statut : "Finalisation..."
- Message de succès avec icône verte
- Bouton de téléchargement bien visible
- Nom de fichier auto-généré : rapport_corrige_AAAA-MM-JJ.pdf
- Option "Traiter un autre rapport" pour recommencer

---

## 🤖 Instructions pour l'IA (OpenAI GPT-4)

### Le rôle de l'IA

L'IA ne doit PAS réécrire le rapport, elle doit simplement le corriger. C'est une différence cruciale.

### Ce que l'IA DOIT faire

1. **Corriger l'orthographe** : "plies" → "plis", "constatée" → "constatés"
2. **Corriger la grammaire** : accord des verbes, des adjectifs, etc.
3. **Améliorer la clarté** : reformuler les phrases confuses sans en changer le sens
4. **Standardiser les termes** : toujours utiliser "PVC armé" (jamais "PVC renforcé"), "skimmer" (jamais "écumeur")
5. **Garder le ton professionnel** : ni trop familier, ni trop ampoulé

### Ce que l'IA NE DOIT JAMAIS faire

1. **Modifier les chiffres** : Si le rapport dit "2 skimmers", ça doit rester "2 skimmers"
2. **Modifier les dates** : "06/11/2025" doit rester exactement "06/11/2025"
3. **Modifier les noms** : "M. Cholat" doit rester "M. Cholat"
4. **Modifier les adresses** : "248 Allée de garenne" ne change pas
5. **Supprimer des informations** : Tout ce qui est dans le rapport original doit rester
6. **Ajouter des informations** : Ne rien inventer, ne rien ajouter qui ne soit pas dans l'original
7. **Changer la structure** : Respecter l'ordre des sections

### Vocabulaire technique obligatoire

Ces termes DOIVENT être utilisés exactement comme indiqué :

- PVC armé (revêtement)
- Skimmer (système de filtration de surface)
- Bonde de fond (évacuation au fond du bassin)
- Refoulement (buses de retour d'eau)
- Pièces à sceller (éléments intégrés à la structure)
- Mise en pression des canalisations
- Test d'étanchéité
- Injection de fluorescéine
- Test électro-induction
- Conformité / Non-conformité

### Exemples de corrections attendues

**Fautes courantes à corriger :**

- "Des plies ont été constatée" → "Des plis ont été constatés"
- "aumoment de nos tests" → "au moment de nos tests"
- "Aucun soucis" → "Aucun souci" ou "Aucun problème"
- "La filtration marche bien" → "La filtration fonctionne correctement"

**Ce qui NE doit PAS changer :**

- "Date de l'inspection : 06/11/2025" → reste identique
- "Piscine de M. Cholat" → reste identique
- "248 Allée de garenne, 73230 Barby" → reste identique
- "Skimmer : 2" → reste identique

---

## 📄 Standards pour le PDF généré

### Caractéristiques du document

- **Format** : A4 (210mm × 297mm)
- **Orientation** : Portrait (vertical)
- **Marges** : 20mm de chaque côté
- **Police de base** : 11pt pour le texte courant
- **Interligne** : 1.5 pour une meilleure lisibilité

### En-tête (sur chaque page)

- Hauteur : 15mm
- Fond : Bleu LOCAMEX (#0066CC)
- Texte : "LOCAMEX" centré, blanc, gras, 18pt
- Sous-titre : "Expert en recherche de fuites piscine" centré, blanc, 10pt

### Pied de page (sur chaque page)

- Hauteur : 15mm
- Ligne de séparation bleue au-dessus
- Texte centré, gris, 8pt :
  - Ligne 1 : "LOCAMEX - 1er Réseau d'experts en recherche de fuites piscine | Page X"
  - Ligne 2 : "www.locamex.org | contact@locamex.org | +70 agences en Europe"

### Structure du contenu

1. **Titre du rapport** : Centré, bleu, 16pt, gras
2. **Date de génération** : Centré, gris, 10pt
3. **Espace** : 15mm
4. **Contenu principal** : Texte justifié, 11pt, gris foncé
5. **Tableaux** : Bordures fines, en-têtes bleus, lignes alternées grises
6. **Images** : Max 80mm de large, centrées, avec légende en dessous
7. **Encadré conclusion** : Bordure bleue, fond blanc, texte 10pt

### Tableaux

- **En-tête** : Fond bleu #0066CC, texte blanc, gras
- **Corps** : Texte gris foncé, padding de 4mm dans chaque cellule
- **Lignes alternées** : Blanc / Gris clair #F5F5F5
- **Bordures** : Fines, grises
- **Alignement** : En-têtes centrés, données alignées à gauche

### Images

- Redimensionnées automatiquement si trop grandes (max 80mm de largeur)
- Maintien du ratio hauteur/largeur
- Positionnées au centre de la page
- Légende en dessous : "Photo 1", "Photo 2", etc. en italique, 9pt

---

## 🔐 Sécurité et confidentialité

### Validation des fichiers

**Toujours** vérifier :

- Type MIME correct : application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Extension : .docx uniquement
- Taille maximale : 10 MB
- Rejeter tout autre type de fichier avec message d'erreur clair

### Protection des données

- **Aucun stockage permanent** : Les fichiers uploadés ne doivent JAMAIS être sauvegardés sur le serveur
- **Traitement en mémoire** : Tout se passe en RAM, rien n'est écrit sur disque
- **Suppression immédiate** : Dès que le PDF est généré et envoyé, tout est effacé
- **Pas de logs sensibles** : Ne jamais logger le contenu des rapports (peut contenir des infos personnelles)

### Clés API

- **OPENAI_API_KEY** : Stockée dans .env.local, jamais committée sur Git
- Vérifier sa présence au démarrage de l'app
- Message d'erreur clair si absente

### Gestion des erreurs

Ne JAMAIS exposer à l'utilisateur :

- Les détails techniques des erreurs
- Les stack traces
- Les messages d'erreur de l'API OpenAI
- Les chemins de fichiers du serveur

À la place, montrer des messages génériques et utiles :

- "Erreur lors du traitement du fichier. Veuillez réessayer."
- "Le fichier semble corrompu. Utilisez un autre fichier Word."
- "Service temporairement indisponible. Réessayez dans quelques minutes."

---

## 🎯 Expérience utilisateur (UX)

### Principes de design

1. **Simplicité** : L'interface doit être évidente, même pour quelqu'un qui n'est pas tech-savvy
2. **Feedback immédiat** : Toujours montrer ce qui se passe (chargement, succès, erreur)
3. **Guidage** : Messages clairs pour dire à l'utilisateur quoi faire
4. **Récupération d'erreur** : Si quelque chose échoue, donner un moyen de réessayer facilement

### États de l'interface

**État initial (vide)** :

- Grande zone de drag & drop visuellement attractive
- Texte : "Déposez votre rapport Word ici ou cliquez pour parcourir"
- Icônes illustrant les bénéfices
- Couleurs LOCAMEX dominantes

**État avec fichier sélectionné** :

- Afficher le nom du fichier avec icône
- Afficher la taille du fichier
- Bouton "Traiter le rapport" bien visible en bleu
- Possibilité d'annuler et choisir un autre fichier

**État en traitement** :

- Barre de progression avec pourcentage
- Statut textuel de l'étape en cours
- Animation de chargement (spinner)
- Impossible d'uploader un autre fichier pendant ce temps

**État de succès** :

- Icône de succès verte
- Message : "Rapport traité avec succès !"
- Gros bouton de téléchargement du PDF
- Bouton secondaire : "Traiter un autre rapport"

**État d'erreur** :

- Icône d'erreur rouge
- Message d'erreur clair en français
- Bouton "Réessayer"
- Possibilité de choisir un autre fichier

### Messages en français

Tous les textes de l'interface doivent être en français :

- Titres
- Boutons
- Messages d'erreur
- Instructions
- Labels

Exemples :

- "Déposez votre fichier ici"
- "Traitement en cours..."
- "Télécharger le PDF"
- "Erreur lors du traitement"
- "Fichier trop volumineux"

---

## 💰 Modèle économique et coûts

### Coûts d'infrastructure

**Totalement gratuit** :

- Next.js : Framework open-source gratuit
- Vercel : Hébergement gratuit jusqu'à 100 GB de bande passante/mois
- officeparser : Bibliothèque gratuite
- jsPDF : Bibliothèque gratuite

**Payant** :

- OpenAI API : Environ 0.01-0.03€ par rapport traité (selon la longueur du texte)

### Projection de coûts

Pour 100 rapports/mois : ~1-3€
Pour 1000 rapports/mois : ~10-30€
Pour 10000 rapports/mois : ~100-300€

### Optimisation des coûts

- Utiliser le modèle GPT-4 Turbo (moins cher que GPT-4 standard)
- Limiter les tokens de réponse (max_tokens: 4000)
- Température basse (0.3) pour des réponses consistantes et plus courtes
- Ne corriger que le texte, pas les tableaux ou métadonnées

---

## 🧪 Tests et validation

### Scénarios de test obligatoires

**Test 1 : Rapport simple**

- Fichier : 1 page, peu de texte, 1 image, 1 tableau
- Attendu : PDF généré en <10 secondes, tout correct

**Test 2 : Rapport complexe**

- Fichier : 5+ pages, beaucoup de texte, 10+ images, 5+ tableaux
- Attendu : PDF généré en <30 secondes, tout présent et bien formaté

**Test 3 : Rapport avec fautes**

- Fichier avec fautes intentionnelles : "plies", "constatée", "aumoment"
- Attendu : Toutes les fautes corrigées dans le PDF final

**Test 4 : Rapport avec données sensibles**

- Fichier avec nom client, adresse, date précise
- Attendu : Toutes ces infos préservées exactement telles quelles

**Test 5 : Fichier invalide**

- Upload d'un .pdf, .txt, ou .doc (ancien format)
- Attendu : Message d'erreur clair, pas de crash

**Test 6 : Fichier trop gros**

- Upload d'un fichier de 15 MB
- Attendu : Message d'erreur avant même l'envoi au serveur

**Test 7 : Fichier corrompu**

- Upload d'un .docx invalide ou corrompu
- Attendu : Message d'erreur après tentative d'extraction

**Test 8 : Erreur API OpenAI**

- Simuler une panne de l'API OpenAI
- Attendu : Message d'erreur, possibilité de réessayer

### Critères de qualité

Le PDF généré doit :

- Respecter à 100% la charte graphique LOCAMEX
- Contenir toutes les images du fichier original
- Contenir tous les tableaux du fichier original
- Avoir 0 faute d'orthographe ou de grammaire
- Préserver tous les noms, dates, chiffres, adresses
- Être lisible sur ordinateur et mobile
- Avoir un poids raisonnable (< 5 MB)

---

## 🚀 Déploiement et mise en production

### Prérequis avant déploiement

- Tous les tests passent
- Aucune erreur dans les logs
- Performance vérifiée (temps de traitement < 30 secondes)
- Charte graphique respectée à 100%
- Messages d'erreur clairs en français
- Clé API OpenAI configurée en production

### Procédure de déploiement sur Vercel

1. Connecter le repo GitHub à Vercel
2. Configurer la variable d'environnement OPENAI_API_KEY
3. Déployer (automatique à chaque push sur main)
4. Vérifier l'URL de production
5. Tester en conditions réelles

### URL finale

Le site sera accessible sur : https://locamex-reports.vercel.app (ou domaine personnalisé)

### Monitoring

- Surveiller les erreurs dans les logs Vercel
- Surveiller les coûts OpenAI API
- Surveiller le temps de traitement moyen
- Recevoir des alertes si quelque chose ne va pas

---

## 📈 Évolutions futures (Roadmap)

### Phase 2 (dans 3 mois)

- **Authentification** : Chaque technicien a son compte
- **Historique** : Les techniciens peuvent retrouver leurs rapports passés
- **Statistiques** : Nombre de rapports traités, temps économisé
- **Templates** : Possibilité de personnaliser le template PDF par agence

### Phase 3 (dans 6 mois)

- **Application mobile** : Version iOS et Android
- **Génération automatique** : Créer un rapport depuis un formulaire
- **Signature électronique** : Le client peut signer le rapport directement
- **Envoi automatique** : Envoyer le rapport par email au client

### Phase 4 (dans 12 mois)

- **Multi-langue** : Anglais, Espagnol, Allemand
- **OCR** : Scanner des rapports papier et les convertir
- **API** : Permettre à d'autres systèmes d'utiliser notre service
- **White label** : Vendre la solution à d'autres réseaux d'experts

---

## 🎓 Contexte métier LOCAMEX

### Services de LOCAMEX

1. **Recherche de fuites** : Localiser précisément où la piscine fuit
2. **Inspection en plongée** : Plongeur examine le bassin sous l'eau
3. **Tests de pression** : Vérifier l'étanchéité des canalisations
4. **Injection de colorant** : Fluorescéine pour visualiser les fuites
5. **Électro-induction** : Tester l'étanchéité du revêtement électriquement
6. **Réparation sans casse** : Techniques non-destructives

### Structure type d'un rapport

1. **Informations client** : Nom, adresse, date d'intervention
2. **Description de la mission** : Services réalisés
3. **État des lieux** : Niveau d'eau, état général
4. **Liste des équipements** : Skimmers, bondes, refoulements, spots, etc.
5. **Résultats des tests** : Conformité des canalisations et pièces à sceller
6. **Photos** : Images de l'inspection
7. **Conclusion** : Verdict final (conforme / non-conforme)
8. **Disclaimer légal** : Limites de responsabilité

### Vocabulaire métier à connaître

- **Skimmer** : Ouverture en surface pour aspirer l'eau et les débris
- **Bonde de fond** : Drain au fond du bassin
- **Refoulement** : Buses qui renvoient l'eau filtrée dans la piscine
- **Pièces à sceller** : Éléments intégrés dans la structure (skimmers, buses, spots)
- **PVC armé** : Type de revêtement résistant pour piscines
- **Liner** : Revêtement souple en PVC
- **Béton** : Structure de la piscine
- **Fluorescéine** : Colorant vert utilisé pour détecter les fuites
- **Mise en pression** : Test qui met les canalisations sous pression pour voir si elles fuient
- **Étanchéité** : Capacité à ne pas laisser passer l'eau

---

## 💡 Conventions de code et standards

### Philosophie

- **Clarté avant tout** : Le code doit être facile à comprendre
- **TypeScript strict** : Utiliser les types partout, pas de "any"
- **Composants réutilisables** : Ne pas se répéter (DRY principle)
- **Gestion d'erreur robuste** : Toujours prévoir que ça peut échouer
- **Performance** : Optimiser sans sacrifier la lisibilité

### Nommage

**Fichiers** : kebab-case (upload-zone.tsx, pdf-generator.ts)
**Composants React** : PascalCase (UploadZone, ProcessingStatus)
**Fonctions** : camelCase (extractWordContent, generatePDF)
**Constantes** : UPPER_SNAKE_CASE (LOCAMEX_COLORS, MAX_FILE_SIZE)
**Interfaces TypeScript** : PascalCase (ReportData, ProcessingStep)

### Organisation du code

- Une fonction = une responsabilité
- Fonctions courtes (< 50 lignes idéalement)
- Commentaires seulement quand nécessaire (le code doit être auto-explicatif)
- Validation des entrées au début de chaque fonction
- Gestion d'erreur avec try/catch

### Style CSS

- Utiliser Tailwind autant que possible
- Pas de CSS inline sauf exception
- Classes utilitaires plutôt que CSS personnalisé
- Responsive design : mobile-first

---

## 🎯 Définition de "Terminé"

Une fonctionnalité est considérée comme terminée quand :

- [ ] Le code compile sans erreur
- [ ] TypeScript ne remonte aucune erreur de type
- [ ] L'interface suit la charte graphique LOCAMEX
- [ ] Le design est responsive (mobile + desktop + tablette)
- [ ] Les messages sont en français
- [ ] La gestion d'erreur est implémentée
- [ ] Les cas limites sont gérés (fichier vide, très gros fichier, etc.)
- [ ] Le temps de traitement est acceptable (< 30 secondes)
- [ ] Testé manuellement avec succès
- [ ] Aucun warning dans la console
- [ ] Code reviewé et approuvé

---

## 📞 Ressources et aide

### Documentation officielle

- **Next.js** : https://nextjs.org/docs (framework principal)
- **Tailwind CSS** : https://tailwindcss.com/docs (styling)
- **TypeScript** : https://www.typescriptlang.org/docs (typage)
- **jsPDF** : https://github.com/parallax/jsPDF (génération PDF)
- **OpenAI API** : https://platform.openai.com/docs (IA)
- **officeparser** : https://www.npmjs.com/package/officeparser (extraction Word)

### Contact LOCAMEX

- **Site web** : https://www.locamex.org
- **Email** : contact@locamex.org
- **Réseau** : 70+ agences en France, Espagne, Suisse

### En cas de blocage

1. Consulter ce fichier CLAUDE.md
2. Consulter la documentation officielle
3. Chercher sur Stack Overflow
4. Demander à Claude Code directement

---

## ✅ Check-list de démarrage

Quand tu commences à travailler sur ce projet, vérifie que :

- [ ] Node.js 18+ est installé
- [ ] Tu as créé un compte OpenAI et obtenu une clé API
- [ ] Tu as ajouté la clé dans .env.local
- [ ] Tu as compris le rôle de LOCAMEX (détection de fuites piscines)
- [ ] Tu as compris le problème (rapports Word mal formatés)
- [ ] Tu as compris la solution (app web de correction automatique)
- [ ] Tu connais les couleurs LOCAMEX (#0066CC, #00A3E0)
- [ ] Tu sais que tout doit être en français côté utilisateur
- [ ] Tu sais que l'IA ne doit JAMAIS modifier dates, noms, chiffres

---

## 🎬 Conclusion

Ce projet a un impact réel : il va faire gagner des heures de travail aux techniciens LOCAMEX chaque semaine, et améliorer considérablement l'image professionnelle de l'entreprise auprès de ses clients.

Le code que tu écris sera utilisé quotidiennement par des dizaines de techniciens sur le terrain. La qualité, la fiabilité et la facilité d'utilisation sont donc essentielles.

Garde toujours en tête :

- **Simplicité** : L'interface doit être intuitive
- **Qualité** : Le PDF doit être impeccable
- **Fiabilité** : Ça doit marcher à chaque fois
- **Branding** : Respecter la charte graphique LOCAMEX
- **Sécurité** : Protéger les données des clients

Bonne chance ! 🚀

---

**Dernière mise à jour** : 09/11/2025  
**Version** : 1.0.0  
**Auteur** : Équipe Dev LOCAMEX

---
