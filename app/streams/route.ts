import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
const YT_REGEX = new RegExp("^https://www.youtube.com/watch?v=[w-]{11}$");
const ST_REGEX = new RegExp("^https://open.spotify.com/track/[w-]{22}?si=[w]{16}");

const StreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
  type: z.enum(["Youtube", "Spotify"]),
});

const Post = async (req: NextRequest) => {
  try {
    // extract data from request
    const data = StreamSchema.parse(await req.json());

    // validate url with regex
    const isYt = YT_REGEX.test(data.url);
    const isSp = ST_REGEX.test(data.url);
    if (!isYt && !isSp) {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 411 });
    }

    // fetch id (everything after ?v=) from youtube url
    const extractedId = data.url.split("?v=")[1];

    await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: data.type,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: "Error while adding a stream" }, { status: 411 });
  }
};

export default Post;
