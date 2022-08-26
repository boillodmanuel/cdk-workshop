import { Template, Capture, Match, Matcher } from 'aws-cdk-lib/assertions';
import { Stack, Names, CfnElement } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../lib/hitcounter';

xtest('DynamoDB Table Created', () => {
  const stack = new Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test('Lambda Has Environment Variables', () => {
  const stack = new Stack();
  // WHEN
  const hitCounter = new HitCounter(stack, 'HitCounterTest', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        KEY: 'value'
      }
    })
  });

  // Get the construct name => "HitCounterTest"
  const hitCounterName = Names.uniqueId(hitCounter);
  console.log("hitCounterName", hitCounterName)

  // Get the construct logicial id => HitCounterTestHitCounterHandlerD4199A80
  const hitCounterLogicalId = stack.getLogicalId(hitCounter.function.node.defaultChild as CfnElement);
  console.log("hitCounterLogicalId", hitCounterLogicalId)

  // Get the construct path => "Default/HitCounterTest"
  console.log("hitCounterPath", hitCounter.node.path)

  // Get the construct addr => "c89681e55b7d3d31cdcb2ea937f3b11541e2c6b698"
  console.log("hitCounterAddr", hitCounter.node.addr)

  // THEN
  const template = Template.fromStack(stack);
  // console.log("template", JSON.stringify(template))

  const envCapture = new Capture();
  template.resourceCountIs("AWS::Lambda::Function", 2)

  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  console.log("first envCapture", envCapture.asObject())

  expect.extend({
    toMatchCdkMatcher(received: any, matcher: Matcher) {
      const matchResult = matcher.test(received)
      if (matchResult.hasFailed()) {
        return {
          message: () =>
            `expected ${received} to match. ${matchResult.toHumanStrings().join(' - ')}`,
          pass: false,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to not match`,
          pass: true,
        };
      }
    },
  })

  expect(envCapture.asObject()).toMatchCdkMatcher(Match.objectEquals(
    {
      Variables: {
        KEY: Match.anyValue(),
      },
    }
  ));

  expect(envCapture.next()).toBe(true)
  // console.log("second envCapture", envCapture.asObject())
  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        NODE_OPTIONS: "--enable-source-maps",
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunction22AD90FC",
        },
        HITS_TABLE_NAME: {
          Ref: "HitCounterTestHits2DA6AB73",
        },
      },
    }
  );

  expect(envCapture.asObject()).toMatchCdkMatcher(Match.objectLike(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: Match.stringLikeRegexp("^TestFunction"),
        },
        HITS_TABLE_NAME: {
          Ref: Match.stringLikeRegexp("^HitCounterTestHits"),
        },
      },
    }
  ));

  // Get resource definition by logicial id
  const functions = template.findResources("AWS::Lambda::Function")
  const hitCounterFunctionName = Object.keys(functions).find(k => k.includes('HitCounterHandler'))
  expect(hitCounterFunctionName).toBeDefined()
  console.log("hitCounterFunctionName", hitCounterFunctionName)
  
  const hitCounterFunction = functions[hitCounterFunctionName!];
  console.log("hitCounterFunction", hitCounterFunction)

  expect(hitCounterFunction.Properties.Environment).toMatchCdkMatcher(Match.objectLike(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: Match.stringLikeRegexp("TestFunction"),
        },
        HITS_TABLE_NAME: {
          Ref: Match.stringLikeRegexp("HitCounterTestHits"),
        },
      },
    }
  ));
});
