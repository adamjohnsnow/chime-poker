"use server";
import {
  Attendee,
  ChimeSDKMeetings,
  Meeting,
} from "@aws-sdk/client-chime-sdk-meetings";
import { randomUUID } from "crypto";

export type ChimeConfig = Meeting;
export type ChimeAttendee = Attendee;

export async function newChime(gameId: string) {
  // You must use "us-east-1" as the region for Chime API and set the endpoint.
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });
  const result = await chime.createMeeting({
    MediaRegion: "eu-west-2",
    ExternalMeetingId: gameId,
  });

  return result.Meeting;
}

export async function createAttendee(config: Meeting) {
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });
  const attendee = await chime.createAttendee({
    MeetingId: config.MeetingId,
    ExternalUserId: randomUUID(),
  });
  return attendee.Attendee;
}
