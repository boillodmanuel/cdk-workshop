# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template


# Personal Notes

# Getting started

https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html

```bash
# Bootstrap
cdk bootstrap aws://316655187368/us-west-2 --bootstrap-customer-key

aws cloudformation describe-stacks --stack-name CDKToolkit
aws cloudformation describe-stacks --stack-name CDKToolkit --query "Stacks[0].Outputs"

cdk bootstrap --show-template > cdk-bootstrap-template.yaml

# Create a new app
cdk init app --language typescript

# Write template
cdk ls
cdk synt
cdk deploy
cdk diff
cdk watch
cdk destroy

# Generate an event
npm i -D quicktype
sam local generate-event apigateway aws-proxy > api-gateway-event.json
npx quicktype api-gateway-event.json -o ApiGatewayEvent.ts
```


# VSCode

```yaml
Settings:
  snippetSuggestions: bottom
```

# nodejs lambda in typescrip

- npm i -D @types/aws-lambda
- npm i -D esbuild

# CLI

```bash
# List all stacks (including deleted)
aws cloudformation list-stacks --query "StackSummaries[?StackName == 'HelloCdkStack'].[StackId, StackName, StackStatus]"

# List all NOT_DELETED resources of a stack
aws cloudformation list-stack-resources --stack-name "arn:aws:cloudformation:us-west-2:316655187368:stack/HelloCdkStack/206e7a00-238f-11ed-9ee6-06b80d924fad" --query  "StackResourceSummaries[?ResourceStatus!='DELETE_COMPLETE'].[ResourceType, PhysicalResourceId, ResourceStatus]"
```

## Test

```bash
jest "--silent" "false" ".\\test\\hitcounter.test.ts
```

# Doc

## CDK

- [aws-cdk-lib](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html)
- [aws-cdk-lib/aws-lambda](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html)
- [aws-cdk-lib/aws-lambda-nodejs](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html)
- [aws-cdk examples](https://github.com/aws-samples/aws-cdk-examples)
  - [lambda in typescript](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/api-cors-lambda-crud-dynamodb)
  - [lambda cloudwatch dashboard](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/lambda-cloudwatch-dashboard)
- [package java lambda with cdk](https://github.com/aws-samples/cdk-lambda-packaging-java)
- [AWS Solution Constructs Patterns](https://aws.amazon.com/solutions/constructs/patterns/)
- [CDK patterns](https://cdkpatterns.com/)
  - [Cloud Watch Dashboard](https://github.com/cdk-patterns/serverless/tree/main/the-cloudwatch-dashboard)
  - 
## LAMBDA

- [lambda deployment](https://docs.aws.amazon.com/lambda/latest/dg/typescript-package.html)
- [lambda typescript](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/welcome.html)

## Misc

- search `APIGatewayEvent` in code: [programcreek](https://www.programcreek.com/typescript/?api=aws-lambda.APIGatewayEvent)


# Testing

```bash
FOR /L %N IN () DO curl  <URL>
```