import { isEqual } from 'lodash-es'
import { useRef, useCallback, DependencyList } from 'react'


export const useDeepCallback = <T extends (...args: any[]) => any>(
    callback: T,
    dependencies: DependencyList,
) => {
    const prevDependencies = useRef<DependencyList>(dependencies)
    const dependenciesChanged = !isEqual(prevDependencies.current, dependencies);
    if (dependenciesChanged) {
        prevDependencies.current = dependencies;
    }

    return useCallback(callback, prevDependencies.current)
}