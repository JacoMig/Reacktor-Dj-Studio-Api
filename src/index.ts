import fastify from "fastify";
import cors from '@fastify/cors'

const HOST = process.env.HOST || '0.0.0.0'

const app = fastify({
    logger: true
})
app.register(import('./routes'))
app.register(import('./plugins/s3Client'))
app.register(cors)
app.listen({host: HOST, port: 2000 }, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})
