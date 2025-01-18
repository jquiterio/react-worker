import WORKER_STATUS from "./status"

const isTransferable = (val: any) =>
    ('ArrayBuffer' in self && val instanceof ArrayBuffer) ||
    ('MessagePort' in self && val instanceof MessagePort) ||
    ('ImageBitmap' in self && val instanceof ImageBitmap) ||
    ('OffscreenCanvas' in self && val instanceof OffscreenCanvas)

const job =
    (opts: { fn: Function, transferable: boolean }): Function =>
        async (e: MessageEvent) => {
            const [userFuncArgs] = e.data as [any[]]
            try {
                const result = await opts.fn(...userFuncArgs)
                const transferList: any[] =
                    opts.transferable && isTransferable(result)
                        ? [result]
                        : []
                postMessage([WORKER_STATUS.SUCCESS, result], "*", transferList)
            } catch (error) {
                postMessage([WORKER_STATUS.ERROR, error])
            }
        }

export default job