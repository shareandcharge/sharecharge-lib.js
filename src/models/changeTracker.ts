export class ChangeTracker {

    private changes = {};

    constructor(private source: any) {
    }

    setProperty(name: string, value: any) {
        const fieldName = '_' + name;
        if (value != this.source[fieldName]) {
            this.changes[name] = true;
            this.source[fieldName] = value;
        }
    }

    didPropertyChange(propertyName: string): boolean {
        return this.changes[propertyName];
    }

    getProperties() {
        return Object.getOwnPropertyNames(this.source).filter(n => n.startsWith('_')).map(n => n.substr(1));
    }

    resetProperties() {
        this.getProperties().forEach(name => this.changes[name] = false);
    }

}