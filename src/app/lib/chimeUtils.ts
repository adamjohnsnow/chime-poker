"use client";

import {
  ConsoleLogger,
  DefaultDeviceController,
  MeetingSessionConfiguration,
  DefaultMeetingSession,
} from "amazon-chime-sdk-js";
import { ChimeConfig, ChimeAttendee } from "./chime";

export class ChimeProvider {
  private meetingSession: DefaultMeetingSession;
  constructor(config: ChimeConfig, attendee: ChimeAttendee) {
    const logger = new ConsoleLogger("MyLogger", 4);
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

    Promise.all([this.setupMic(), this.setupCamera(), this.setupSpeaker()])
      .then(() => {
        this.meetingSession?.audioVideo.start();
        console.log("meeting started");
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
    console.log("audio in: ", mics[0].deviceId);
    return Promise.resolve();
  }

  private async setupCamera() {
    const cameras =
      await this.meetingSession?.audioVideo.listVideoInputDevices();
    await this.meetingSession?.audioVideo.startVideoInput(cameras[0]);
    console.log("camera: ", cameras[0].deviceId);
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
    console.log("audio out: ", speakers[0].deviceId);
    return Promise.resolve();
  }
}
