console.log("Loading event");

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Printing the Records")
  console.log(event.Records)
  var SnsPublishTime = event.Records[0].Sns.Timestamp;
  var SnsTopicArn = event.Records[0].Sns.TopicArn;
  var SNSMessage = event.Records[0].Sns.Message;
  
  SNSMessage = JSON.parse(SNSMessage);
  console.log("Printing Message");
  console.log("Message Detail Instance ID: ", SNSMessage.detail['instance-id']);

  // var SNSMessageType = SNSMessage.notificationType;
  var SNSMessageId = SNSMessage.id;
  var SNSMessageInstanceId = SNSMessage.detail['instance-id'];
  // var SNSDestinationAddress = SNSMessage.mail.destination.toString();
  var LambdaReceiveTime = new Date().toString();
  
  console.log("Printing ID")
  console.log(SNSMessageId)

  var itemParams = {
      TableName: "karpenter-lab-SNS-Notifications",
      Item: {
        NotificationID: { S: SNSMessageId },
        PublishTime: { S: SnsPublishTime },
        InstanceId: { S: SNSMessageInstanceId }
      },
    };
    const command = new PutItemCommand(itemParams);
    try {
    const response = await client.send(command);
    console.log("Put Item Response Bounce: ", response);
    } catch (err) {
     console.log("Error", err);
    }
};
