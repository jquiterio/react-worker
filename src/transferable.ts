
export const getWorkerTransferList = <T extends (...args: any[]) => any>(transferable: boolean, ...args: Parameters<T>): Transferable[] => transferable
    ? args.filter(
        (val: Transferable) =>
            ('ArrayBuffer' in self && val instanceof ArrayBuffer) ||
            ('MessagePort' in self && val instanceof MessagePort) ||
            ('ImageBitmap' in self && val instanceof ImageBitmap) ||
            ('OffscreenCanvas' in self),
    )
    : []

