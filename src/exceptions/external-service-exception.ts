export default class ExternalServiceException extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "ExternalServiceException";
        (this as any).cause = cause;
    }
}
