"use server";
import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";

export async function newChime(gameId: string) {
  // You must use "us-east-1" as the region for Chime API and set the endpoint.
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });
  const result = await chime.createMeeting({
    MediaRegion: "eu-west-2",
    ExternalMeetingId: gameId,
  });

  return result.Meeting?.MediaPlacement;
}
