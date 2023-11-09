"use client";

import {
  ConsoleLogger,
  DefaultDeviceController,
  MeetingSessionConfiguration,
  DefaultMeetingSession,
  VideoTileState,
} from "amazon-chime-sdk-js";
import { ChimeConfig, ChimeAttendee } from "./chime";
import { setPlayerStatus } from "./player";

export class ChimeProvider {
  private meetingSession: DefaultMeetingSession;
  private meetingId: string;
  private gameId: string;
  private selectedMic: MediaDeviceInfo | undefined;
  private selectedCamera: MediaDeviceInfo | undefined;
  private selectedSpeakerId: string | undefined;

  public communityCardsDispatcher!: (arg0: any) => void | undefined;

  constructor(config: ChimeConfig, attendee: ChimeAttendee) {
    if (!config.MeetingId || !attendee.ExternalUserId) {
      throw "no meeting id or player id";
    }

    this.meetingId = config.MeetingId;
    this.gameId = config.ExternalMeetingId as string;
    const logger = new ConsoleLogger("MyLogger", 2);
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
    this.selectedMic = mics[0];
    await this.unMuteMic();
    return Promise.resolve();
  }

  public async muteMic() {
    await this.meetingSession?.audioVideo.stopAudioInput();
  }

  public async unMuteMic() {
    if (this.selectedMic) {
      await this.meetingSession?.audioVideo.startAudioInput(this.selectedMic);
    }
  }

  private async setupCamera() {
    const cameras =
      await this.meetingSession?.audioVideo.listVideoInputDevices();
    this.selectedCamera = cameras[0];
    await this.turnOnCamera();
    return Promise.resolve();
  }

  public async turnOnCamera() {
    if (this.selectedCamera) {
      await this.meetingSession.audioVideo.startVideoInput(this.selectedCamera);
      this.meetingSession.audioVideo.startLocalVideoTile();
    }
  }

  public async turnOffCamera() {
    await this.meetingSession?.audioVideo.stopVideoInput();
    await this.meetingSession.audioVideo.stopLocalVideoTile();
    this.meetingSession.audioVideo.removeLocalVideoTile();
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
    this.selectedSpeakerId = speakers[0].deviceId;
    await this.meetingSession?.audioVideo.chooseAudioOutput(
      this.selectedSpeakerId
    );
    return Promise.resolve();
  }

  public async turnOnSpeaker() {
    if (this.selectedSpeakerId) {
      await this.meetingSession.audioVideo.chooseAudioOutput(
        this.selectedSpeakerId
      );
    }
  }

  public async turnOffSpeaker() {
    await this.meetingSession.audioVideo.chooseAudioOutput(null);
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

  public async leaveCall() {
    console.log("LEAVING CALL", this.meetingSession);
    await this.meetingSession.audioVideo.stopVideoInput();
    await this.meetingSession.audioVideo.stopAudioInput();
    await this.meetingSession.audioVideo.stop();
  }

  private settUpAttendeeObserver() {
    this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(
      (
        _attendeeId: string,
        present: boolean,
        externalUserId?: string,
        dropped?: boolean
      ) => {
        if ((!present || dropped) && externalUserId) {
          setPlayerStatus(this.gameId, externalUserId, false);
        }
        if (present && !dropped && externalUserId) {
          setPlayerStatus(this.gameId, externalUserId, true);
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
