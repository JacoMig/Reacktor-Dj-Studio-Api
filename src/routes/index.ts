import ytdl from "@distube/ytdl-core";
import { S3 } from "aws-sdk";

import { FastifyPluginAsync } from "fastify";
import yts from "yt-search";

type GetStreamRequest = {
  videoId: string;
};

type SearchRequest = {
  q: string;
};

type SearchVideoResponse = {
  timestamp: string;
  videoId: string;
  thumbnail?: string;
  title: string;
  url: string;
}[];

type SearchResponse = {
  count: number;
  videos?: SearchVideoResponse;
};

type LoadDemoSongsResponse = {
  count: number;
  data: {
    url: string;
    title: string;
  }[];
};

const routes: FastifyPluginAsync = async (server) => {
  server.post<{ Body: GetStreamRequest }>(
    "/getStream",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            videoId: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      try {
        const videoUrl = `http://www.youtube.com/watch?v=${request.body.videoId}`;

        if (!ytdl.validateURL(videoUrl)) {
          throw new Error("Invalid YouTube URL");
        }
        const audioStream = ytdl(videoUrl, {
          filter: "audioonly",
        });
        return audioStream;
      } catch (e) {
        throw new Error(e as string);
      }
    }
  );

  server.get<{ Querystring: SearchRequest; Response: SearchResponse }>(
    "/search",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
        },
      },
    },
    async (request): Promise<SearchResponse> => {
      const query = request.query.q;

      if (!query || query === "")
        return {
          count: 0,
        };

      const resp = await yts({ search: query });

      return {
        count: resp.videos.length,
        videos: resp.videos.map((r) => ({
          thumbnail: r.thumbnail,
          timestamp: r.timestamp,
          videoId: r.videoId,
          title: r.title,
          url: r.url,
        })),
      };
    }
  );

  server.get("/getDemoSongKeys", async (): Promise<LoadDemoSongsResponse> => {
    
    const demoSongsUrls = await server.s3Client.getSignedUrls({
      Bucket: "demo-songs",
    });

    return {
      count: demoSongsUrls.length || 0,
      data: demoSongsUrls.length ? demoSongsUrls.map((item) => ({
        url: item.url,
        title: item.title,
      })) : [],
    };
  });
};

export default routes;
