import { Duration, Stack, StackProps, Tags } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { HitCounter } from "./hitcounter";
import { RemovalPolicyReport } from "./removal-policy-report";

export class HelloCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //  TODO: terminationProtection: true,

    const hello = new lambda_nodejs.NodejsFunction(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_16_X, // execution environment
      entry: join(__dirname, "..", "lambda", "hello.ts"), // code loaded from "lambda" directory
      architecture: lambda.Architecture.ARM_64,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_135_0,
      timeout: Duration.seconds(5),
    });

    if (hello.timeout) {
      new cloudwatch.Alarm(this, "HelloTimeoutAlarm", {
        metric: hello.metricDuration().with({
          statistic: "Maximum",
        }),
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        threshold: hello.timeout.toMilliseconds(),
        treatMissingData: cloudwatch.TreatMissingData.IGNORE,
        alarmName: "HelloTimeoutAlarm",
      });
    }

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigateway.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.function,
    });

    // import { BundlingOptions } from "aws-cdk-lib";
    // const javaFunction = new lambda.Function(this, "JavaHandler", {
    //   runtime: lambda.Runtime.JAVA_11, // execution environment
    //   code: lambda.Code.fromAsset(join(__dirname, "..", 'lambda'), {
    //     bundling: {
    //       image: lambda.Runtime.JAVA_11.bundlingImage,
    //       local: {
    //         tryBundle: (outputDir: string, _options: BundlingOptions): boolean => {
    //           const O = outputDir
    //           console.log("outputDir", outputDir);
    //           return false;
    //         }
    //       },
    //     }
    //   }),
    //   handler: 'package.Main',
    // });

    new RemovalPolicyReport(this, "RemovalPolicyReport");

    Tags.of(this).add("sozi:env", "env");
  }
}
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// The code that defines your stack goes here

// example resource
// const queue = new sqs.Queue(this, 'HelloCdkQueue', {
//   visibilityTimeout: cdk.Duration.seconds(300)
// });

// new s3.Bucket(this, 'MyFirstBucket', {
//   versioned: true,
//   removalPolicy: cdk.RemovalPolicy.DESTROY,
// });

// const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
//   visibilityTimeout: cdk.Duration.seconds(300)
// });

// const topic = new sns.Topic(this, 'CdkWorkshopTopic');

// topic.addSubscription(new subs.SqsSubscription(queue));

// defines an AWS Lambda resource
// const hello = new lambda.Function(this, 'HelloHandler', {
//   runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
//   code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
//   handler: 'hello.handler',               // file is "hello", function is "handler"

// });
