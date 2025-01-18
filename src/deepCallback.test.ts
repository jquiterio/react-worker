import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useDeepCallback } from './deepCallback';
import { DependencyList } from 'react';

describe('useDeepCallback', () => {
    it('should return the same callback if dependencies have not changed', () => {
        const callback = jest.fn();
        const dependencies: DependencyList = [1, 2, 3];

        const { result, rerender } = renderHook(() => useDeepCallback(callback, dependencies));

        const firstCallback = result.current;
        rerender();

        expect(result.current).toBe(firstCallback);
    });

    it('should return a new callback if dependencies have changed', () => {
        const callback = jest.fn();
        const dependencies: DependencyList = [1, 2, 3];

        const { result, rerender } = renderHook(({ deps }) => useDeepCallback(callback, deps), {
            initialProps: { deps: dependencies }
        });

        const firstCallback = result.current;
        rerender({ deps: [4, 5, 6] });

        expect(result.current).not.toBe(firstCallback);
    });

    it('should call the callback with the correct arguments', () => {
        const callback = jest.fn((a, b) => a + b);
        const dependencies: DependencyList = [1, 2];

        const { result } = renderHook(() => useDeepCallback(callback, dependencies));

        result.current(3, 4);
        expect(callback).toHaveBeenCalledWith(3, 4);
    });
});