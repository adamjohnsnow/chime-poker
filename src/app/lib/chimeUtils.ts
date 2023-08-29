"use client";

import {
  ConsoleLogger,
  DefaultDeviceController,
  MeetingSessionConfiguration,
  DefaultMeetingSession,
  VideoTileState,
} from "amazon-chime-sdk-js";
import { ChimeConfig, ChimeAttendee } from "./chime";

export class ChimeProvider {
  private meetingSession: DefaultMeetingSession;
  private meetingId: string;
  private playerId: string;
  public eventDispatcher: (arg0: any) => void;

  constructor(
    config: ChimeConfig,
    attendee: ChimeAttendee,
    callback: (arg0: any) => void
  ) {
    this.eventDispatcher = callback;
    if (!config.MeetingId || !attendee.ExternalUserId) {
      throw "no meeting id or player id";
    }

    this.meetingId = config.MeetingId;
    this.playerId = attendee.ExternalUserId;
    const logger = new ConsoleLogger("MyLogger", 3);
    const deviceController = new DefaultDeviceController(logger);
    const configuration = new MeetingSessionConfiguration(
      { Meeting: config },
      { Attendee: attendee }
    );

    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );

    Promise.all([
      this.setupMic(),
      this.setupCamera(),
      this.setupSpeaker(),
      this.setUpObservers(),
      this.setUpVideoObserver(),
    ])
      .then(() => {
        this.meetingSession?.audioVideo.start();
        this.meetingSession.audioVideo.startLocalVideoTile();
      })
      .catch((error) => {
        console.error("ERROR", error);
        alert(
          "Please allow access to camera and microphone via permsision settings."
        );
      });
  }

  private async setupMic() {
    const mics = await this.meetingSession?.audioVideo.listAudioInputDevices();
    await this.meetingSession?.audioVideo.startAudioInput(mics[0]);
    // console.log("audio in: ", mics[0].deviceId);
    return Promise.resolve();
  }

  private async setupCamera() {
    const cameras =
      await this.meetingSession?.audioVideo.listVideoInputDevices();
    await this.meetingSession?.audioVideo.startVideoInput(cameras[0]);
    // console.log("camera: ", cameras[0].deviceId);
    return Promise.resolve();
  }
  private async setupSpeaker() {
    const audioElement = document.getElementById("chime-audio");
    if (!(audioElement instanceof HTMLAudioElement)) {
      return;
    }
    this.meetingSession?.audioVideo.bindAudioElement(
      audioElement as HTMLAudioElement
    );
    const speakers =
      await this.meetingSession?.audioVideo.listAudioOutputDevices();
    await this.meetingSession?.audioVideo.chooseAudioOutput(
      speakers[0].deviceId
    );
    // console.log("audio out: ", speakers[0].deviceId);
    return Promise.resolve();
  }

  private async setUpObservers() {
    await this.settUpAttendeeObserver();
    await this.setUpVideoObserver();

    // game messages
    await this.meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(
      this.meetingId,
      (message) => {
        const jsonString = Buffer.from(message.data).toString("utf8");
        const parsedData = JSON.parse(jsonString);

        this.eventDispatcher(parsedData);
      }
    );

    // player messages
    await this.meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(
      this.playerId,
      (message) => {
        const jsonString = Buffer.from(message.data).toString("utf8");
        const parsedData = JSON.parse(jsonString);

        this.eventDispatcher(parsedData);
      }
    );

    console.log("obsevers initialised", this.meetingId);
    return Promise.resolve();
  }

  public sendMessage(content: string) {
    this.meetingSession.audioVideo.realtimeSendDataMessage(
      this.meetingId,
      content
    );
  }

  public sendPlayerMessage(playerId: string, content: string) {
    this.meetingSession.audioVideo.realtimeSendDataMessage(playerId, content);
  }

  public leaveCall() {
    console.log("LEAVING CALL", this.meetingSession);
    this.meetingSession.audioVideo.stopVideoInput();
    this.meetingSession.audioVideo.stopAudioInput();
    this.meetingSession.audioVideo.stop();
  }

  private settUpAttendeeObserver() {
    this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(
      (
        attendeeId: string,
        present: boolean,
        externalUserId?: string,
        dropped?: boolean
      ) => {
        if (present && !dropped) {
          this.eventDispatcher({
            message: "newPlayer",
            playerId: externalUserId,
          });
        } else {
          this.eventDispatcher({
            message: "playerDropped",
            playerId: externalUserId,
          });
        }
      }
    );
  }

  private async setUpVideoObserver(): Promise<void> {
    this.meetingSession?.audioVideo.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (!tileState.localTile && tileState.boundExternalUserId) {
          setTimeout(() => {
            const playerVid = document.getElementById(
              tileState.boundExternalUserId as string
            ) as HTMLVideoElement;
            if (!playerVid) {
              console.log("vid tile not found");
              return;
            }
            this.meetingSession.audioVideo.bindVideoElement(
              tileState.tileId as number,
              playerVid
            );
          }, 1000);
        }
        if (tileState.localTile && !tileState.boundVideoElement) {
          const myVid = document.getElementById("local") as HTMLVideoElement;
          if (!myVid) {
            return;
          }

          this.meetingSession.audioVideo.bindVideoElement(
            tileState.tileId as number,
            myVid
          );
        }
      },
    });
    return Promise.resolve();
  }
}
