import {
  SNSClient,
  CreateTopicCommand,
  DeleteTopicCommand,
  SubscribeCommand,
} from "@aws-sdk/client-sns";

const client = new SNSClient({ region: "eu-west-2" });

export async function createTopic(id: string) {
  const input = {
    Name: `${id}`,
  };

  const command = new CreateTopicCommand(input);
  const data = await client.send(command);
  return data.TopicArn || "";
}

export async function deleteTopic(arn: string) {
  const input = {
    TopicArn: arn,
  };

  const command = new DeleteTopicCommand(input);
  const data = await client.send(command);
  return data.$metadata.httpStatusCode;
}

export function subscribe(topic: string): any {
  const client = new SNSClient({ region: "eu-west-2" });
  const input = new SubscribeCommand({ TopicArn: topic, Protocol: "http" });
  client
    .send(input)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      alert(error);
    });
}
