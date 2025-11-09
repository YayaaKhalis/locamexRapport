# Guide de Test - LOCAMEX

## ✅ L'application est prête !

L'intégration OpenAI GPT-4 est complète. Voici comment tester :

## 🚀 Accéder à l'application

L'application tourne sur : **http://localhost:3000**

## 📝 Créer un fichier Word de test

Pour tester la correction IA, créez un fichier Word (.docx) avec des fautes intentionnelles :

### Exemple de contenu avec fautes :

```
Rapport d'Inspection - Piscine M. Cholat
Date : 06/11/2025
Adresse : 248 Allée de garenne, 73230 Barby

INSPECTION RÉALISÉE

Lors de notre intervention, des plies ont été constatée sur le PVC armé du bassin.
Aumoment de nos tests, nous avons effectué une mise en pression des canalisations.

ÉQUIPEMENTS TESTÉS

- Skimmer : 2
- Bonde de fond : 1
- Refoulement : 3

RÉSULTATS

Aucun soucis constaté sur les pièces à sceller. La filtration marche bien.
Test de fluoresceine réalisé avec succès.

CONCLUSION

Le bassin est conforme. Intervention terminée le 06/11/2025.
```

### Fautes à corriger par l'IA :
- "plies" → "plis"
- "constatée" → "constatés"
- "Aumoment" → "Au moment"
- "Aucun soucis" → "Aucun souci"
- "marche bien" → "fonctionne correctement"
- "fluoresceine" → "fluorescéine"

### Ce que l'IA NE doit PAS modifier :
- Date : 06/11/2025
- Nom : M. Cholat
- Adresse : 248 Allée de garenne, 73230 Barby
- Chiffres : 2, 1, 3

## 🧪 Étapes de test

1. **Ouvrir l'application** : http://localhost:3000

2. **Télécharger ou créer votre fichier Word** avec le contenu ci-dessus

3. **Glisser-déposer** le fichier dans la zone bleue

4. **Cliquer sur "Traiter le rapport"**

5. **Observer la progression** :
   - Envoi du fichier...
   - Extraction du contenu Word...
   - Correction orthographique avec IA... (appel à OpenAI)
   - Génération du PDF professionnel...

6. **Télécharger le PDF** généré

7. **Vérifier le PDF** :
   - En-tête bleu LOCAMEX présent
   - Texte corrigé (fautes éliminées)
   - Dates, noms, chiffres intacts
   - Mise en page professionnelle
   - Pied de page avec contact LOCAMEX

## ⚡ Points importants

### La correction IA va :
✅ Corriger l'orthographe et la grammaire
✅ Utiliser le vocabulaire technique exact (PVC armé, skimmer, etc.)
✅ Améliorer la clarté des phrases
✅ Garder le ton professionnel

### La correction IA ne va PAS :
❌ Modifier les dates
❌ Modifier les noms propres
❌ Modifier les chiffres
❌ Modifier les adresses
❌ Supprimer du contenu
❌ Ajouter du contenu

## 🐛 En cas d'erreur

Si vous voyez une erreur :

1. **Vérifier les logs du serveur** dans le terminal
2. **Vérifier la clé API OpenAI** dans `.env.local`
3. **Vérifier le format du fichier** (.docx uniquement)
4. **Vérifier la taille** (max 10 MB)

## 💰 Coût estimé

Chaque rapport coûte environ **0.01-0.03€** selon sa longueur.

## 🎉 Fonctionnalités actives

- ✅ Upload drag & drop
- ✅ Validation des fichiers
- ✅ Extraction Word (officeparser)
- ✅ Correction IA (OpenAI GPT-4)
- ✅ Génération PDF (jsPDF)
- ✅ Charte graphique LOCAMEX
- ✅ Barre de progression
- ✅ Téléchargement instantané
- ✅ Messages en français
- ✅ Design responsive

## 📋 Prochaines améliorations possibles

- Extraction des images du Word
- Extraction des tableaux du Word
- Authentification utilisateur
- Historique des rapports
- Statistiques d'utilisation
- Templates personnalisés par agence
