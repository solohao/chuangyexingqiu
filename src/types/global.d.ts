// 全局类型声明文件

// 高德地图 AMap 类型声明
declare global {
  interface Window {
    AMap: {
      Map: new (container: string | HTMLElement, options?: any) => any;
      Marker: new (options?: any) => any;
      LngLat: new (lng: number, lat: number) => any;
      Size: new (width: number, height: number) => any;
      Icon: new (options?: any) => any;
      InfoWindow: new (options?: any) => any;
      plugin: (plugins: string[], callback: () => void) => void;
      event: {
        addListener: (instance: any, eventName: string, handler: Function) => any;
        removeListener: (listener: any) => void;
      };
      GeolocationResult: any;
      Geolocation: new () => any;
      ToolBar: new (options?: any) => any;
      Scale: new (options?: any) => any;
    };
  }
}

// 导出空对象以使此文件成为模块
export {};