import { createClient } from './core/adb/client';
import { Device } from './core/adb/device';

export async function test() {
    const test_obj = new TestScript();
    test_obj.test();
}

// decorator with parameters for classes
function Script(...args: string[]) {
    return function (constructor: Function) {
        // console.log('use2', args, constructor);
    }
}

let to = {};

// decorator with parameters for methods
function use(...args: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(propertyKey, target === to);
        to = target;
        const originalMethod = descriptor.value;
        descriptor.value = function (...oargs: any[]) {
            console.log(this);
            console.log(this instanceof TestScript);
            return originalMethod.apply(this, args);
        }
    }
}


@Script()
class TestScript {

    package_name = 'com.leiting.wf';

    @use('a', 'b')
    test() {
        console.log('test');
    }

    @use('c', 'd')
    test2() {
        console.log('test2');
    }


}

@Script()
class Test2Script {

    package_name = 'com.leiting.wf';

    @use('a', 'b')
    test() {
        console.log('test');
    }

    @use('c', 'd')
    test2() {
        console.log('test2');
    }


}