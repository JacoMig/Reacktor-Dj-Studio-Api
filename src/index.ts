import fastify from "fastify";
import cors from '@fastify/cors'
import s3Client from "./plugins/s3Client";
import routes from './routes'
import awsLambdaFastify from "@fastify/aws-lambda";

const app = fastify({
    logger: true
})
app.register(s3Client)
app.register(routes)

app.register(cors) 


export const handler = awsLambdaFastify(app);
