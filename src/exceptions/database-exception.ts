export default class DatabaseException extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "DatabaseException";
        (this as any).cause = cause;
    }
}
