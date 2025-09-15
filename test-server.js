const Fastify = require('fastify');

async function startServer() {
  const fastify = Fastify({
    logger: true
  });

  // Route de test
  fastify.get('/', async (request, reply) => {
    return { message: 'API Test - Fonctionne!' };
  });

  // Route de santé
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    };
  });

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Serveur démarré sur http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
