import { createClient } from './core/adb/client';
import { Device } from './core/adb/device';

const wm = new WeakMap();

export async function test() {
    const test_obj = new TestScript();
    test_obj.test();
    console.log(Reflect.getMetadata('use', test_obj));
    const test_obj2 = new TestScript();
    console.log(Reflect.getMetadata('use', test_obj2));
}

// decorator with parameters for classes
function Script(...args: string[]) {
    return function (constructor: Function) {
        // console.log('use2', args, constructor);
    }
}

let to = {};

// decorator with parameters for methods
function use(...args: string[]): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // if (!wm.has(target)) {
        //     wm.set(target, Date.now());
        //     console.log(target.constructor)
        //     console.log(propertyKey, 'save', wm.get(target));
        // } else {
        //     console.log(propertyKey, 'has', wm.get(target));
        // }
        if (!Reflect.hasMetadata('use', target)) {
            Reflect.defineMetadata('use', new Set(), target);
        }
        const use_list: Set<string> = Reflect.getMetadata('use', target);
        for (const arg of args) {
            use_list.add(arg);
        }
        const originalMethod = descriptor.value;
        descriptor.value = function (...oargs: any[]) {
            console.log(target.constructor.prototype === this.constructor.prototype);
            if (!wm.has(target)) {
                wm.set(target, {});
            } else {
                console.log(propertyKey, 'has in instance', wm.get(target));
            }
            return originalMethod.apply(this, args);
        }
    }
}


@Script()
class TestScript {

    package_name = 'com.leiting.wf';

    constructor() {
        const result = Reflect.getMetadata('use', this);
        console.log('result', result);
    }

    @use('a', 'b')
    test() {
        console.log('output: test');
    }

    @use('b', 'c', 'd')
    test2() {
        console.log('output: test2');
    }


}

@Script()
class Test2Script {

    package_name = 'com.leiting.wf';

    constructor() {
        const result = Reflect.getMetadata('use', this);
        console.log('result2', result);
    }

    @use('a', 'b')
    test() {
        console.log('output: test');
    }

    @use('c', 'd')
    test2() {
        console.log('output: test2');
    }


}