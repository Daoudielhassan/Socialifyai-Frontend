# 📧 Page de Test Gmail - Installation et Utilisation

Cette page de test a été ajoutée pour faciliter le test et le débogage de la récupération des messages Gmail dans Socialify AI.

## 🚀 Installation

### 1. Vérification des dépendances
Les dépendances suivantes sont déjà incluses dans le projet :

**Frontend :**
- `lucide-react` (icônes)
- `@headlessui/react` (composants modal)
- `react-router-dom` (navigation)

**Backend :**
- `fastapi` (API REST)
- `sqlalchemy` (ORM base de données)
- `google-api-python-client` (API Gmail)
- `google-auth-oauthlib` (OAuth Gmail)

### 2. Activation de la page

La page est automatiquement disponible après le démarrage :

**Frontend :**
```bash
cd Socialify-Frontend
npm run dev
```

**Backend :**
```bash
cd backend
python -m uvicorn main:app --reload
```

## 📱 Accès à la page

1. **Connectez-vous** à l'application Socialify
2. Dans le menu de navigation (sidebar), cliquez sur **"Test Gmail"**
3. La page se charge à l'URL : `http://localhost:5173/gmail-test`

## 🛠️ Fonctionnalités disponibles

### Interface utilisateur
- ✅ **Statut du service Gmail** en temps réel
- ✅ **Bouton de récupération manuelle** des messages
- ✅ **Affichage des résultats** de récupération
- ✅ **Liste des messages récents** avec détails complets
- ✅ **Gestion des erreurs** avec messages explicites
- ✅ **Design responsive** cohérent avec l'application

### APIs de test
- ✅ `GET /gmail/status` - Statut des services Gmail
- ✅ `POST /messages/fetch` - Récupération manuelle
- ✅ `GET /messages?source=gmail` - Messages récents
- ✅ `POST /test/gmail-fetch` - Endpoint de test dédié
- ✅ `GET /test/gmail-status` - Statut utilisateur Gmail

## 🔧 Configuration requise

### Variables d'environnement (Backend)
```bash
# Gmail OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# IA Engine
IA_ENGINE_URL=http://localhost:8001

# Base de données
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/socialtify
```

### Prérequis utilisateur
1. **Compte Gmail connecté** via OAuth2
2. **Token Gmail valide** (renouvelé automatiquement)
3. **Permissions** : accès en lecture aux emails

## 🧪 Scénarios de test

### Test 1 : Vérification du statut
1. Accédez à `/gmail-test`
2. Vérifiez que tous les statuts sont verts :
   - Service Gmail : `active`
   - Planificateur : `Actif`
   - Statut Global : `healthy`

### Test 2 : Récupération de messages
1. Cliquez sur **"Récupérer Messages"**
2. Vérifiez la section "Dernière Récupération" :
   - Statut : ✅ Succès
   - Messages récupérés : > 0
   - Pas d'erreurs

### Test 3 : Affichage des messages
1. Vérifiez la section "Messages Gmail Récents"
2. Contrôlez que chaque message affiche :
   - Expéditeur et sujet
   - Tags de priorité et contexte
   - Barre de confiance IA

### Test 4 : Gestion des erreurs
1. Déconnectez Gmail dans les paramètres
2. Tentez une récupération
3. Vérifiez l'affichage de l'erreur appropriée

## 🐛 Dépannage

### Erreur : "Page non trouvée"
**Cause** : Route manquante
**Solution** :
1. Vérifiez que `GmailTest.tsx` existe dans `/src/pages/`
2. Contrôlez que la route est ajoutée dans `App.tsx`
3. Vérifiez les imports dans les fichiers de navigation

### Erreur : "Gmail not connected"
**Cause** : Utilisateur sans token Gmail
**Solution** :
1. Allez dans Paramètres > Comptes connectés
2. Connectez Gmail via OAuth2
3. Retournez sur la page de test

### Erreur réseau : "Failed to fetch"
**Cause** : Backend non accessible
**Solution** :
1. Vérifiez que le backend tourne sur `http://localhost:8000`
2. Contrôlez les CORS dans la configuration FastAPI
3. Consultez les logs : `backend/logs/socialify_backend.log`

### Erreur : "Service unavailable"
**Cause** : Service IA non disponible
**Solution** :
1. Démarrez le microservice IA : `cd Socialtify-AI-Microservice && python api/main.py`
2. Vérifiez l'URL dans `IA_ENGINE_URL`
3. Testez l'accès : `curl http://localhost:8001/health`

## 📊 Monitoring

### Métriques importantes
- **Taux de succès** des récupérations
- **Nombre de messages** traités par récupération
- **Temps de réponse** de l'API Gmail
- **Précision des prédictions** IA

### Logs à surveiller
```bash
# Backend
tail -f backend/logs/socialify_backend.log | grep -i gmail

# Frontend (Console navigateur)
# Ouvrez les DevTools > Console pour voir les logs en temps réel
```

## 🎯 Utilisation en développement

Cette page est particulièrement utile pour :

1. **Développeurs Backend** : Tester les modifications des services Gmail
2. **Développeurs Frontend** : Valider l'interface utilisateur
3. **QA/Test** : Vérifier les scénarios de récupération
4. **DevOps** : Diagnostiquer les problèmes de production
5. **Product** : Comprendre le comportement du système

## 🔄 Mises à jour futures

La page est conçue pour être facilement extensible :

- ✅ Ajout de nouveaux indicateurs de statut
- ✅ Tests pour d'autres sources (WhatsApp, etc.)
- ✅ Métriques de performance en temps réel
- ✅ Interface d'administration des tokens
- ✅ Historique détaillé des récupérations

---

**Note** : Cette page est principalement destinée au développement et aux tests. En production, vous pourriez vouloir la restreindre aux administrateurs ou la désactiver complètement.
