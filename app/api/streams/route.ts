import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const ST_REGEX = new RegExp("^https://open.spotify.com/track/[w-]{22}?si=[w]{16}");

const StreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
  type: z.enum(["Youtube", "Spotify"]),
});

const Post = async (req: NextRequest) => {
  console.log("Nayan");
  try {
    // extract data from request
    const data = StreamSchema.parse(await req.json());
    console.log(data);

    // validate url with regex
    const isYt = data.url.match(YT_REGEX);
    const isSp = ST_REGEX.test(data.url);
    if (!isYt && !isSp) {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 411 });
    }

    // fetch id (everything after ?v=) from youtube url
    const extractedId = data.url.split("?v=")[1];

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: data.type,
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

export { Post as POST, Get as GET };
