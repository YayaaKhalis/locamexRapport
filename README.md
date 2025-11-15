# LOCAMEX - Correcteur de Rapports Automatique

Application web pour transformer automatiquement des rapports Word en PDFs professionnels avec correction orthographique et mise en page selon la charte graphique LOCAMEX.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ✅ Fonctionnalités actuelles

- ✅ Interface d'upload avec drag & drop
- ✅ Validation des fichiers (.docx uniquement, max 10 MB)
- ✅ Extraction du contenu Word (texte)
- ✅ Génération de PDF professionnel avec charte graphique LOCAMEX
- ✅ Barre de progression visuelle
- ✅ Téléchargement instantané du PDF
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Messages en français

## 🤖 Intelligence Artificielle : Claude 4.5 Sonnet

L'application utilise **Claude 4.5 Sonnet** d'Anthropic pour :
- ✅ Analyse et extraction du contenu des rapports
- ✅ Correction orthographique et grammaticale
- ✅ Analyse intelligente des images (Vision)
- ✅ Classification et tri des photos

### Configuration de l'API Anthropic

1. Créez un compte sur [Anthropic Console](https://console.anthropic.com)
2. Générez une clé API
3. Ajoutez la clé dans le fichier `.env.local` :

```bash
ANTHROPIC_API_KEY=sk-ant-votre-clé-ici
```

**Note** : La clé API est déjà configurée et l'intégration Claude est complète.

## 🎨 Charte graphique LOCAMEX

Les couleurs sont configurées dans `app/globals.css` :

- **Bleu principal** : `#0066CC`
- **Bleu foncé** : `#004080`
- **Cyan accent** : `#00A3E0`
- **Gris clair** : `#F5F5F5`
- **Texte foncé** : `#2C3E50`

## 📂 Structure du projet

```
locamex/
├── app/
│   ├── api/
│   │   └── process/
│   │       └── route.ts          # API route pour traiter les fichiers
│   ├── globals.css               # Styles globaux + couleurs LOCAMEX
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Page principale
├── components/
│   ├── ui/
│   │   ├── alert.tsx             # Composant alerte
│   │   ├── button.tsx            # Composant bouton
│   │   └── card.tsx              # Composant carte
│   ├── processing-status.tsx     # Barre de progression
│   └── upload-zone.tsx           # Zone de drag & drop
├── lib/
│   ├── pdf-generator.ts          # Génération PDF avec jsPDF
│   ├── utils.ts                  # Utilitaires
│   └── word-extractor.ts         # Extraction Word + correction IA
├── types/
│   └── index.ts                  # Types TypeScript
├── .env.local                    # Variables d'environnement (non versionné)
├── CLAUDE.md                     # Documentation complète du projet
└── package.json
```

## 🔧 Technologies utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **react-dropzone** - Upload de fichiers
- **officeparser** - Extraction Word
- **jsPDF + jsPDF-autoTable** - Génération PDF
- **Anthropic Claude 4.5 Sonnet** - Analyse de texte et d'images avec IA
- **Lucide React** - Icônes

## 🧪 Tests manuels recommandés

1. **Upload basique** : Déposer un fichier .docx simple
2. **Validation** : Essayer d'uploader un .pdf ou .txt (doit être rejeté)
3. **Fichier volumineux** : Essayer un fichier > 10 MB (doit être rejeté)
4. **Génération PDF** : Vérifier que le PDF contient le texte et respecte la charte

## 🚀 Déploiement sur Vercel

1. Pushez le code sur GitHub
2. Connectez votre repo à [Vercel](https://vercel.com)
3. Ajoutez la variable d'environnement `ANTHROPIC_API_KEY` dans Vercel
4. Déployez !

## 📝 Notes importantes

- Les fichiers uploadés ne sont JAMAIS sauvegardés (traitement en mémoire uniquement)
- La correction IA ne modifie JAMAIS les dates, noms, chiffres, adresses
- Le PDF généré respecte la charte graphique LOCAMEX

## 📞 Contact

Pour toute question : contact@locamex.org
