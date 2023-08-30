export const query = {
  Items: [
    {
      content: {
        S: `{"cards\":[{"value":7,"suit":"♣️"},{"value":4,"suit":"♣️"}],"id":"095b3f67-02eb-41aa-aafb-f5cab1c77ca2","name":"Player 1","cash":10000,"currentBet":0,"folded":false, "active": true}`,
      },
      sk: {
        S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf:095b3f67-02eb-41aa-aafb-f5cab1c77ca2",
      },
      id: { S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf" },
    },
    {
      content: {
        S: '{"cards":[{"value":14,"suit":"♠️"},{"value":6,"suit":"♠️"}],"id":"b3c51b4d-767d-4e65-abaf-9f1b20081fe9","name":"Player 2","cash":10000,"currentBet":0,"folded":true, "active": true}',
      },
      sk: {
        S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf:b3c51b4d-767d-4e65-abaf-9f1b20081fe9",
      },
      id: { S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf" },
    },
    {
      content: {
        S: '{"id":"736bbf1b-8b1c-4d9b-ace6-92a59145c8cf","chimeConfig":{"ExternalMeetingId":"736bbf1b-8b1c-4d9b-ace6-92a59145c8cf","MediaPlacement":{"AudioFallbackUrl":"wss://haxrp.m1.ew2.app.chime.aws:443/calls/44bb852a-19bb-442e-95b5-29b69ad42713","AudioHostUrl":"015c031571186e3fa05ca9326fd2f59e.k.m1.ew2.app.chime.aws:3478","EventIngestionUrl":"https://data.svc.ue1.ingest.chime.aws/v1/client-events","ScreenDataUrl":"wss://bitpw.m1.ew2.app.chime.aws:443/v2/screen/44bb852a-19bb-442e-95b5-29b69ad42713","ScreenSharingUrl":"wss://bitpw.m1.ew2.app.chime.aws:443/v2/screen/44bb852a-19bb-442e-95b5-29b69ad42713","ScreenViewingUrl":"wss://bitpw.m1.ew2.app.chime.aws:443/ws/connect?passcode=null&viewer_uuid=null&X-BitHub-Call-Id=44bb852a-19bb-442e-95b5-29b69ad42713","SignalingUrl":"wss://signal.m1.ew2.app.chime.aws/control/44bb852a-19bb-442e-95b5-29b69ad42713","TurnControlUrl":"https://2713.cell.us-east-1.meetings.chime.aws/v2/turn_sessions"},"MediaRegion":"eu-west-2","MeetingArn":"arn:aws:chime:us-east-1:790625822239:meeting/44bb852a-19bb-442e-95b5-29b69ad42713","MeetingId":"44bb852a-19bb-442e-95b5-29b69ad42713","TenantIds":[]},"cardDeck":[{"value":9,"suit":"♠️"},{"value":12,"suit":"♥️"},{"value":6,"suit":"♦️"},{"value":11,"suit":"♦️"},{"value":10,"suit":"♣️"},{"value":12,"suit":"♠️"},{"value":5,"suit":"♦️"},{"value":10,"suit":"♦️"},{"value":4,"suit":"♦️"},{"value":2,"suit":"♥️"},{"value":2,"suit":"♦️"},{"value":3,"suit":"♦️"},{"value":4,"suit":"♠️"},{"value":9,"suit":"♣️"},{"value":8,"suit":"♣️"},{"value":10,"suit":"♥️"},{"value":7,"suit":"♥️"},{"value":4,"suit":"♥️"},{"value":2,"suit":"♣️"},{"value":6,"suit":"♥️"},{"value":13,"suit":"♥️"},{"value":2,"suit":"♠️"},{"value":11,"suit":"♥️"},{"value":12,"suit":"♦️"},{"value":11,"suit":"♣️"},{"value":5,"suit":"♠️"},{"value":3,"suit":"♠️"},{"value":8,"suit":"♦️"},{"value":11,"suit":"♠️"},{"value":9,"suit":"♥️"},{"value":3,"suit":"♣️"},{"value":13,"suit":"♠️"},{"value":14,"suit":"♥️"},{"value":14,"suit":"♦️"},{"value":10,"suit":"♠️"},{"value":3,"suit":"♥️"},{"value":5,"suit":"♣️"},{"value":12,"suit":"♣️"},{"value":8,"suit":"♠️"},{"value":13,"suit":"♦️"},{"value":7,"suit":"♠️"},{"value":5,"suit":"♥️"},{"value":13,"suit":"♣️"},{"value":7,"suit":"♦️"}],"communityCards":[{"value":8,"suit":"♥️"},{"value":9,"suit":"♦️"},{"value":14,"suit":"♣️"},{"value":6,"suit":"♣️"}],"players":["095b3f67-02eb-41aa-aafb-f5cab1c77ca2","b3c51b4d-767d-4e65-abaf-9f1b20081fe9"]}',
      },
      sk: { S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf:game" },
      id: { S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf" },
    },
  ],
};

export const player = {
  content: {
    S: `{"cards\":[{"value":7,"suit":"♣️"},{"value":4,"suit":"♣️"}],"id":"095b3f67-02eb-41aa-aafb-f5cab1c77ca2","name":"Player 1","cash":10000,"currentBet":0,"folded":false,  "active": true}`,
  },
  sk: {
    S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf:095b3f67-02eb-41aa-aafb-f5cab1c77ca2",
  },
  id: { S: "736bbf1b-8b1c-4d9b-ace6-92a59145c8cf" },
};
