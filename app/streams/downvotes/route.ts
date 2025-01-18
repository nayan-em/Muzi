import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

const Post = async (req: NextRequest) => {
  // Get current user session details
  const session = await getServerSession();

  // Fetch the user detail using email id, since we don't get user id from getServerSession
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  // Extract data from request and add it to the upvote table
  try {
    const data = UpvoteSchema.parse(await req.json());
    await prismaClient.upvote.delete({
      where: {
        // There is a constraint on uniqueness of userId and streamId in the schema
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ message: "Error while upvoting" }, { status: 403 });
  }
};
