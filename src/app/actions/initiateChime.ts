"use server";
import * as AWS_ChimeSDKMeetings from "@aws-sdk/client-chime-sdk-meetings";

const { ChimeSDKMeetings } = AWS_ChimeSDKMeetings;

export async function newChime(gameId: string) {
  // You must use "us-east-1" as the region for Chime API and set the endpoint.
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });
  const res = await chime.createMeeting({
    MediaRegion: "eu-west-2",
    ExternalMeetingId: gameId,
  });

  return res.Meeting?.MediaPlacement;
}
