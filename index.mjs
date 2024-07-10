console.log("Loading event");

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new DynamoDBClient({});
const client_s3 = new S3Client({ region: "us-east-1"});

const BUCKET_NAME = 'lab-karpenter-historical-data';
const FILE_NAME = 'spot_interruption_metrics.csv';

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
  
  // Persists the Message relevant keys and values into the DynamoDB 
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
    
    // Configure S3 Bucket and Object
    
    
    
    
    // Persist the Message to an S3 bucket
    
    try {
        let csvContent = "publish_time,message_id,instance_id\n";  // CSV header
        const get_input = {
            Bucket: "lab-karpenter-historical-data",
            Key: "spot_interruption_metrics.csv"
            }
        // Check if the file exists and read its content
        console.log("Antes de buscar o Objeto", csvContent)
        try {
            const get_command = new GetObjectCommand(get_input);
            const data = await client_s3.send(get_command);
            console.log("data --->",data.Body.transformToString())
            csvContent = data.Body.transformToString();
        } catch (err) {
            //if (err.code !== 'NoSuchKey') throw err;
            console.log("Error", err);
        }
        console.log("Depois de Buscar o Objeto",csvContent)
        // Process the SNS messages and append to the CSV content
        csvContent += `${SnsPublishTime},${SNSMessageId},${SNSMessageInstanceId}\n`;
        
        console.log("Conteúdo do Objeto", csvContent);
        const put_input = {
            Bucket: "lab-karpenter-historical-data",
            Key: "spot_interruption_metrics.csv",
            Body: csvContent
        }
        // Write updated CSV content back to S3
        const put_command = new PutObjectCommand(put_input);
        const response = await client_s3.send(put_command);
        console.log("Printing Result of Put Object", response);
        return {
            statusCode: 200,
            body: JSON.stringify('CSV file updated in S3')
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify('Error updating CSV file in S3')
        };
    }
    
    
    
};
