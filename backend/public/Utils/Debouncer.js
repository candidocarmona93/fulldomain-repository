export class Debouncer {
    constructor(delay = 300) {
        this.delay = delay;
        this.timeout = null;
    }
    
    debounce(func) {
        return (...args) => {
            clearTimeout(this.timeout);
            
            this.timeout = setTimeout(() => {
                func.apply(this, args);
            }, this.delay);
        };
    }
}