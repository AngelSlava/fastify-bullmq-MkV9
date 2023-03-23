import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { env } from './env';

import { createQueue, setupQueueProcessor } from './queue';

interface AddJobQueryString {
  id: string
  email: string
}

const run = async () => {
  // const welcomeEmailQueue = createQueue('WelcomeEmailQueue');
  const hookQueue = createQueue('Hooks')
  const errorQueue = createQueue('Errors')
  // await setupQueueProcessor(welcomeEmailQueue.name);
  // await setupQueueProcessor(hookQueue.name);

  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify()

  const serverAdapter = new FastifyAdapter()
  createBullBoard({
    queues: [new BullMQAdapter(hookQueue), new BullMQAdapter(errorQueue)],
    serverAdapter
  })

  serverAdapter.setBasePath('/')
  server.register(serverAdapter.registerPlugin(), {prefix: '/', basePath: '/'})

  await server.listen({ port: env.PORT, host: '0.0.0.0' })
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
