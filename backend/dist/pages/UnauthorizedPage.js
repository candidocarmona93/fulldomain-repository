import { BaseWidget } from "../../src/core/BaseWidget";
import { NotAllowedComponent } from "../Components/NotAllowedComponent ";

export class UnauthorizedPage extends BaseWidget {
    constructor() {
        super()
    }

    render() {
        this.children = [
            new NotAllowedComponent()
        ]
        return super.render();
    }
}