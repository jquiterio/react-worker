export interface Options {
    timeout: number;
    remoteDependencies: string[];
    autoTerminate: boolean;
    transferable: boolean;
}

export const DEFAULT_OPTIONS: Options = {
    timeout: 0,
    remoteDependencies: [],
    autoTerminate: true,
    transferable: true
};