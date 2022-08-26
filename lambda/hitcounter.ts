import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";

const TABLE_NAME = process.env.HITS_TABLE_NAME;
const FUNCTION_NAME = process.env.DOWNSTREAM_FUNCTION_NAME;

export const handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  if (!TABLE_NAME) {
    throw new Error('Env variable "HITS_TABLE_NAME" is not defined');
  }
  if (!FUNCTION_NAME) {
    throw new Error('Env variable "DOWNSTREAM_FUNCTION_NAME" is not defined');
  }
  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  // call downstream function and capture response
  const resp = await lambda
    .invoke({
      FunctionName: FUNCTION_NAME,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload as any);

  //   return {
  //     statusCode: 200,
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       message: `Good evening TypeScript, CDK! You've hit ${event.path}`,
  //     }),
  //   };
};
