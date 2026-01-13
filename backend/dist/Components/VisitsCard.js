import { BaseWidget } from "../../src/core/BaseWidget";
import { VisitsSharedComponents } from "./VisitsSharedComponents";

export class VisitsCard extends BaseWidget {
    constructor(config) {
        super();

        this.visit = config.visit;
        this.onClick = config.onClick || (() => { });
        this.showProperty = config.showProperty !== false;
        this.showClient = config.showClient !== false;
        this.showSchedule = config.showSchedule !== false;
        this.showAssignee = config.showAssignee !== false;
        this.compactMode = config.compactMode || false;
        this.showPriority = config.showPriority !== false;
        this.showTags = config.showTags !== false;
        this.customBody = config.customBody;

        this.sharedComponents = new VisitsSharedComponents();
    }

    create() {
        return this.sharedComponents.createVisitCard(this.visit, {
            compactMode: this.compactMode,
            showProperty: this.showProperty,
            showClient: this.showClient,
            showSchedule: this.showSchedule,
            showAssignee: this.showAssignee,
            showPriority: this.showPriority,
            showTags: this.showTags,
            onClick: this.onClick,
            className: []
        });
    }
}