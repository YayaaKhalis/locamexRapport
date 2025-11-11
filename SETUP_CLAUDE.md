# 🚀 Configuration de Claude AI pour LOCAMEX

Votre application utilise maintenant **Claude 3.5 Sonnet** d'Anthropic au lieu de GPT-4 pour l'analyse des rapports.

## Pourquoi Claude ?

✅ **Meilleur pour les documents longs** (200K tokens vs 128K)
✅ **Moins d'hallucinations** (plus fiable)
✅ **Meilleure compréhension de structure**
✅ **Sortie plus longue** (8192 tokens vs 4096)
✅ **Moins cher que GPT-4**
✅ **Plus rapide**

---

## 📝 Comment obtenir votre clé API Anthropic

### 1. Créer un compte Anthropic

Allez sur : **https://console.anthropic.com**

- Cliquez sur **"Sign Up"** (ou "S'inscrire")
- Créez votre compte avec votre email
- Vérifiez votre email

### 2. Obtenir votre clé API

Une fois connecté :

1. Allez dans **"API Keys"** dans le menu
2. Cliquez sur **"Create Key"** (Créer une clé)
3. Donnez un nom à votre clé (ex: "LOCAMEX Production")
4. Copiez la clé (elle commence par `sk-ant-...`)

⚠️ **IMPORTANT** : Sauvegardez cette clé immédiatement, vous ne pourrez plus la voir après !

### 3. Ajouter des crédits

Anthropic fonctionne par prépaiement :

1. Allez dans **"Billing"** (Facturation)
2. Cliquez sur **"Add credits"** (Ajouter des crédits)
3. Ajoutez au moins **$5-10** pour commencer
4. Entrez vos informations de paiement

**Coût estimé** :
- 1 rapport LOCAMEX ≈ $0.01 - 0.02
- Avec $10, vous pouvez traiter ~500-1000 rapports

---

## 🔧 Configuration de votre application

### 1. Ouvrez le fichier `.env.local`

Dans votre projet, ouvrez le fichier `.env.local` :

```bash
/Users/farid/Desktop/locamex/.env.local
```

### 2. Remplacez `VOTRE_CLE_ANTHROPIC_ICI`

Remplacez cette ligne :

```
ANTHROPIC_API_KEY="VOTRE_CLE_ANTHROPIC_ICI"
```

Par votre vraie clé :

```
ANTHROPIC_API_KEY="sk-ant-votre-vraie-cle-ici"
```

### 3. Sauvegardez le fichier

### 4. Redémarrez le serveur

```bash
# Dans le terminal, faites Ctrl+C pour arrêter
# Puis relancez :
npm run dev
```

---

## ✅ Vérification

Une fois configuré, testez en uploadant un rapport Word.

Dans les logs, vous devriez voir :

```
=== DÉBUT ANALYSE UNIVERSELLE DU RAPPORT AVEC CLAUDE ===
=== ENVOI À CLAUDE 3.5 SONNET POUR ANALYSE ===
Appel à l'API Anthropic Claude...
✅ Réponse reçue en X.Xs
=== RÉPONSE REÇUE DE CLAUDE 3.5 SONNET ===
```

Si vous voyez une erreur :
```
❌ Clé API Anthropic manquante
```

C'est que la clé n'est pas configurée correctement. Vérifiez le fichier `.env.local`.

---

## 🔐 Sécurité

⚠️ **NE JAMAIS** committer le fichier `.env.local` sur Git !

Il est déjà dans `.gitignore`, mais vérifiez :

```bash
# Vérifiez que .env.local est ignoré
cat .gitignore | grep .env.local
```

Si ce n'est pas le cas, ajoutez-le :

```bash
echo ".env.local" >> .gitignore
```

---

## 🆘 Support

Si vous avez des problèmes :

1. **Vérifiez vos crédits** sur https://console.anthropic.com
2. **Vérifiez que la clé est correcte** dans `.env.local`
3. **Redémarrez le serveur** avec `npm run dev`

---

## 📊 Comparaison GPT-4 vs Claude

| Critère | GPT-4 Turbo | Claude 3.5 Sonnet |
|---------|-------------|-------------------|
| Context window | 128K tokens | 200K tokens |
| Output max | 4K tokens | 8K tokens |
| Hallucinations | Fréquentes | Rares |
| Prix input | $0.01/1K | $0.003/1K |
| Prix output | $0.03/1K | $0.015/1K |
| Vitesse | Moyen | Rapide |
| Documents longs | Bon | Excellent |

**Verdict** : Claude 3.5 Sonnet est **2-3x moins cher** et **meilleur** pour votre cas d'usage ! 🎯

---

**Dernière mise à jour** : 11/11/2025
**Version** : 2.0 (Claude powered)
