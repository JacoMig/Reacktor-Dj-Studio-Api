import { S3 } from "aws-sdk";
import { createS3Lib, IS3Library } from "../client/s3Client"
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    s3Client: IS3Library
  }
}


export default fp(async (server, opts) => {
     const S3Instance = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });
    
    const s3Client = createS3Lib(S3Instance)
    server.decorate('s3Client', s3Client)
})