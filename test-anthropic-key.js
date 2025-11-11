// Script de test pour vérifier la clé API Anthropic
require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

console.log('=== TEST DE LA CLÉ API ANTHROPIC ===\n');

// Afficher la clé (masquée)
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ERREUR : ANTHROPIC_API_KEY non trouvée dans .env.local');
  process.exit(1);
}

console.log('✅ Clé trouvée :', apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10));
console.log('Longueur de la clé :', apiKey.length);
console.log('Format correct (commence par sk-ant-) :', apiKey.startsWith('sk-ant-'));

// Tester l'API
console.log('\n=== TEST DE L\'API ===\n');

const anthropic = new Anthropic({
  apiKey: apiKey,
});

async function testAPI() {
  try {
    console.log('Envoi d\'une requête de test à l\'API Anthropic...');
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Réponds juste "OK" si tu reçois ce message.'
        }
      ]
    });

    console.log('\n✅ SUCCÈS ! La clé API fonctionne correctement.');
    console.log('Réponse de Claude :', response.content[0].text);
  } catch (error) {
    console.error('\n❌ ÉCHEC ! Erreur lors du test de l\'API :');
    console.error('Code d\'erreur :', error.status);
    console.error('Message :', error.message);

    if (error.status === 401) {
      console.error('\n⚠️  La clé API est INVALIDE ou RÉVOQUÉE.');
      console.error('Solutions :');
      console.error('1. Va sur https://console.anthropic.com/settings/keys');
      console.error('2. Vérifie que la clé est active');
      console.error('3. Crée une nouvelle clé si nécessaire');
      console.error('4. Remplace la clé dans .env.local');
    }
  }
}

testAPI();
