# 📋 DOCUMENTATION COMPLÈTE - APPLICATION LOCAMEX

## 📌 Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Fonctionnalités principales](#2-fonctionnalités-principales)
3. [Stack technique](#3-stack-technique)
4. [Architecture du projet](#4-architecture-du-projet)
5. [Flux de traitement complet](#5-flux-de-traitement-complet)
6. [API Endpoints](#6-api-endpoints)
7. [Composants React](#7-composants-react)
8. [Intégration IA (Claude)](#8-intégration-ia-claude)
9. [Génération de PDF](#9-génération-de-pdf)
10. [Types et interfaces TypeScript](#10-types-et-interfaces-typescript)
11. [Styling et design system](#11-styling-et-design-system)
12. [Sécurité et confidentialité](#12-sécurité-et-confidentialité)
13. [Gestion des erreurs](#13-gestion-des-erreurs)
14. [Optimisations](#14-optimisations)
15. [Variables d'environnement](#15-variables-denvironnement)
16. [Déploiement](#16-déploiement)
17. [Guide de démarrage](#17-guide-de-démarrage)

---

## 1. Vue d'ensemble du projet

### 🎯 Objectif

LOCAMEX est une application web moderne conçue pour **transformer automatiquement des rapports d'inspection Word en PDF professionnels** avec correction orthographique et grammaticale par intelligence artificielle.

### 🏢 Contexte business

**LOCAMEX** est le premier réseau d'experts en recherche de fuites de piscines en France avec plus de 70 agences réparties en France, Espagne et Suisse.

**Problème actuel :**
- Les techniciens créent des rapports d'inspection dans Word
- Ces rapports contiennent souvent des fautes d'orthographe et de grammaire
- Enssuite ce rapport et tarnsmis au secretaire qui elle doivent corriger syntax et mise en page
- La mise en page est désordonnée et incohérente
- La correction manuelle prend 30+ minutes par rapport
- Dans les rapport il y des images de l'intervention du technicient par exemple des mesure nanometre, la piscine du client , le local technique et autre verification effectuer,

**Solution apportée :**
- Application web où les techniciens déposent leur rapport Word brut
- Correction automatique par IA (Claude 3.5 Sonnet)
- Analayse des images posttionement des images dans les titre et sous titre coreespondant
- Génération instantanée d'un PDF professionnel aux couleurs LOCAMEX
- Temps de traitement : moins de 2 minutes

Attention ici car le clinet veut aussi pouvoir modfiier le rappport si il a besoin dajouter des texte ou des donneé oublier dans le rapport de base donc on doit trouver une solution pour faire ca 

### 📊 Bénéfices mesurables

- **Gain de temps :** Réduction de 30+ minutes à moins de 2 minutes
- **Qualité :** Élimination de 100% des fautes d'orthographe et grammaire
- **Standardisation :** Tous les rapports ont la même apparence professionnelle
- **Image de marque :** Amélioration de l'image professionnelle auprès des clients

---

## 2. Fonctionnalités principales

### 2.1 Upload de fichiers

**Interface drag & drop intuitive :**
- Accepte uniquement les fichiers `.docx` (Microsoft Word)
- Taille maximale : 10 MB
- Validation côté client et serveur
- Feedback visuel en temps réel
- Messages d'erreur clairs en français

**Validation automatique :**
- Vérification du type MIME
- Vérification de l'extension
- Contrôle de la taille
- Rejet des fichiers invalides avec messages explicatifs

### 2.2 Extraction intelligente du contenu

**Technologie utilisée :** `officeparser` + `mammoth`

**Extraction de :**
- **Texte complet :** Tous les paragraphes, titres, descriptions
- **Images :** Toutes les photos avec métadonnées (base64, dimensions, type)
- **Tableaux :** Extraction structurée avec en-têtes et lignes de données
- **Métadonnées :** Date, client, adresse si présents

**Robustesse :**
- Gestion des documents corrompus
- Support des formats DOCX complexes
- Extraction multi-méthodes (fallback si échec)

### 2.3 Correction automatique par IA

**Moteur principal :** Claude 3.5 Sonnet (Anthropic)

**Capacités de correction :**
1. **Orthographe :** "plies" → "plis", "constatée" → "constatés"
2. **Grammaire :** Accord des verbes, adjectifs, temps
3. **Clarté :** Reformulation des phrases confuses
4. **Terminologie :** Standardisation du vocabulaire technique (PVC armé, skimmer, bonde de fond)
5. **Ton professionnel :** Maintien d'un ton ni trop familier, ni trop ampoulé

**Garanties de préservation :**
- ❌ Ne modifie JAMAIS les chiffres
- ❌ Ne modifie JAMAIS les dates
- ❌ Ne modifie JAMAIS les noms propres
- ❌ Ne modifie JAMAIS les adresses
- ✅ Préserve toutes les informations factuelles
- ✅ Ne supprime aucune information
- ✅ Respecte la structure du rapport

### 2.4 Analyse des images (IA Vision)

**Moteur :** Claude Haiku Vision (optimisé coûts)

**Analyse pour chaque image :**
- **Classification :** Piscine, manomètre, équipement, local technique
- **Qualité :** Bonne, moyenne, floue
- **Taille recommandée :** Grande, petite
- **Priorité d'affichage :** 1 à 10
- **Description automatique :** Légende générée par IA

**Optimisation :**
- Exclusion automatique des images de couverture/logo
- Tri par priorité pour mise en page optimale
- Compression intelligente

### 2.5 Génération PDF professionnelle

**Technologie :** jsPDF + jsPDF-autoTable + Canvas

**Caractéristiques du PDF :**
- **Format :** A4 (210mm × 297mm), Portrait
- **Marges :** 20mm de chaque côté
- **Branding LOCAMEX :** Logo, couleurs officielles, polices
- **En-tête/Pied de page :** Sur chaque page avec informations entreprise
- **Numérotation :** Pages numérotées automatiquement

**Sections du rapport :**
1. Titre du rapport avec date de génération
2. Informations client (nom, adresse, contact)
3. Détails de l'inspection (date, technicien, services)
4. Spécifications de la piscine
5. Inventaire des équipements (tableaux stylisés)
6. Résultats des tests (tableaux de conformité)
7. Photos classées et annotées
8. Observations techniques
9. Conclusion et recommandations
10. Mentions légales

**Styling avancé :**
- Cartes bleues pour les titres de section
- Tableaux avec en-têtes bleus et lignes alternées grises
- Images centrées avec légendes
- Espacement et marges optimisés pour la lisibilité

On doit ajouter pour le client la possibiliter de modfiier le document avant lextraction pdf 

### 2.6 Système de feedback

**Intégration Slack :**
- Modal de feedback accessible depuis l'en-tête
- 3 types : Bug, Suggestion, Question
- Envoi automatique vers Slack webhook
- Capture des détails d'erreur si applicable

**Informations collectées :**
- Type de feedback
- Description détaillée
- Email utilisateur (optionnel)
- Détails d'erreur (stack trace si bug)
- User agent (navigateur)
- URL de la page

### 2.7 Gestion des erreurs

**Error Boundary React :**
- Capture des erreurs runtime
- Affichage convivial en français
- Option de rapport d'erreur
- Possibilité de réessayer

**Notifications Slack automatiques :**
- Envoi des erreurs critiques
- Détails techniques pour debugging
- Contexte utilisateur

---

## 3. Stack technique

### 3.1 Frontend

| Technologie | Version | Rôle |
|------------|---------|------|
| **Next.js** | 16.0.1 | Framework React avec App Router |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Framework CSS utilitaire |
| **Framer Motion** | 12.x | Animations et transitions |
| **Lucide React** | 0.553 | Bibliothèque d'icônes |
| **react-dropzone** | 14.x | Upload drag & drop |

### 3.2 Backend & IA

| Technologie | Version | Rôle |
|------------|---------|------|
| **@anthropic-ai/sdk** | Latest | Intégration Claude AI |
| **Officeparser** | 5.2.1 | Extraction contenu Word |
| **Mammoth** | 1.11 | Parsing DOCX |
| **jsPDF** | 3.0.3 | Création de PDF |
| **jsPDF-autoTable** | 5.0.2 | Génération de tableaux PDF |
| **Canvas** | 3.2.0 | Rendu d'images |

### 3.3 Utilitaires

| Technologie | Rôle |
|------------|------|
| **date-fns** | Manipulation de dates |
| **clsx** | Fusion de classes CSS |
| **Chart.js** | Graphiques (analytics) |
| **Docx** | Création de documents Word |

### 3.4 Infrastructure

| Service | Rôle |
|---------|------|
| **Vercel** | Hébergement et déploiement |
| **Node.js** | 18+ Runtime |
| **ESLint** | Linting du code |
| **PostCSS** | Processing CSS |

---

## 4. Architecture du projet

### 4.1 Structure des dossiers

```
/locamex/
│
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes (serverless)
│   │   ├── 📁 process/              # Endpoint principal
│   │   │   └── route.ts             # POST: Traitement du rapport
│   │   ├── 📁 feedback/             # Endpoint feedback
│   │   │   └── route.ts             # POST: Envoi vers Slack
│   │   ├── 📁 analyze/              # (Routes alternatives)
│   │   └── 📁 generate/             # (Routes alternatives)
│   │
│   ├── layout.tsx                   # Layout racine + Error Boundary
│   ├── page.tsx                     # Page principale (362 lignes)
│   ├── globals.css                  # Styles globaux + Palette LOCAMEX
│   └── favicon.ico                  # Icône du site
│
├── 📁 components/                   # Composants React réutilisables
│   ├── 📁 ui/                       # Composants UI de base
│   │   ├── alert.tsx                # Alertes (succès, erreur)
│   │   ├── button.tsx               # Boutons avec variantes
│   │   ├── card.tsx                 # Cartes conteneurs
│   │   ├── background-gradient.tsx  # Effet de fond dégradé
│   │   ├── grid-pattern.tsx         # Motif de grille
│   │   ├── moving-border.tsx        # Bordure animée
│   │   ├── shimmer-button.tsx       # Bouton avec effet shimmer
│   │   └── bento-grid.tsx           # Layout en grille
│   │
│   ├── upload-zone.tsx              # Zone drag & drop (221 lignes)
│   ├── processing-status.tsx        # Barre de progression (268 lignes)
│   ├── header.tsx                   # En-tête navigation
│   ├── feedback-modal.tsx           # Modal de feedback
│   ├── error-boundary.tsx           # Error Boundary
│   ├── pdf-editor.tsx               # Éditeur PDF (expérimental)
│   └── html-editor.tsx              # Éditeur HTML (expérimental)
│
├── 📁 lib/                          # Logique métier et utilitaires
│   ├── word-extractor.ts            # Extraction DOCX basique
│   ├── word-extractor-advanced.ts   # Extraction avancée (338 lignes)
│   ├── report-analyzer.ts           # Orchestration Claude (252 lignes)
│   ├── report-adapter.ts            # Transformation de données
│   ├── image-analyzer.ts            # Analyse images IA (464 lignes)
│   ├── pdf-generator.ts             # Génération PDF v1
│   ├── pdf-generator-v2.ts          # Génération PDF v2 (861 lignes)
│   ├── pdf-generator-v3.ts          # Génération PDF v3 (999 lignes) ⭐
│   ├── html-generator.ts            # Génération HTML
│   ├── utils.ts                     # Utilitaires (cn)
│   │
│   └── 📁 prompts/                  # Templates de prompts IA
│       ├── analyseur-rapport.ts     # Prompts Claude (483 lignes)
│       └── analyseur-simple.ts      # Version simplifiée
│
├── 📁 types/                        # Définitions TypeScript
│   └── index.ts                     # Tous les types (406 lignes)
│
├── 📁 public/                       # Assets statiques
│   └── logo-locamex-light.webp      # Logo LOCAMEX
│
├── 📁 .claude/                      # Config Claude Code
│   └── settings.local.json          # Paramètres locaux
│
├── 📄 Configuration
│   ├── .env.local                   # Variables d'environnement (SECRET)
│   ├── package.json                 # Dépendances
│   ├── tsconfig.json                # Config TypeScript
│   ├── next.config.ts               # Config Next.js
│   ├── postcss.config.mjs           # Config PostCSS
│   ├── eslint.config.mjs            # Config ESLint
│   └── tailwind.config.ts           # Config Tailwind
│
└── 📄 Documentation
    ├── CLAUDE.md                    # Spécifications complètes (30 KB)
    ├── README.md                    # Guide de démarrage
    ├── SETUP_CLAUDE.md              # Instructions setup
    ├── GUIDE_TEST.md                # Guide de tests
    ├── MIGRATION_CLAUDE.md          # Notes de migration
    └── OPTIMISATIONS_API_CLAUDE.md  # Optimisations API
```

### 4.2 Fichiers clés par taille

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `lib/pdf-generator-v3.ts` | 999 | Génération PDF (version production) |
| `lib/html-generator.ts` | 917 | Génération HTML (expérimental) |
| `lib/pdf-generator-v2.ts` | 861 | Génération PDF v2 (backup) |
| `components/pdf-editor.tsx` | 791 | Éditeur PDF (expérimental) |
| `lib/prompts/analyseur-rapport.ts` | 483 | Prompts système Claude |
| `lib/image-analyzer.ts` | 464 | Analyse images IA |
| `types/index.ts` | 406 | Définitions TypeScript |
| `lib/word-extractor-advanced.ts` | 338 | Extraction DOCX |
| `components/processing-status.tsx` | 268 | Barre de progression |
| `lib/report-analyzer.ts` | 252 | Orchestration Claude |
| `components/upload-zone.tsx` | 221 | Zone upload |

---

## 5. Flux de traitement complet

### 5.1 Diagramme du workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. UTILISATEUR UPLOAD FICHIER                 │
│                         (Fichier .docx)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. VALIDATION FRONTEND                        │
│  • Type: .docx (MIME + extension)                                │
│  • Taille: < 10 MB                                               │
│  • Affichage nom + taille fichier                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 3. ENVOI À /api/process                          │
│  • POST avec FormData                                            │
│  • Barre de progression 0% → 100%                                │
│  • 7 étapes visuelles                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│        4. EXTRACTION CONTENU WORD (0% → 30%)                     │
│  Fonction: extractWordContentAdvanced()                          │
│  • Parse DOCX → Buffer                                           │
│  • Extraction texte complet                                      │
│  • Extraction images (base64)                                    │
│  • Extraction tableaux (headers + rows)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│       5. ANALYSE IA AVEC CLAUDE (30% → 60%)                      │
│  Fonction: analyzeReportWithAI()                                 │
│  Modèle: Claude 3.5 Sonnet                                       │
│  • Envoi texte + tableaux                                        │
│  • Prompt système: Analyse universelle                           │
│  • Extraction structurée:                                        │
│    ✓ Infos client (nom, adresse, contact)                        │
│    ✓ Détails inspection (date, technicien)                       │
│    ✓ Spécifications piscine                                      │
│    ✓ Inventaire équipements                                      │
│    ✓ Résultats tests                                             │
│    ✓ Conformité                                                  │
│    ✓ Observations                                                │
│    ✓ Conclusion                                                  │
│  • Corrections orthographe/grammaire                             │
│  • Retour: JSON structuré (RapportAnalyse)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│       6. ANALYSE IMAGES (60% → 75%)                              │
│  Fonction: analyzeAllImages()                                    │
│  Modèle: Claude Haiku Vision (10x moins cher)                    │
│  Pour chaque image:                                              │
│  • Classification (piscine, manomètre, équipement, etc.)         │
│  • Évaluation qualité (bonne, moyenne, floue)                    │
│  • Recommandation taille (grande, petite)                        │
│  • Priorité affichage (1-10)                                     │
│  • Génération description                                        │
│  Retour: ImageData[] enrichi                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│       7. GÉNÉRATION PDF (75% → 100%)                             │
│  Fonction: generatePDFV2()                                       │
│  • Création document jsPDF (A4, portrait)                        │
│  • Application branding LOCAMEX:                                 │
│    ✓ En-tête bleu avec logo (chaque page)                        │
│    ✓ Pied de page avec coordonnées                               │
│    ✓ Couleurs officielles (#0066CC, #00A3E0)                     │
│  • Insertion contenu corrigé:                                    │
│    ✓ Informations client                                         │
│    ✓ Résumé inspection                                           │
│    ✓ Tableaux équipements (stylisés)                             │
│    ✓ Résultats tests (tableaux)                                  │
│    ✓ Images classées et triées                                   │
│    ✓ Observations                                                │
│    ✓ Conclusion avec recommandations                             │
│  • Styling professionnel:                                        │
│    ✓ Cartes bleues pour sections                                 │
│    ✓ Tableaux avec lignes alternées                              │
│    ✓ Espacement optimal                                          │
│  Retour: Blob PDF                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              8. TÉLÉCHARGEMENT PDF                               │
│  • Message de succès                                             │
│  • Bouton téléchargement                                         │
│  • Nom fichier: rapport_corrige_AAAA-MM-JJ.pdf                  │
│  • Option: Traiter un autre rapport                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Progression détaillée

| Étape | % | Durée | Description |
|-------|---|-------|-------------|
| Lecture fichier | 0-15% | 0.8s | Chargement du fichier en mémoire |
| Extraction données | 15-30% | 0.8s | Parsing DOCX (texte, images, tableaux) |
| Récupération images | 30-45% | 1.0s | Extraction images base64 |
| Correction erreurs | 45-60% | 1.2s | Appel API Claude pour analyse |
| Amélioration texte | 60-75% | 1.0s | Finalisation analyse IA |
| Génération PDF | 75-90% | 1.0s | Création document PDF |
| Finalisation | 90-100% | 0.6s | Optimisation et retour |

**Temps total moyen :** 60-120 secondes

---

## 6. API Endpoints

### 6.1 POST `/api/process`

**Rôle :** Endpoint principal pour le traitement complet des rapports

**Paramètres de requête :**
```typescript
FormData {
  file: File  // Fichier .docx
}
```

**Headers requis :**
```
Content-Type: multipart/form-data
```

**Réponse succès :**
```typescript
Response {
  status: 200
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="rapport.pdf"'
  }
  body: Blob (PDF)
}
```

**Réponse erreur :**
```typescript
Response {
  status: 400 | 500
  body: {
    error: string  // Message d'erreur en français
  }
}
```

**Codes d'erreur :**
- `400` - Fichier invalide (type, taille)
- `500` - Erreur serveur (extraction, IA, génération)

**Limite de temps :** 120 secondes (maxDuration configuré)

**Étapes internes :**
1. Validation du fichier
2. Extraction contenu Word
3. Analyse IA (Claude Sonnet)
4. Analyse images (Claude Haiku)
5. Génération PDF
6. Retour du blob

---

### 6.2 POST `/api/feedback`

**Rôle :** Collecte de feedback utilisateur et envoi vers Slack

**Paramètres de requête :**
```typescript
{
  type: "bug" | "suggestion" | "question"
  description: string
  email?: string              // Optionnel
  errorInfo?: {               // Optionnel (si bug)
    message: string
    stack: string
  }
  userAgent: string
  url: string
}
```

**Réponse succès :**
```typescript
{
  success: true
  message: "Feedback envoyé avec succès"
}
```

**Réponse erreur :**
```typescript
{
  success: false
  error: string
}
```

**Intégration Slack :**
- Envoi via webhook Slack
- Message formaté avec couleurs :
  - 🔴 Rouge pour bugs
  - 🟡 Jaune pour suggestions
  - 🔵 Bleu pour questions
- Inclut timestamp, description, email, erreur, user agent

---

## 7. Composants React

### 7.1 Page principale : `app/page.tsx`

**Rôle :** Composant principal de l'application

**État géré :**
```typescript
selectedFile: File | null           // Fichier sélectionné
processingState: ProcessingState    // État traitement
pdfBlob: Blob | null                // PDF généré
error: string | null                // Message erreur
```

**Fonctions clés :**
- `handleFileSelect(file)` - Gestion sélection fichier
- `handleClearFile()` - Réinitialisation
- `handleProcess()` - Lancement traitement
- `handleDownload()` - Téléchargement PDF
- `simulateProgress()` - Animation progression

**Hooks utilisés :**
- `useState` - Gestion état
- `useEffect` - Pas utilisé (tout en event-driven)

---

### 7.2 Zone d'upload : `components/upload-zone.tsx`

**Rôle :** Interface drag & drop pour upload de fichiers

**Props :**
```typescript
{
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClearFile: () => void
  disabled: boolean
}
```

**Features :**
- Drag & drop avec `react-dropzone`
- Animation lors du survol
- Validation instantanée (type, taille)
- Affichage info fichier sélectionné
- Bouton suppression

**Validations :**
- Type MIME : `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Extension : `.docx`
- Taille max : 10 MB (10,485,760 octets)

---

### 7.3 Barre de progression : `components/processing-status.tsx`

**Rôle :** Affichage visuel du traitement

**Props :**
```typescript
{
  state: ProcessingState
}

ProcessingState {
  step: ProcessingStep
  progress: number      // 0-100
  message: string
}
```

**Features :**
- Barre de progression animée
- 7 jalons visuels
- Icônes pour chaque étape
- Message de statut
- Effet shimmer
- Animation Framer Motion

**Étapes :**
1. 📤 Upload (0%)
2. 📊 Extraction (15%)
3. 🖼️ Images (30%)
4. ✨ Correction (45%)
5. 📝 Amélioration (60%)
6. 📄 Génération (75%)
7. ✅ Finalisation (90%)

---

### 7.4 En-tête : `components/header.tsx`

**Rôle :** Navigation et branding

**Features :**
- Logo LOCAMEX (cliquable)
- Badge BETA
- Bouton feedback
- Menu mobile (hamburger)
- Sticky header
- Animation au scroll

**Composants enfants :**
- `FeedbackModal` - Modal de feedback

---

### 7.5 Modal feedback : `components/feedback-modal.tsx`

**Rôle :** Formulaire de feedback utilisateur

**Props :**
```typescript
{
  isOpen: boolean
  onClose: () => void
  errorInfo?: {
    message: string
    stack: string
  }
}
```

**Features :**
- 3 types de feedback (bug, suggestion, question)
- Champ description (textarea)
- Champ email (optionnel)
- Envoi vers API `/api/feedback`
- Animation d'ouverture/fermeture
- Portal React

---

### 7.6 Error Boundary : `components/error-boundary.tsx`

**Rôle :** Capture des erreurs React

**Features :**
- Extends `React.Component`
- Méthode `componentDidCatch()`
- Affichage UI d'erreur convivial
- Bouton réessayer
- Lien vers feedback
- Détails techniques dépliables

---

### 7.7 Composants UI (`components/ui/`)

**Bibliothèque de composants réutilisables :**

| Composant | Rôle |
|-----------|------|
| `alert.tsx` | Alertes (succès, erreur, warning) |
| `button.tsx` | Boutons avec variantes |
| `card.tsx` | Cartes conteneurs |
| `background-gradient.tsx` | Effet dégradé animé |
| `grid-pattern.tsx` | Motif grille en fond |
| `moving-border.tsx` | Bordure animée |
| `shimmer-button.tsx` | Bouton avec effet shimmer |
| `bento-grid.tsx` | Layout grille moderne |

**Style :** Inspiré de shadcn/ui avec Tailwind CSS

---

## 8. Intégration IA (Claude)

### 8.1 Claude 3.5 Sonnet - Analyse de rapports

**Utilisation :** Analyse complète et correction des rapports

**Fichier :** `lib/report-analyzer.ts`

**Modèle :** `claude-3-5-sonnet-20241022`

**Configuration :**
```typescript
{
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4000,
  temperature: 0.2,        // Faible pour cohérence
  system: [SYSTEM_PROMPT]  // Prompt détaillé
}
```

**Prompt système (483 lignes) :**
- Instructions d'analyse universelle
- Règles de correction
- Vocabulaire technique obligatoire
- Format de réponse JSON
- Exemples de corrections

**Ce que Claude DOIT faire :**
1. ✅ Corriger orthographe
2. ✅ Corriger grammaire
3. ✅ Améliorer clarté
4. ✅ Standardiser terminologie
5. ✅ Structurer données

**Ce que Claude NE DOIT PAS faire :**
1. ❌ Modifier dates
2. ❌ Modifier noms propres
3. ❌ Modifier chiffres
4. ❌ Modifier adresses
5. ❌ Supprimer informations
6. ❌ Inventer informations

**Retour structuré (JSON) :**
```typescript
RapportAnalyse {
  metadata: {
    version_analyseur: "2.0"
    date_analyse: string
    modele_ia: "claude-3-5-sonnet"
  }
  client: {
    nom: string
    adresse: string
    telephone?: string
    email?: string
  }
  inspection: {
    date: string
    technicien: string
    services_realises: string[]
  }
  piscine: {
    type_bassin: string
    dimensions: string
    revetement: string
    type_filtration: string
  }
  equipements: {
    skimmers: number
    bondes_fond: number
    refoulements: number
    spots: number
    autres: string[]
  }
  tests_effectues: {
    canalisations: TestResult[]
    pieces_sceller: TestResult[]
  }
  conformite: {
    statut: "conforme" | "non_conforme" | "partiel"
    elements_conformes: string[]
    elements_non_conformes: string[]
  }
  observations_techniques: {
    problemes_detectes: string[]
    recommandations: string[]
  }
  bilan: {
    resume: string
    conclusion: string
  }
  mentions_legales: string
  corrections_appliquees: CorrectionAppliquee[]
}
```

**Coût moyen :** ~0.01-0.03€ par rapport

---

### 8.2 Claude Haiku Vision - Analyse d'images

**Utilisation :** Classification et analyse des images

**Fichier :** `lib/image-analyzer.ts`

**Modèle :** `claude-haiku-4-20250514`

**Avantage :** 10x moins cher que Sonnet pour la vision

**Configuration :**
```typescript
{
  model: "claude-haiku-4-20250514",
  max_tokens: 300,
  temperature: 0.1         // Très faible pour consistance
}
```

**Prompt par image :**
```
Analyse cette image d'inspection de piscine.

Retourne un JSON avec:
{
  "type": "piscine" | "manometre" | "local_technique" | "equipement" | "couverture_rapport" | "autre",
  "quality": "bonne" | "moyenne" | "floue",
  "sizeRecommendation": "grande" | "petite",
  "description": "Description courte",
  "displayPriority": 1-10
}
```

**Types d'images :**
- `piscine` - Vue d'ensemble du bassin
- `manometre` - Manomètre ou appareil de mesure
- `local_technique` - Local technique, pompe, filtre
- `equipement` - Skimmers, bondes, refoulements
- `couverture_rapport` - Logo/couverture (exclus du PDF)
- `autre` - Autres images

**Traitement :**
1. Analyse chaque image séparément
2. Classification par type
3. Évaluation qualité
4. Recommandation taille affichage
5. Attribution priorité (pour tri)
6. Génération description

**Optimisations :**
- Exclusion automatique des images "couverture_rapport"
- Tri par displayPriority (décroissant)
- Compression intelligente selon qualité

**Coût moyen :** ~0.001€ par image

---

### 8.3 Gestion des erreurs API

**Retry logic :**
- Pas de retry automatique (éviter coûts)
- Fallback vers données partielles si échec IA

**Timeout :**
- 120 secondes max pour tout le processus

**Error handling :**
```typescript
try {
  const analysis = await analyzeReportWithAI(...)
} catch (error) {
  // Retour données minimales
  return {
    analysedData: createDefaultAnalysis(),
    images: extractedData.images,
    originalTables: extractedData.tables
  }
}
```

---

## 9. Génération de PDF

### 9.1 Versions de générateurs

| Version | Fichier | État | Description |
|---------|---------|------|-------------|
| **v3** | `pdf-generator-v3.ts` | ✅ Production | Version actuelle (999 lignes) |
| v2 | `pdf-generator-v2.ts` | 🔄 Backup | Version précédente (861 lignes) |
| v1 | `pdf-generator.ts` | 🗄️ Legacy | Version initiale (1028 lignes) |

**Version utilisée :** `generatePDFV2()` (paradoxalement dans v3.ts)

### 9.2 Technologie

**Bibliothèques :**
- `jsPDF` - Création de documents PDF
- `jsPDF-autoTable` - Génération de tableaux
- `canvas` - Rendu d'images

**Configuration de base :**
```typescript
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
})

// Dimensions A4
const pageWidth = 210  // mm
const pageHeight = 297 // mm
const margin = 20      // mm
```

### 9.3 Branding LOCAMEX

**Couleurs officielles :**
```typescript
const COLORS = {
  primary: '#0066CC',      // Bleu LOCAMEX
  primaryDark: '#004080',  // Bleu foncé
  accent: '#00A3E0',       // Cyan
  white: '#FFFFFF',
  grayLight: '#F5F5F5',
  grayMedium: '#CCCCCC',
  textDark: '#2C3E50'
}
```

**En-tête (chaque page) :**
```
┌────────────────────────────────────────┐
│  [LOGO]     LOCAMEX                    │
│         Expert en recherche de fuites  │
└────────────────────────────────────────┘
```
- Hauteur : 15mm
- Fond : Bleu #0066CC
- Texte : Blanc, centré

**Pied de page (chaque page) :**
```
─────────────────────────────────────────
  LOCAMEX | www.locamex.org | Page X
  contact@locamex.org | +70 agences
```
- Hauteur : 15mm
- Texte : Gris, 8pt
- Centré

### 9.4 Structure du PDF

**1. Page de titre**
```
┌─────────────────────────────────────┐
│                                     │
│    RAPPORT D'INSPECTION PISCINE     │
│                                     │
│       Généré le XX/XX/XXXX          │
│                                     │
└─────────────────────────────────────┘
```

**2. Informations client**
```
┌─────────────────────────────────────┐
│  📋 INFORMATIONS CLIENT             │
├─────────────────────────────────────┤
│  Nom: M. Dupont                     │
│  Adresse: 123 Rue Example           │
│  Téléphone: 06 XX XX XX XX          │
│  Email: dupont@example.com          │
└─────────────────────────────────────┘
```

**3. Détails inspection**
```
┌─────────────────────────────────────┐
│  🔍 DÉTAILS DE L'INSPECTION         │
├─────────────────────────────────────┤
│  Date: 06/11/2025                   │
│  Technicien: Jean Martin            │
│  Services: Recherche de fuite       │
└─────────────────────────────────────┘
```

**4. Spécifications piscine**
```
┌─────────────────────────────────────┐
│  🏊 SPÉCIFICATIONS PISCINE          │
├─────────────────────────────────────┤
│  Type: Enterrée                     │
│  Dimensions: 10m x 5m               │
│  Revêtement: PVC armé               │
│  Filtration: À sable                │
└─────────────────────────────────────┘
```

**5. Inventaire équipements (tableau)**
```
┌────────────────┬──────────┐
│  Équipement    │  Nombre  │ ← En-tête bleu
├────────────────┼──────────┤
│  Skimmers      │    2     │ ← Ligne blanche
│  Bondes fond   │    1     │ ← Ligne grise
│  Refoulements  │    4     │ ← Ligne blanche
│  Spots         │    0     │ ← Ligne grise
└────────────────┴──────────┘
```

**6. Résultats tests (tableaux)**
```
┌──────────────────┬───────────────┐
│  Élément         │  Conformité   │
├──────────────────┼───────────────┤
│  Canalisation 1  │  ✓ Conforme   │
│  Canalisation 2  │  ✗ Fuite      │
│  Skimmer 1       │  ✓ Conforme   │
└──────────────────┴───────────────┘
```

**7. Images avec légendes**
```
┌───────────────────────────────────┐
│                                   │
│        [IMAGE PISCINE]            │
│                                   │
└───────────────────────────────────┘
   Photo 1: Vue d'ensemble
```

**8. Observations**
```
┌─────────────────────────────────────┐
│  📝 OBSERVATIONS TECHNIQUES         │
├─────────────────────────────────────┤
│  Problèmes détectés:                │
│  • Fuite sur canalisation refoul.   │
│  • PVC armé légèrement plissé       │
│                                     │
│  Recommandations:                   │
│  • Réparation immédiate requise     │
│  • Surveillance niveau eau          │
└─────────────────────────────────────┘
```

**9. Conclusion**
```
┌─────────────────────────────────────┐
│  ✅ BILAN ET CONCLUSION             │
├─────────────────────────────────────┤
│  Résumé: Fuite détectée sur...     │
│                                     │
│  Conclusion: Intervention nécessaire│
│  pour réparation canalisation.      │
└─────────────────────────────────────┘
```

**10. Mentions légales**
```
────────────────────────────────────────
Ce rapport a été établi par LOCAMEX...
[Texte légal]
────────────────────────────────────────
```

### 9.5 Styling des tableaux

**Configuration jsPDF-autoTable :**
```typescript
doc.autoTable({
  head: [headers],
  body: rows,
  startY: yPos,
  theme: 'grid',
  headStyles: {
    fillColor: [0, 102, 204],    // Bleu LOCAMEX
    textColor: [255, 255, 255],   // Blanc
    fontStyle: 'bold',
    halign: 'center'
  },
  bodyStyles: {
    textColor: [44, 62, 80],      // Gris foncé
    halign: 'left'
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]    // Gris clair
  },
  margin: { left: 20, right: 20 }
})
```

### 9.6 Gestion des images

**Traitement :**
1. Conversion base64 → Image
2. Calcul dimensions (max 170mm largeur)
3. Maintien ratio hauteur/largeur
4. Gestion débordement de page
5. Ajout légende

**Code :**
```typescript
const maxWidth = 170 // mm
const imgWidth = Math.min(image.width, maxWidth)
const imgHeight = (image.height / image.width) * imgWidth

// Vérifier si déborde de page
if (yPos + imgHeight > pageHeight - margin) {
  doc.addPage()
  yPos = margin + 40  // Après en-tête
}

doc.addImage(
  image.base64,
  'JPEG',
  (pageWidth - imgWidth) / 2,  // Centré
  yPos,
  imgWidth,
  imgHeight
)
```

### 9.7 Pagination automatique

**En-tête/pied de page :**
```typescript
const addHeaderFooter = (pageNumber: number) => {
  // En-tête
  doc.setFillColor(0, 102, 204)  // Bleu LOCAMEX
  doc.rect(0, 0, pageWidth, 15, 'F')

  // Logo
  doc.addImage(logo, 'PNG', 20, 3, 30, 9)

  // Texte
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('LOCAMEX', pageWidth / 2, 10, { align: 'center' })

  // Pied de page
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    `LOCAMEX | www.locamex.org | Page ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )
}
```

**Ajout automatique :**
```typescript
// Avant chaque nouveau contenu
if (yPos > pageHeight - margin - 30) {
  doc.addPage()
  pageNumber++
  addHeaderFooter(pageNumber)
  yPos = margin + 40
}
```

### 9.8 Performance

**Optimisations :**
- Compression images automatique
- Limitation taille images (max 170mm)
- Limitation qualité JPEG (0.85)
- Pas de polices embarquées (Helvetica standard)
- Stream direct vers blob (pas d'écriture disque)

**Taille fichier typique :**
- Rapport simple (5 pages, 3 images) : ~500 KB
- Rapport complexe (15 pages, 15 images) : ~3 MB
- Maximum recommandé : 5 MB

---

## 10. Types et interfaces TypeScript

### 10.1 Types de traitement

**Fichier :** `types/index.ts`

```typescript
// État du traitement
export type ProcessingStep =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'correcting'
  | 'generating'
  | 'completed'
  | 'error'

export interface ProcessingState {
  step: ProcessingStep
  progress: number        // 0-100
  message: string
  error?: string
}
```

### 10.2 Types d'extraction

```typescript
// Données extraites du Word
export interface ExtractedData {
  text: string
  images: ImageData[]
  tables: TableData[]
}

// Image avec métadonnées
export interface ImageData {
  base64: string
  contentType?: string
  width?: number
  height?: number
  caption?: string
  analysis?: ImageAnalysis
}

// Tableau extrait
export interface TableData {
  title?: string
  headers: string[]
  rows: string[][]
}
```

### 10.3 Types d'analyse IA

```typescript
// Analyse d'image par Claude Vision
export interface ImageAnalysis {
  type: ImageType
  quality: ImageQuality
  sizeRecommendation: ImageSize
  description: string
  displayPriority: number  // 1-10
}

export type ImageType =
  | 'piscine'
  | 'manometre'
  | 'local_technique'
  | 'equipement'
  | 'couverture_rapport'
  | 'autre'

export type ImageQuality = 'bonne' | 'moyenne' | 'floue'
export type ImageSize = 'grande' | 'petite'
```

### 10.4 Types de rapport analysé (v2.0)

```typescript
// Structure complète du rapport analysé
export interface RapportAnalyse {
  metadata: AnalyseurMetadata
  client: ClientInfo
  inspection: InspectionInfo
  piscine: PiscineInfo
  equipements: EquipementsInfo
  local_technique: LocalTechniqueInfo
  tests_effectues: TestsEffectues
  conformite: ConformiteInfo
  observations_techniques: ObservationsTechniques
  bilan: BilanInfo
  mentions_legales: MentionsLegales
  corrections_appliquees: CorrectionAppliquee[]
  notes_analyseur: NotesAnalyseur
}

// Informations client
export interface ClientInfo {
  nom?: string
  adresse?: string
  code_postal?: string
  ville?: string
  telephone?: string
  email?: string
}

// Informations inspection
export interface InspectionInfo {
  date?: string
  heure_debut?: string
  heure_fin?: string
  technicien?: string
  numero_intervention?: string
  services_realises?: string[]
  objectif?: string
}

// Spécifications piscine
export interface PiscineInfo {
  type_bassin?: string
  forme?: string
  dimensions?: string
  volume?: string
  revetement?: string
  type_filtration?: string
  equipement_chauffage?: string
  equipement_traitement?: string
  annee_construction?: string
  niveau_eau_initial?: string
  niveau_eau_final?: string
}

// Équipements
export interface EquipementsInfo {
  skimmers?: {
    nombre: number
    etat?: string[]
  }
  bondes_fond?: {
    nombre: number
    etat?: string[]
  }
  refoulements?: {
    nombre: number
    etat?: string[]
  }
  spots?: {
    nombre: number
    etat?: string[]
  }
  prise_balai?: {
    nombre: number
    etat?: string[]
  }
  buses_air?: {
    nombre: number
    etat?: string[]
  }
  autres_equipements?: string[]
}

// Résultats de tests
export interface TestsEffectues {
  canalisations?: TestResult[]
  pieces_sceller?: TestResult[]
  test_etancheite_liner?: TestEtancheiteResult
  test_pression?: TestPressionResult
  injection_fluoresceine?: InjectionFluoresceineResult
  autres_tests?: string[]
}

export interface TestResult {
  element: string
  resultat: 'conforme' | 'non_conforme' | 'a_surveiller'
  details?: string
}

// Conformité
export interface ConformiteInfo {
  statut_general: 'conforme' | 'non_conforme' | 'partiel'
  elements_conformes?: string[]
  elements_non_conformes?: string[]
  elements_a_surveiller?: string[]
  taux_conformite?: string
}

// Observations
export interface ObservationsTechniques {
  etat_general?: string
  problemes_detectes?: ProblemeDetecte[]
  points_attention?: string[]
  interventions_anterieures?: string[]
  recommandations?: string[]
}

export interface ProblemeDetecte {
  type: string
  gravite: 'faible' | 'moyenne' | 'critique'
  localisation: string
  description: string
  action_recommandee?: string
}

// Bilan
export interface BilanInfo {
  resume: string
  conclusion: string
  intervention_necessaire: boolean
  urgence?: 'immediate' | 'court_terme' | 'long_terme'
  estimation_couts?: string
  garantie_intervention?: string
}

// Corrections appliquées
export interface CorrectionAppliquee {
  type: 'orthographe' | 'grammaire' | 'vocabulaire' | 'ponctuation' | 'style'
  avant: string
  apres: string
  justification?: string
}
```

### 10.5 Types de feedback

```typescript
// Feedback utilisateur
export interface FeedbackData {
  type: 'bug' | 'suggestion' | 'question'
  description: string
  email?: string
  errorInfo?: {
    message: string
    stack: string
  }
  userAgent: string
  url: string
}
```

---

## 11. Styling et design system

### 11.1 Palette de couleurs LOCAMEX

**Fichier :** `app/globals.css`

```css
:root {
  /* Couleurs primaires LOCAMEX */
  --locamex-blue: #0066CC;
  --locamex-blue-dark: #004080;
  --locamex-cyan: #00A3E0;

  /* Couleurs neutres */
  --locamex-white: #FFFFFF;
  --locamex-gray-light: #F5F5F5;
  --locamex-gray-medium: #CCCCCC;
  --locamex-text-dark: #2C3E50;

  /* Couleurs de la nouvelle charte (tons naturels) */
  --sage: #5B949A;      /* Vert sauge */
  --ocean: #7CAEB8;     /* Bleu océan */
  --lime: #B6D1A3;      /* Vert tendre */
  --terracotta: #E8B69B; /* Terracotta */
  --cream: #F5E6D3;     /* Crème */
}
```

### 11.2 Tailwind Configuration

**Fichier :** `tailwind.config.ts`

```typescript
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        locamex: {
          blue: '#0066CC',
          'blue-dark': '#004080',
          cyan: '#00A3E0'
        },
        sage: '#5B949A',
        ocean: '#7CAEB8',
        lime: '#B6D1A3',
        terracotta: '#E8B69B',
        cream: '#F5E6D3'
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)']
      }
    }
  },
  plugins: []
}
```

### 11.3 Typographie

**Polices utilisées :**
```typescript
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})
```

**Hiérarchie :**
- H1 : `text-4xl md:text-6xl font-bold`
- H2 : `text-3xl md:text-5xl font-bold`
- H3 : `text-2xl md:text-3xl font-semibold`
- Body : `text-base leading-relaxed`
- Small : `text-sm`

### 11.4 Animations Framer Motion

**Fade in from bottom :**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
>
  {children}
</motion.div>
```

**Scale animation :**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>
```

**Stagger children :**
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 11.5 Composants stylisés

**Gradient Button (Shimmer) :**
```tsx
<ShimmerButton
  className="shadow-2xl"
  onClick={handleAction}
>
  <Sparkles className="w-5 h-5" />
  Traiter le rapport
</ShimmerButton>
```

**Moving Border :**
```tsx
<MovingBorder borderRadius="1.5rem" duration={3000}>
  <div className="p-8">
    {content}
  </div>
</MovingBorder>
```

**Background Gradient :**
```tsx
<BackgroundGradient className="rounded-[32px] p-10">
  {content}
</BackgroundGradient>
```

### 11.6 Responsive Design

**Breakpoints Tailwind :**
```
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
2xl: 1536px (extra large)
```

**Usage :**
```html
<div className="text-base md:text-lg lg:text-xl">
  Texte responsive
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Grille responsive
</div>
```

---

## 12. Sécurité et confidentialité

### 12.1 Protection des données

**Principe fondamental : Zéro stockage**

✅ **Ce qui est fait :**
- Traitement entièrement en mémoire (RAM)
- Aucune écriture sur disque
- Aucune base de données
- Suppression automatique après traitement
- Pas de logs du contenu des rapports

❌ **Ce qui n'est PAS fait :**
- Stockage des fichiers uploadés
- Sauvegarde des PDF générés
- Historique des traitements
- Base de données utilisateur
- Logs contenant des données personnelles

**Cycle de vie des données :**
```
1. Upload → Mémoire serveur
2. Traitement → Mémoire seulement
3. Génération PDF → Blob en mémoire
4. Téléchargement → Envoi au client
5. Fin requête → Garbage collection automatique
```

### 12.2 Validation des fichiers

**Côté client (JavaScript) :**
```typescript
// react-dropzone configuration
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize: 10 * 1024 * 1024,  // 10 MB
  multiple: false,
  onDropRejected: (rejections) => {
    // Afficher erreur utilisateur
  }
})
```

**Côté serveur (API Route) :**
```typescript
// /api/process/route.ts
const file = formData.get('file') as File

// Validation type
if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  return Response.json(
    { error: 'Format de fichier invalide' },
    { status: 400 }
  )
}

// Validation taille
if (file.size > 10 * 1024 * 1024) {
  return Response.json(
    { error: 'Fichier trop volumineux (max 10 MB)' },
    { status: 400 }
  )
}

// Validation extension
if (!file.name.endsWith('.docx')) {
  return Response.json(
    { error: 'Extension invalide' },
    { status: 400 }
  )
}
```

### 12.3 Sécurité des clés API

**Variables d'environnement :**
```bash
# .env.local (JAMAIS commité sur Git)
ANTHROPIC_API_KEY=sk-ant-xxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
```

**Gitignore :**
```gitignore
# Fichiers secrets
.env.local
.env.*.local
.env.production.local

# Dossiers build
.next/
node_modules/
```

**Vercel (production) :**
- Clés stockées dans Vercel Dashboard
- Encrypted at rest
- Pas d'exposition dans les logs
- Rotation possible sans redéploiement

**Utilisation sécurisée :**
```typescript
// Vérification présence clé au démarrage
const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY manquante')
}

// JAMAIS dans les erreurs utilisateur
try {
  await callClaudeAPI()
} catch (error) {
  // ❌ NE PAS FAIRE:
  // return { error: error.message }  // Peut exposer clé

  // ✅ FAIRE:
  return { error: 'Erreur lors du traitement' }
}
```

### 12.4 HTTPS et chiffrement

**Transport :**
- HTTPS uniquement (forcé par Vercel)
- TLS 1.3
- Certificat SSL automatique (Let's Encrypt)

**APIs externes :**
- Claude API : HTTPS uniquement
- Slack Webhook : HTTPS uniquement

### 12.5 Protection XSS

**Sanitization automatique :**
- React échappe automatiquement le contenu
- Pas de `dangerouslySetInnerHTML` utilisé
- Validation inputs utilisateur

**Headers de sécurité :**
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}
```

### 12.6 Rate limiting

**Actuellement :** Pas de rate limiting implémenté

**Recommandation future :**
- Limiter à 10 requêtes / minute / IP
- Utiliser Vercel Edge Config ou Redis
- Bloquer après abus détecté

### 12.7 Compliance RGPD

**Données personnelles traitées :**
- Nom client (dans rapport)
- Adresse client (dans rapport)
- Téléphone/email (dans rapport)
- Email feedback (optionnel)

**Mesures RGPD :**
- ✅ Traitement minimal nécessaire
- ✅ Pas de stockage (suppression immédiate)
- ✅ Pas de profilage
- ✅ Pas de tracking utilisateur
- ✅ Consentement implicite (usage volontaire)

**À ajouter :**
- Politique de confidentialité
- Mentions légales
- Cookie banner (si analytics ajouté)

---

## 13. Gestion des erreurs

### 13.1 Error Boundary React

**Fichier :** `components/error-boundary.tsx`

**Fonctionnement :**
```typescript
class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI error={this.state.error} />
    }
    return this.props.children
  }
}
```

**UI d'erreur :**
```tsx
<div className="error-container">
  <AlertCircle className="w-12 h-12 text-red-500" />
  <h2>Une erreur est survenue</h2>
  <p>{error.message}</p>
  <Button onClick={() => window.location.reload()}>
    Recharger la page
  </Button>
  <Button onClick={() => openFeedbackModal()}>
    Signaler le problème
  </Button>
</div>
```

### 13.2 Gestion d'erreur API

**Structure standard :**
```typescript
// /api/process/route.ts
try {
  // Traitement
  const result = await processReport(file)
  return new Response(result, {
    headers: {
      'Content-Type': 'application/pdf'
    }
  })
} catch (error) {
  console.error('Error in /api/process:', error)

  // Message générique pour utilisateur
  return Response.json({
    error: 'Une erreur est survenue lors du traitement du rapport'
  }, {
    status: 500
  })
}
```

**Types d'erreurs :**
```typescript
// Erreur validation
if (!file) {
  return Response.json(
    { error: 'Aucun fichier fourni' },
    { status: 400 }
  )
}

// Erreur extraction
try {
  const extracted = await extractWordContentAdvanced(buffer)
} catch (error) {
  return Response.json(
    { error: 'Erreur lors de l\'extraction du fichier Word' },
    { status: 500 }
  )
}

// Erreur IA
try {
  const analysis = await analyzeReportWithAI(extracted)
} catch (error) {
  return Response.json(
    { error: 'Erreur lors de l\'analyse par IA' },
    { status: 500 }
  )
}

// Erreur génération PDF
try {
  const pdf = await generatePDFV2(reportData)
} catch (error) {
  return Response.json(
    { error: 'Erreur lors de la génération du PDF' },
    { status: 500 }
  )
}
```

### 13.3 Gestion d'erreur frontend

**Hook d'état :**
```typescript
const [error, setError] = useState<string | null>(null)

const handleProcess = async () => {
  try {
    setError(null)
    // Traitement...
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Une erreur est survenue'
    )
  }
}
```

**Affichage d'erreur :**
```tsx
{error && (
  <Alert variant="error">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erreur</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

### 13.4 Logging et monitoring

**Console logs :**
```typescript
// Développement
console.log('Extraction started')
console.log('Claude analysis completed')

// Production
console.error('Error in API:', error)
```

**Monitoring Slack :**
- Feedback utilisateur envoyé automatiquement
- Erreurs critiques rapportées
- Stack traces incluses

**Recommandation future :**
- Intégrer Sentry pour monitoring avancé
- Logs structurés avec Winston
- Dashboard de métriques

### 13.5 Fallbacks et dégradation

**Fallback extraction :**
```typescript
try {
  // Méthode 1: officeparser
  return await parseWithOfficeParser(buffer)
} catch (error) {
  // Fallback: mammoth
  return await parseWithMammoth(buffer)
}
```

**Fallback analyse IA :**
```typescript
try {
  const analysis = await analyzeReportWithAI(data)
  return analysis
} catch (error) {
  // Retour données minimales sans IA
  return {
    analysedData: createDefaultAnalysis(data.text),
    images: data.images,
    originalTables: data.tables
  }
}
```

---

## 14. Optimisations

### 14.1 Optimisations API (Claude)

**Fichier :** `OPTIMISATIONS_API_CLAUDE.md`

**1. Utilisation de Haiku pour images (10x moins cher) :**
```typescript
// Avant (Sonnet)
// Coût: ~0.10€ pour 10 images

// Après (Haiku)
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-20250514',
  max_tokens: 300,
  temperature: 0.1
})
// Coût: ~0.01€ pour 10 images
```

**2. Prompt caching :**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' }  // Cache 5 minutes
    }
  ]
})
```

**3. Limitation tokens :**
```typescript
// Analyse texte
max_tokens: 4000  // Suffisant pour rapport complet

// Analyse image
max_tokens: 300   // Suffisant pour classification
```

**4. Température basse :**
```typescript
// Analyse texte
temperature: 0.2   // Cohérence et consistance

// Analyse image
temperature: 0.1   // Maximum de consistance
```

**5. Analyse unifiée (1 appel au lieu de plusieurs) :**
```typescript
// Avant: 5 appels séparés
// - Extraction client
// - Extraction piscine
// - Extraction équipements
// - Extraction tests
// - Corrections orthographe

// Après: 1 seul appel
const analysis = await analyzeReportWithAI(fullText)
// Retourne tout en une fois
```

**Économies totales :**
- **Avant :** ~0.20€ par rapport
- **Après :** ~0.03€ par rapport
- **Réduction :** 85% des coûts

### 14.2 Optimisations frontend

**1. Code splitting :**
```typescript
// Composants lourds en lazy loading
const PDFEditor = dynamic(() => import('@/components/pdf-editor'), {
  loading: () => <Spinner />,
  ssr: false
})
```

**2. Memoization :**
```typescript
const MemoizedUploadZone = React.memo(UploadZone)

const processedImages = useMemo(
  () => images.filter(img => img.analysis),
  [images]
)
```

**3. Optimisation images Next.js :**
```typescript
import Image from 'next/image'

<Image
  src="/logo-locamex-light.webp"
  alt="LOCAMEX"
  width={120}
  height={24}
  priority  // Au-dessus de la ligne de flottaison
/>
```

**4. Debouncing :**
```typescript
const debouncedSearch = useDebouncedCallback(
  (value) => setSearchTerm(value),
  500
)
```

### 14.3 Optimisations PDF

**1. Compression images :**
```typescript
doc.addImage(
  imageBase64,
  'JPEG',
  x, y, width, height,
  undefined,
  'FAST',  // Compression rapide
  0        // Rotation
)
```

**2. Limitation taille images :**
```typescript
const maxWidth = 170  // mm
const maxHeight = 200 // mm

// Redimensionner si trop grand
if (originalWidth > maxWidth) {
  const ratio = maxWidth / originalWidth
  width = maxWidth
  height = originalHeight * ratio
}
```

**3. Polices standard (pas d'embedding) :**
```typescript
// Utilise Helvetica (standard PDF)
doc.setFont('helvetica')
// Pas besoin de charger des polices custom
```

**4. Pagination intelligente :**
```typescript
// Éviter de couper les éléments
if (yPos + elementHeight > pageHeight - margin) {
  doc.addPage()  // Nouvelle page
  yPos = margin + headerHeight
}
```

### 14.4 Optimisations Vercel

**Configuration Next.js :**
```typescript
// next.config.ts
export default {
  // Durée max fonction serverless
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  },

  // Optimisations build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.matixweb.fr'
      }
    ]
  }
}
```

**Runtime configuration :**
```typescript
// app/api/process/route.ts
export const runtime = 'nodejs'
export const maxDuration = 120  // secondes
```

### 14.5 Performance metrics

**Temps de traitement moyens :**
- Upload + validation : < 1s
- Extraction Word : 2-5s
- Analyse Claude : 30-60s
- Analyse images : 10-20s
- Génération PDF : 5-10s
- **Total : 50-95s**

**Taille des fichiers :**
- PDF généré : 500 KB - 3 MB
- Assets JS : ~200 KB (gzipped)
- Assets CSS : ~50 KB (gzipped)

---

## 15. Variables d'environnement

### 15.1 Fichier `.env.local`

```bash
# ============================================
# API ANTHROPIC CLAUDE
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Description:
# Clé API pour accéder à Claude 3.5 Sonnet et Claude Haiku
# Obtenue sur: https://console.anthropic.com/
# Utilisée dans: lib/report-analyzer.ts, lib/image-analyzer.ts

# ============================================
# WEBHOOK SLACK (FEEDBACK)
# ============================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/xxxxx

# Description:
# URL du webhook Slack pour recevoir les feedbacks
# Créée dans: Slack App > Incoming Webhooks
# Utilisée dans: app/api/feedback/route.ts

# ============================================
# MODE SIMPLE (DÉVELOPPEMENT)
# ============================================
USE_SIMPLE_PROMPT=false

# Description:
# Active le prompt simplifié pour tests rapides
# true = Utilise analyseur-simple.ts (plus rapide, moins précis)
# false = Utilise analyseur-rapport.ts (production)
# Utilisée dans: lib/report-analyzer.ts

# ============================================
# OPENAI (LEGACY - NON UTILISÉ)
# ============================================
OPENAI_API_KEY=sk-proj-xxxxx

# Description:
# Clé API OpenAI (non utilisée actuellement)
# Historique: Utilisée avant migration vers Claude
# Status: À supprimer si non nécessaire
```

### 15.2 Configuration Vercel (Production)

**Dashboard Vercel > Settings > Environment Variables :**

| Variable | Value | Environment |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview, Development |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Production, Preview |
| `USE_SIMPLE_PROMPT` | `false` | Production |

**Sécurité :**
- Valeurs chiffrées au repos
- Pas d'exposition dans les logs
- Accessible uniquement aux fonctions serverless
- Rotation possible sans redéploiement

### 15.3 Accès aux variables

**Dans API Routes :**
```typescript
// app/api/process/route.ts
const apiKey = process.env.ANTHROPIC_API_KEY
const useSimplePrompt = process.env.USE_SIMPLE_PROMPT === 'true'
```

**Validation au démarrage :**
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required')
}
```

**Pas d'accès côté client :**
```typescript
// ❌ NE FONCTIONNE PAS (côté client)
console.log(process.env.ANTHROPIC_API_KEY)  // undefined

// ✅ Fonctionne uniquement côté serveur (API Routes)
```

---

## 16. Déploiement

### 16.1 Prérequis

**Avant de déployer :**
- ✅ Compte Vercel créé
- ✅ Repository Git (GitHub, GitLab, Bitbucket)
- ✅ Clés API obtenues (Anthropic, Slack)
- ✅ Tests en local réussis
- ✅ Build sans erreur

### 16.2 Déploiement sur Vercel

**Méthode 1 : Via Dashboard Vercel**

1. Connecter le repository :
   - Aller sur vercel.com
   - "Add New" > "Project"
   - Importer repository GitHub
   - Sélectionner "locamex"

2. Configuration :
   - Framework Preset : Next.js (détecté auto)
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `.next`

3. Variables d'environnement :
   - Ajouter `ANTHROPIC_API_KEY`
   - Ajouter `SLACK_WEBHOOK_URL`
   - Ajouter `USE_SIMPLE_PROMPT=false`

4. Déployer :
   - Cliquer "Deploy"
   - Attendre 2-3 minutes
   - URL générée : `https://locamex-xxxxx.vercel.app`

**Méthode 2 : Via CLI Vercel**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Premier déploiement
vercel

# Définir les variables d'environnement
vercel env add ANTHROPIC_API_KEY production
vercel env add SLACK_WEBHOOK_URL production

# Déploiement production
vercel --prod
```

### 16.3 Configuration Next.js pour production

**Fichier :** `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimisations production
  reactStrictMode: true,
  poweredByHeader: false,

  // Images externes
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.matixweb.fr',
        pathname: '/**'
      }
    ]
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

### 16.4 Domaine personnalisé

**Ajouter un domaine :**

1. Dashboard Vercel > Project > Settings > Domains
2. Ajouter domaine : `app.locamex.org`
3. Configurer DNS :
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
4. Attendre propagation DNS (5-30 minutes)
5. Certificat SSL automatique (Let's Encrypt)

### 16.5 Déploiement automatique

**Branch protection :**
```
main → Production
develop → Preview
feature/* → Preview
```

**Workflow :**
```
1. Développement local
   ↓
2. Commit + Push vers GitHub
   ↓
3. Vercel détecte le push
   ↓
4. Build automatique
   ↓
5. Tests (si configurés)
   ↓
6. Déploiement automatique
   ↓
7. URL preview ou production
```

**Configuration GitHub Actions (optionnel) :**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test  # Si tests configurés
```

### 16.6 Monitoring en production

**Vercel Analytics :**
- Visites
- Core Web Vitals
- Temps de chargement
- Taux d'erreur

**Vercel Logs :**
- Logs des fonctions serverless
- Erreurs runtime
- Durée d'exécution

**Slack Notifications :**
- Feedback utilisateurs
- Erreurs critiques
- Bugs rapportés

---

## 17. Guide de démarrage

### 17.1 Installation locale

**Prérequis :**
- Node.js 18+ installé
- Git installé
- Éditeur de code (VS Code recommandé)

**Étapes :**

```bash
# 1. Cloner le repository
git clone https://github.com/YayaaKhalis/locamexRapport.git
cd locamex

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local
cp .env.example .env.local

# 4. Éditer .env.local avec vos clés
nano .env.local
# Ajouter:
# ANTHROPIC_API_KEY=sk-ant-xxxxx
# SLACK_WEBHOOK_URL=https://hooks.slack.com/xxxxx

# 5. Lancer le serveur de développement
npm run dev

# 6. Ouvrir dans le navigateur
# http://localhost:3000
```

### 17.2 Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer serveur dev (port 3000)

# Production
npm run build        # Build pour production
npm start            # Démarrer serveur production

# Qualité
npm run lint         # Linter ESLint
npm run type-check   # Vérifier types TypeScript (si configuré)

# Nettoyage
rm -rf .next node_modules  # Nettoyage complet
npm install                 # Réinstallation
```

### 17.3 Tester l'application

**1. Upload simple :**
- Ouvrir http://localhost:3000
- Glisser un fichier .docx
- Cliquer "Traiter le rapport"
- Attendre 1-2 minutes
- Télécharger le PDF

**2. Test avec fichier exemple :**
```bash
# Créer un fichier test (si disponible)
# Ou utiliser un rapport LOCAMEX existant
```

**3. Vérifier le PDF :**
- Ouvrir le PDF téléchargé
- Vérifier le branding LOCAMEX
- Vérifier les corrections orthographiques
- Vérifier les images
- Vérifier les tableaux

### 17.4 Résolution de problèmes

**Erreur : "ANTHROPIC_API_KEY manquante"**
```bash
# Solution:
echo 'ANTHROPIC_API_KEY=sk-ant-xxxxx' >> .env.local
```

**Erreur : "Cannot find module"**
```bash
# Solution:
rm -rf node_modules package-lock.json
npm install
```

**Erreur : "Port 3000 already in use"**
```bash
# Solution:
lsof -ti:3000 | xargs kill -9
# Ou changer le port:
PORT=3001 npm run dev
```

**Erreur : "Internal Server Error"**
```bash
# Solution:
rm -rf .next
npm run dev
```

### 17.5 Développement

**Structure de travail recommandée :**

```
1. Créer une branche
   git checkout -b feature/nouvelle-fonctionnalite

2. Développer
   - Modifier les fichiers
   - Tester localement
   - Vérifier pas d'erreur TypeScript

3. Commit
   git add .
   git commit -m "feat: Description de la fonctionnalité"

4. Push
   git push origin feature/nouvelle-fonctionnalite

5. Pull Request
   - Créer PR sur GitHub
   - Attendre review
   - Merger vers main

6. Déploiement auto
   - Vercel déploie automatiquement
```

**Conventions de commit :**
```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatting, missing semi colons, etc
refactor: Refactoring du code
test: Ajout de tests
chore: Maintenance
```

### 17.6 Ressources utiles

**Documentation officielle :**
- Next.js : https://nextjs.org/docs
- React : https://react.dev
- TypeScript : https://www.typescriptlang.org/docs
- Tailwind CSS : https://tailwindcss.com/docs
- Framer Motion : https://www.framer.com/motion
- jsPDF : http://raw.githack.com/MrRio/jsPDF/master/docs
- Claude API : https://docs.anthropic.com

**Communauté :**
- GitHub Issues : Pour signaler des bugs
- GitHub Discussions : Pour poser des questions
- Slack LOCAMEX : Pour support interne

---

## 📊 Statistiques du projet

**Lignes de code :**
- TypeScript/TSX : ~9,715 lignes
- Components : ~1,458 lignes
- Libraries : ~5,000 lignes
- API Routes : ~300 lignes
- Pages : ~362 lignes

**Fichiers :**
- Total : 89 fichiers
- TypeScript : 45 fichiers
- Documentation : 6 fichiers
- Configuration : 8 fichiers

**Dépendances :**
- Production : 32 packages
- Développement : 16 packages
- Total : 500 packages (avec sous-dépendances)

**Performance :**
- Temps de build : ~25 secondes
- Temps de démarrage : ~1.5 secondes
- Temps de traitement : 50-95 secondes
- Taille bundle JS : ~200 KB (gzipped)

---

## 🎯 Conclusion

Cette application LOCAMEX est une solution moderne, performante et sécurisée pour automatiser la création de rapports d'inspection professionnels. Elle combine :

✅ **Intelligence Artificielle avancée** (Claude 3.5 Sonnet + Haiku Vision)
✅ **Design moderne et professionnel** (Tailwind + Framer Motion)
✅ **Performance optimisée** (85% de réduction des coûts API)
✅ **Sécurité maximale** (Zéro stockage, HTTPS, validation)
✅ **Expérience utilisateur fluide** (Drag & drop, progression, feedback)
✅ **Déploiement gratuit** (Vercel, pas de serveur à gérer)

**Impact business :**
- ⏱️ Gain de temps : 30+ minutes → 2 minutes
- ✨ Qualité : 100% de corrections orthographiques
- 🎨 Branding : Cohérence visuelle parfaite
- 💰 Coûts : ~0.03€ par rapport traité

---

**Document généré le :** 2025-12-03
**Version :** 1.0.0
**Auteur :** Documentation automatique du projet LOCAMEX
