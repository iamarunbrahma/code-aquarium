export interface Effect {
    start(): void;
    stop(): void;
    tick(): void;
    setEnabled(enabled: boolean): void;
}
