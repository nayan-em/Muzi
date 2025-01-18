import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const StreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

const Post = async (req: NextRequest) => {
  try {
    const data = StreamSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 411 }
    );
  }
};

export default Post;
