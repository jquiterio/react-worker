import { describe, it, expect, vi } from 'bun:test'
import { renderHook } from '@testing-library/react-hooks'
import { useDeepCallback } from './deepCallback'

describe('useDeepCallback', () => {
    it('should keep the same callback when dependencies do not change', () => {
        const callback = vi.fn()
        const { result, rerender } = renderHook(
            ({ cb, deps }) => useDeepCallback(cb, deps),
            { initialProps: { cb: callback, deps: [1, 2] } }
        )
        const firstCallback = result.current
        rerender({ cb: callback, deps: [1, 2] })
        const secondCallback = result.current

        expect(firstCallback).toBe(secondCallback)
    })

    it('should provide a new callback when dependencies change', () => {
        const callback = vi.fn()
        const { result, rerender } = renderHook(
            ({ cb, deps }) => useDeepCallback(cb, deps),
            { initialProps: { cb: callback, deps: [1, 2] } }
        )
        const firstCallback = result.current
        rerender({ cb: callback, deps: [1, 3] })
        const secondCallback = result.current

        expect(firstCallback).not.toBe(secondCallback)
    })

    it('should call the callback function correctly', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useDeepCallback(callback, []))
        result.current('test-arg')
        expect(callback).toHaveBeenCalledWith('test-arg')
    })
})