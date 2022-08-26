import { join } from "path";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.function = new lambda_nodejs.NodejsFunction(
      this,
      "HitCounterHandler",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: join(__dirname, "..", "lambda", "hitcounter.ts"), // code loaded from "lambda" directory
        architecture: lambda.Architecture.ARM_64,
        bundling: {
          minify: true,
          sourceMap: true,
        },
        environment: {
          NODE_OPTIONS: "--enable-source-maps",
          DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
          HITS_TABLE_NAME: table.tableName,
        },
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_135_0,
        timeout: Duration.seconds(5),
      }
    );

    table.grantWriteData(this.function);

    props.downstream.grantInvoke(this.function);
  }
}
