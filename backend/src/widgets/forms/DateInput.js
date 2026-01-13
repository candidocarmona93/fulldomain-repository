import { _TypingInput } from "./_TypingInput"

export class DateInput extends _TypingInput {
    constructor(options) {
        super({
            ...options,
            inputType: 'date',
            onAttached: () => {
                this.labelElement?.classList.add('input-label-floating-widget');
            }
        })
    }

    updateUI() {
        super.updateUI();
    }
}