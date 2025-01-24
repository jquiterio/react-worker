import { describe, it, beforeAll, afterAll, expect, vi } from 'bun:test';
import { renderHook, act } from '@testing-library/react-hooks';
import useWorker, { ThisWorker } from './useWorker';
import WORKER_STATUS from './status';
import { DEFAULT_OPTIONS } from './options';

const mockWorker = () => {
    const worker: Partial<ThisWorker> = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
    };
    return worker as ThisWorker;
};

describe('useWorker', () => {
    let originalWorker: any;

    beforeAll(() => {
        originalWorker = global.Worker;
        global.Worker = vi.fn(() => mockWorker());
    });

    afterAll(() => {
        global.Worker = originalWorker;
    });

    it('should initialize with PENDING status', () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [, { status }] = result.current;
        expect(status).toBe(WORKER_STATUS.PENDING);
    });

    it('should set status to RUNNING when worker is called', async () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [outFn, { status }] = result.current;

        await act(async () => {
            outFn();
        });

        expect(status).toBe(WORKER_STATUS.RUNNING);
    });

    it('should set status to SUCCESS on worker success', async () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [outFn, { status }] = result.current;

        await act(async () => {
            outFn();
        });

        const workerInstance = (global.Worker as vi.Mock).mock.instances[0];
        workerInstance.onmessage({ data: [WORKER_STATUS.SUCCESS, 'result'] });

        expect(status).toBe(WORKER_STATUS.SUCCESS);
    });

    it('should set status to ERROR on worker error', async () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [outFn, { status }] = result.current;

        await act(async () => {
            outFn();
        });

        const workerInstance = (global.Worker as vi.Mock).mock.instances[0];
        workerInstance.onerror(new ErrorEvent('error'));

        expect(status).toBe(WORKER_STATUS.ERROR);
    });

    it('should terminate worker on timeout', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useWorker(() => { }, { timeout: 1000 }));
        const [outFn, { status }] = result.current;

        await act(async () => {
            outFn();
        });

        vi.advanceTimersByTime(1000);

        expect(status).toBe(WORKER_STATUS.TIMEDOUT);
        vi.useRealTimers();
    });

    it('should terminate worker on unmount', () => {
        const { result, unmount } = renderHook(() => useWorker(() => { }));
        const [, { terminate }] = result.current;

        unmount();

        expect(terminate).toHaveBeenCalled();
    });

    it('should handle multiple calls correctly', async () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [outFn] = result.current;

        await act(async () => {
            outFn();
        });

        const workerInstance = (global.Worker as vi.Mock).mock.instances[0];
        workerInstance.onmessage({ data: [WORKER_STATUS.SUCCESS, 'result'] });

        await act(async () => {
            outFn();
        });

        expect(workerInstance.postMessage).toHaveBeenCalledTimes(2);
    });

    it('should not allow multiple instances running simultaneously', async () => {
        const { result } = renderHook(() => useWorker(() => { }));
        const [outFn] = result.current;

        await act(async () => {
            outFn();
        });

        await act(async () => {
            const promise = outFn();
            expect(promise).rejects.toBeUndefined();
        });
    });

    it('should handle autoTerminate option correctly', async () => {
        const { result } = renderHook(() => useWorker(() => { }, { autoTerminate: true }));
        const [outFn] = result.current;

        await act(async () => {
            outFn();
        });

        const workerInstance = (global.Worker as vi.Mock).mock.instances[0];
        workerInstance.onmessage({ data: [WORKER_STATUS.SUCCESS, 'result'] });

        expect(workerInstance.terminate).toHaveBeenCalled();
    });
});