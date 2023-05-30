/**
 * Server interface
 */
export interface Server {
    /**
     * Runs server
     */
    run(): Promise<void>;
}
