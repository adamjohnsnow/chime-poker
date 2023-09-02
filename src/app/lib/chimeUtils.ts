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
  public communityCardsDispatcher!: (arg0: any) => void | undefined;

  constructor(config: ChimeConfig, attendee: ChimeAttendee) {
    if (!config.MeetingId || !attendee.ExternalUserId) {
      throw "no meeting id or player id";
    }

    this.meetingId = config.MeetingId;
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
    if (speakers.length === 0) {
      return Promise.resolve();
    }
    await this.meetingSession?.audioVideo.chooseAudioOutput(
      speakers[0].deviceId
    );
    return Promise.resolve();
  }

  private async setUpObservers() {
    await this.settUpAttendeeObserver();
    await this.setUpVideoObserver();

    console.log("obsevers initialised", this.meetingId);
    return Promise.resolve();
  }

  public registerCardsEventListener(dispatcher: (arg0: any) => void) {
    this.communityCardsDispatcher = dispatcher;
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
          // todo
        } else {
          // todo
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
