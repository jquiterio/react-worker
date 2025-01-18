
import { useState, useRef, useCallback, useEffect } from 'react';
import WORKER_STATUS from './status';
import { DEFAULT_OPTIONS, Options } from './options';
import { useDeepCallback } from './deepCallback';
import { genUrls } from './utils';
import { getWorkerTransferList } from './transferable';

export type ThisWorker = Worker & { _url?: string }

export interface iUseWorker {
    fn: Function
    ctrl?: {
        status: WORKER_STATUS
        terminate: () => void
    }
}

const useWorker = <T extends (...args: any[]) => any>(inFn: T, opts: Options = DEFAULT_OPTIONS) => {

    const [status, setStatus] = useState<WORKER_STATUS>(WORKER_STATUS.PENDING);

    const worker = useRef<ThisWorker>();
    const isRunning = useRef(false);
    const promise = useRef<{
        reject?: (res: ReturnType<T> | ErrorEvent) => void,
        resolve?: (res: ReturnType<T>) => void
    }>({});
    const timeoutId = useRef<number>();

    const terminate = useCallback(() => {
        if (worker.current?._url) {
            worker.current.terminate()
            URL.revokeObjectURL(worker.current._url)
            promise.current = {}
            worker.current = undefined
            window.clearTimeout(timeoutId.current)
        }
        setStatus(WORKER_STATUS.KILLED)
    }, [worker, promise, timeoutId])

    const onWorkerEnd = useCallback(
        (status: WORKER_STATUS) => {
            const killed =
                opts.autoTerminate != null
                    ? opts.autoTerminate
                    : DEFAULT_OPTIONS.autoTerminate

            if (killed) {
                terminate()
            }
            setStatus(status)
        },
        [opts.autoTerminate ?? DEFAULT_OPTIONS.autoTerminate, terminate, setStatus],
    )

    const genWorker = useDeepCallback(() => {
        const {
            remoteDependencies = DEFAULT_OPTIONS.remoteDependencies,
            timeout = DEFAULT_OPTIONS.timeout,
            transferable = DEFAULT_OPTIONS.transferable,
        } = opts

        const blobUrl = genUrls(inFn, remoteDependencies!, transferable!)
        const newWorker: ThisWorker = new Worker(blobUrl)
        newWorker._url = blobUrl

        newWorker.onmessage = (e: MessageEvent) => {
            const [status, result] = e.data as [WORKER_STATUS, ReturnType<T>]

            switch (status) {
                case WORKER_STATUS.SUCCESS:
                    promise.current['resolve']?.(result)
                    onWorkerEnd(WORKER_STATUS.SUCCESS)
                    break
                default:
                    promise.current['reject']?.(result)
                    onWorkerEnd(WORKER_STATUS.ERROR)
                    break
            }
        }

        newWorker.onerror = (e: ErrorEvent) => {
            promise.current['reject']?.(e)
            onWorkerEnd(WORKER_STATUS.ERROR)
        }

        if (timeout) {
            timeoutId.current = window.setTimeout(() => {
                terminate()
                setStatus(WORKER_STATUS.TIMEDOUT)
            }, timeout)
        }
        return newWorker
    }, [inFn, opts, terminate])

    const callWorker = useCallback(
        (...args: Parameters<T>) => {
            const { transferable = DEFAULT_OPTIONS.transferable } = opts
            return new Promise<ReturnType<T>>((resolve, reject) => {
                promise.current = {
                    resolve,
                    reject,
                }

                const transferList = getWorkerTransferList(transferable, ...args)

                worker.current?.postMessage([...args], transferList)

                setStatus(WORKER_STATUS.RUNNING)
            })
        },
        [opts, setStatus],
    )

    const outFn = useCallback(
        (...args: Parameters<T>) => {
            const shouldTerminate =
                opts.autoTerminate != null
                    ? opts.autoTerminate
                    : DEFAULT_OPTIONS.autoTerminate

            if (isRunning.current) {
                console.error(
                    '[react-useworker] You can only run one instance of the worker at a time, if you want to run more than one in parallel, create another instance with the hook useWorker()',
                )
                return Promise.reject()
            }
            if (shouldTerminate || !worker.current) {
                worker.current = genWorker()
            }

            return callWorker(...args)
        },
        [callWorker, genWorker, opts.autoTerminate],
    )

    useEffect(() => {
        isRunning.current = status === WORKER_STATUS.RUNNING
    }, [status]);

    useEffect(
        () => () => {
            terminate()
        },
        [],
    )

    return [outFn, { status, terminate }] as const
};

export default useWorker;