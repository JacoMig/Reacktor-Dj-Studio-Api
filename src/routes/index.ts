import ytdl from "@distube/ytdl-core";
import { FastifyPluginAsync } from "fastify";
import yts, { VideoSearchResult } from "yt-search";

type GetStreamRequest = {
    videoId: string
}

type SearchRequest = {
    q: string
}

type SearchVideoResponse = {
    timestamp: string,
    videoId: string,
    thumbnail?: string,
    title: string,
    url: string
}[]

type SearchResponse = {
    count: number
    videos?: SearchVideoResponse
}

const routes: FastifyPluginAsync = async (server) => {
  server.post<{Body: GetStreamRequest}>(
    "/getStream",
    {
       schema: {
        body: {
            type: "object",
            properties: {
              videoId: { type: 'string' }
            }
        }

      }, 
    },
    async (request, response) => {
      ytdl.createProxyAgent({ uri: 'http://localhost:5173' });
      const t = ytdl(`http://www.youtube.com/watch?v=${request.body.videoId}`, {
        filter: "audioonly"
      })
      
      return t;
    }
  );

  server.get<{Querystring: SearchRequest, Response: SearchResponse }>(
    "/search",
    {
        schema: {
            querystring: {
                type: "object",
                properties: {
                    query: {type: 'string'}
                }
            },
            /* response: {
                200: {
                    type: "object",
                    properties: {
                        timestamp: {type: 'string'},
                        videoId: {type: 'string'},
                        thumbnail: {type: 'string'},
                        title: {type: 'string'}
                    }
                }
            } */
        }, 
    },
    async (request, response):Promise<SearchResponse> => {
        const query = request.query.q

        if(!query || query === "") 
            return {
                count: 0
            }
        

        const resp = await yts({search: query})
        
        return {
            count: resp.videos.length,
            videos: resp.videos.map(r => ({
                thumbnail: r.thumbnail,
                timestamp: r.timestamp,
                videoId: r.videoId,
                title: r.title,
                url: r.url
            })) 
        };
    }
  );
};

export default routes;
