declare let jest: any;
declare let jasmine: any;
declare let __DEV__: boolean;
declare let __TEST__: boolean;
declare let __EXTENSION__: boolean;
declare let __PROFILE__: boolean;
declare let __UMD__: boolean;
declare let __EXPERIMENTAL__: boolean;
declare let __VARIANT__: boolean;
declare let __WWW__: boolean;
declare let __VUACT_SKIP_TEST__: boolean;

declare function gate(fn: any): any;
declare function spyOnDev(obj: any, key: string): any;
declare function spyOnDevAndProd(obj: any, key: string): any;
declare function spyOnProd(obj: any, key: string): any;
declare function nextTick(): Promise<void>;
declare function flushAll(): void;

declare function xdescribe(name: string, fn: any): void;
declare function xit(name: string, fn: any): void;
