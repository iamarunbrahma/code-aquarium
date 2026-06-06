/**
 * Coordinates the tank's storm effect across independent triggers — error
 * diagnostics and failed tasks. The storm shows while ANY source still wants
 * it, so one source clearing (e.g. a failed task's auto-clear) won't switch
 * off a storm another source (e.g. unresolved errors) still needs.
 */
export class StormController {
    private readonly active = new Set<string>();

    constructor(private readonly setStorm: (on: boolean) => void) {}

    public set(source: string, on: boolean): void {
        const wasOn = this.active.size > 0;
        if (on) {
            this.active.add(source);
        } else {
            this.active.delete(source);
        }
        const isOn = this.active.size > 0;
        if (wasOn !== isOn) {
            this.setStorm(isOn);
        }
    }
}
