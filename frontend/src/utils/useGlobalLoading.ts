import { useEffect, useState } from 'react';
import { isLoading, subscribeLoading } from './apiClient';

// Reflects whether any API request is currently in flight.
export function useGlobalLoading(): boolean {
    const [loading, setLoading] = useState(isLoading());

    useEffect(() => subscribeLoading(setLoading), []);

    return loading;
}
