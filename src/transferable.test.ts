/// <reference lib="dom" />

import { getWorkerTransferList } from './transferable';

describe('getWorkerTransferList', () => {
    it('should return an empty array when transferable is false', () => {
        const result = getWorkerTransferList(false, new ArrayBuffer(8), new MessagePort());
        expect(result).toEqual([]);
    });

    it('should return an array of transferable objects when transferable is true', () => {
        const arrayBuffer = new ArrayBuffer(8);
        const messagePort = new MessagePort();
        const result = getWorkerTransferList(true, arrayBuffer, messagePort);
        expect(result).toEqual([arrayBuffer, messagePort]);
    });

    it('should filter out non-transferable objects when transferable is true', () => {
        const arrayBuffer = new ArrayBuffer(8);
        const nonTransferable = {};
        const result = getWorkerTransferList(true, arrayBuffer, nonTransferable);
        expect(result).toEqual([arrayBuffer]);
    });

    it('should handle ImageBitmap and OffscreenCanvas if available', () => {
        const arrayBuffer = new ArrayBuffer(8);
        const imageBitmap = {} as ImageBitmap;
        const offscreenCanvas = {} as OffscreenCanvas;
        const result = getWorkerTransferList(true, arrayBuffer, imageBitmap, offscreenCanvas);
        expect(result).toEqual([arrayBuffer, imageBitmap, offscreenCanvas]);
    });
});