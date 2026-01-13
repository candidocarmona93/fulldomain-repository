import { BaseWidget } from "../../../../src/core/BaseWidget";
import { RowBuilder } from "../../../../src/widgets/layouts/RowBuilder";
import { Image } from "../../../../src/widgets/elements/Image";

export class PropertyGallerySection extends BaseWidget {
    constructor({ property }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.property = property;
    }

    create() {
        return new RowBuilder({
            count: this.property.galleries.length,
            breakpoints: {
                lg: 2
            },
            builder: (index) => {
                const img = this.property.galleries[index];

                return new Image({
                    src: img.url
                });
            }
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}