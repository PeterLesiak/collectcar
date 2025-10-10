export type Seconds = number & { __brand: 'seconds' };

export type Miliseconds = number & { __brand: 'miliseconds' };

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type ExcludeReadonly<T> = {
  [K in keyof T as IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    K,
    never
  >]: T[K];
};
