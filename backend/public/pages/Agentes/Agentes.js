import { BaseWidget } from "../../../src/core/BaseWidget";
import { BaseEntityHomePage } from "../BaseEntityHomePage";
import { Text } from "../../../src/widgets/elements/Text";
import { RowBuilder } from "../../../src/widgets/layouts/RowBuilder";

export class Agents extends BaseWidget {

    constructor() {
        super()
    }

    render() {
        this.children = [
            new RowBuilder()
        ]
    }
}