
export const getTransferList = (transferable: Transferable): Transferable[] => {
    return ('ArrayBuffer' in self && transferable instanceof ArrayBuffer) ||
        ('MessagePort' in self && transferable instanceof MessagePort) ||
        ('ImageBitmap' in self && transferable instanceof ImageBitmap) ||
        ('OffscreenCanvas' in self && transferable instanceof OffscreenCanvas)
        ? [transferable]
        : []
}

export const getWorkerTransferList = <T extends (...args: any[]) => any>(transferable: boolean, ...args: Parameters<T>): Transferable[] => transferable
    ? args.filter(
        (val: Transferable) =>
            ('ArrayBuffer' in window && val instanceof ArrayBuffer) ||
            ('MessagePort' in window && val instanceof MessagePort) ||
            ('ImageBitmap' in window && val instanceof ImageBitmap) ||
            ('OffscreenCanvas' in window &&
                val instanceof OffscreenCanvas),
    )
    : []

