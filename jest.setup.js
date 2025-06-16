global.cc = {
  _decorator: {
    ccclass: (target) => target,
    property: (target, propertyKey) => target
  },
  Component: class Component {
    constructor() {
      this.node = new cc.Node();
    }
  },
  Node: class Node {
    constructor() {
      this.position = { x: 0, y: 0, z: 0 };
      this.active = true;
      this.scale = 1.0;
      this.angle = 0;
      this.opacity = 255;
      this.width = 100;
      this.height = 100;
      this.zIndex = 0;
      this.children = [];
      this.parent = null;
    }
    
    getComponent(componentType) {
      return null;
    }
    
    addChild(child) {
      this.children.push(child);
      child.parent = this;
    }
    
    removeAllChildren() {
      this.children = [];
    }
    
    on(eventType, handler) {}
    
    convertToWorldSpaceAR(pos) {
      return pos;
    }
    
    convertToNodeSpaceAR(pos) {
      return pos;
    }
    
    get isValid() {
      return true;
    }
  },
  v2: (x, y) => ({ x, y }),
  v3: (x, y, z) => ({ x, y, z }),
  Vec2: class Vec2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  },
  Vec3: class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  },
  instantiate: (prefab) => new cc.Node(),
  find: (path) => new cc.Node(),
  tween: (target) => ({
    to: () => ({ start: () => {}, call: () => ({}) }),
    by: () => ({ start: () => {}, call: () => ({}) }),
    delay: () => ({ start: () => {}, call: () => ({}) }),
    call: () => ({ start: () => {} }),
    start: () => {}
  }),
  Tween: {
    stopAllByTarget: () => {}
  },
  easing: {
    sineIn: 'sineIn',
    sineOut: 'sineOut',
    sineInOut: 'sineInOut',
    backOut: 'backOut'
  },
  EventTarget: function EventTarget() {
    this.listeners = {};
    
    this.on = function(type, callback, target) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push({ callback, target });
    };
    
    this.off = function(type, callback, target) {
      if (this.listeners[type]) {
        this.listeners[type] = this.listeners[type].filter(
          listener => listener.callback !== callback || listener.target !== target
        );
      }
    };
    
    this.emit = function(type, ...args) {
      if (this.listeners[type]) {
        this.listeners[type].forEach(listener => {
          listener.callback.apply(listener.target, args);
        });
      }
    };
  },
  director: {
    getScene: () => ({
      getComponent: () => null
    })
  }
};

if (typeof window === 'undefined') {
  global.window = {};
}