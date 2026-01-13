import { BaseWidget } from "../../src/core/BaseWidget";
import { TaskSharedComponents } from "./TaskSharedComponents";

export class TaskCard extends BaseWidget {
    constructor(config) {
        super();

        this.task = config.task;
        this.onClick = config.onClick || (() => {});
        this.compactMode = config.compactMode || false;
        this.showAssignee = config.showAssignee !== false;
        this.showDueDate = config.showDueDate !== false;
        this.showPriority = config.showPriority !== false;
        this.showStatus = config.showStatus !== false;

        this.shared = new TaskSharedComponents();
    }

    create() {
        return this.shared.createTaskCard(this.task, {
            compactMode: this.compactMode,
            showAssignee: this.showAssignee,
            showDueDate: this.showDueDate,
            showPriority: this.showPriority,
            showStatus: this.showStatus,
            onClick: this.onClick
        });
    }
}