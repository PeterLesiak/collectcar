import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
): [T | undefined, SetStateAction<Dispatch<T | undefined>>];

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, SetStateAction<Dispatch<T>>];

export function useLocalStorage<T>(
  key: string,
  defaultValue?: T,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [state, setState] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const value = localStorage.getItem(key);

    setState(value ? JSON.parse(value) : undefined);
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state) ?? '');
  }, [key, state]);

  return [state, setState];
}
