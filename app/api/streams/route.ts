import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";

const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const ST_REGEX = new RegExp("^https://open.spotify.com/track/[w-]{22}?si=[w]{16}");

const YT_API_KEY = process.env.YOUTUBE_API_KEY;

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
    const isYt = data.url.match(YT_REGEX);
    const isSp = ST_REGEX.test(data.url);
    if (!isYt && !isSp) {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 411 });
    }

    // fetch id (everything after ?v=) from youtube url
    const extractedId = data.url.split("?v=")[1];
    const { title, thumbnail } = await getYtMetadata(extractedId);

    const stream = await prismaClient.stream.create({
      data: {
        type: data.type,
        url: data.url,
        extractedId,
        title,
        thumbnail,
        userId: data.creatorId,
      },
    });

    return NextResponse.json(
      { message: "Added stream successfully", id: stream.id },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: "Error while adding a stream" }, { status: 411 });
  }
};

const Get = async (req: NextRequest) => {
  // Fetch creatorId from NextRequest and verify it
  const creatorId = req.nextUrl.searchParams.get("creatorId");

  // Fetch all streams created by the creator
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });

  return NextResponse.json(streams);
};

async function getYtMetadata(extractedId: string) {
  const metadataUrl =
    "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" +
    extractedId +
    "&key=" +
    YT_API_KEY;

  const res = await fetch(metadataUrl);
  const data = await res.json();

  const title = data.items[0].snippet.title;
  const thumbnail = data.items[0].snippet.thumbnails.high.url;

  return { title, thumbnail };
}

export { Post as POST, Get as GET };
