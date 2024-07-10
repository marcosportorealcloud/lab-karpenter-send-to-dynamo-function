console.log("Loading event");

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

export const handler = async (event) => {
  // Parse event that contains an SNS Message
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  // Collect the Message and its publish time 
  var SnsPublishTime = event.Records[0].Sns.Timestamp;
  // var SnsTopicArn = event.Records[0].Sns.TopicArn;
  var SNSMessage = event.Records[0].Sns.Message;
  
  // Parse the Message which is in JSON format
  SNSMessage = JSON.parse(SNSMessage);
  
  // Store the relevant keys and values
  // var SNSMessageType = SNSMessage.notificationType;
  var SNSMessageId = SNSMessage.id;
  var SNSMessageInstanceId = SNSMessage.detail['instance-id'];
  // var SNSDestinationAddress = SNSMessage.mail.destination.toString();
  var LambdaReceiveTime = new Date().toString();
  
  // Persists the Message relevant keys and values into the DynamoDB table
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
