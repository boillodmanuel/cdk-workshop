import {
    Stack,
    Aspects,
    IAspect,
    CfnResource,
    CfnDeletionPolicy,
    CfnOutput,
} from "aws-cdk-lib";
import { Construct, IConstruct } from "constructs";

interface RemovalPolicyReportProps {
    /**
     * @default RemovalPolicyReportFilter.NOT_DELETED
     */
    reportFilter?: RemovalPolicyReportFilter;
}

export class RemovalPolicyReport extends Construct {
    constructor(scope: Stack, id: string, props: RemovalPolicyReportProps = {}) {
        super(scope, id);

        const removalPolicyReportAspect = new RemovalPolicyReportAspect(
            props.reportFilter
        );

        Aspects.of(scope).add(removalPolicyReportAspect);

        new CfnOutput(this, "Resources", {
            value: scope.toJsonString(removalPolicyReportAspect.resources),
        });
    }
}

interface RemovalPolicyReportItem {
    name: string;
    logicalId: string;
    deletionPolicy?: CfnDeletionPolicy;
}

export enum RemovalPolicyReportFilter {
    ALL,
    NOT_DELETED,
}

class RemovalPolicyReportAspect implements IAspect {
    public readonly resources: RemovalPolicyReportItem[] = [];
    private found = false;
    private readonly reportFilter: RemovalPolicyReportFilter;

    constructor(
        reportFilter: RemovalPolicyReportFilter = RemovalPolicyReportFilter.NOT_DELETED
    ) {
        this.reportFilter = reportFilter;
    }

    visit(node: IConstruct): void {
        if (node instanceof CfnResource) {
            if (
                this.reportFilter === RemovalPolicyReportFilter.ALL ||
                (node.cfnOptions.deletionPolicy &&
                    node.cfnOptions.deletionPolicy !== CfnDeletionPolicy.DELETE)
            ) {
                this.resources.push({
                    name: node.toString(),
                    logicalId: node.logicalId,
                    deletionPolicy: node.cfnOptions.deletionPolicy,
                });
                this.found = true;
            }
        }
    }

    isFound(): boolean {
        return this.found;
    }
}
