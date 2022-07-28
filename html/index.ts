interface DeviceInfo {
    id: string;
    type: string;
}

async function fetchScreencap() {
    const device = document.querySelector<HTMLSelectElement>('#selected-device')!.value;
    const url = new URL('/screencap', location.origin);
    url.searchParams.append('device', device);
    const res = await fetch(url);
    const blob = await res.blob();
    console.log(blob);
    const canvas = document.querySelector('canvas')!;
    if (canvas) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.addEventListener('load', () => {
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        });
    }
}

interface CropperOptions {
    device_list: HTMLSelectElement;
    canvas: HTMLCanvasElement;
}

class Cropper {
    private device_list: DeviceInfo[] = [];

    private el_device_list: HTMLSelectElement;
    private el_canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private img: HTMLImageElement;

    constructor({ canvas, device_list }: CropperOptions) {
        this.el_device_list = device_list;
        this.el_canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.img = new Image();
    }

    private async fetchDeviceList(): Promise<DeviceInfo[]> {
        const res = await fetch('/devices');
        const list = await res.json();
        if (list instanceof Array) {
            return list;
        } else {
            return [];
        }
    }

    private async setDeviceList(list) {
        const option_list: HTMLOptionElement[] = [];
        for (const device of list) {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.id;
            option_list.push(option);
        }
        this.el_device_list.replaceChildren(...option_list);
    }

    public async refreshDeviceList() {
        const list = await this.fetchDeviceList();
        this.setDeviceList(list);
    }

    public async setImage(src: string) {
        return new Promise<void>((resolve, reject) => {
            this.img.addEventListener('load', () => {
                this.el_canvas.width = this.img.width;
                this.el_canvas.height = this.img.height;
                this.ctx.drawImage(this.img, 0, 0);
                resolve();
            }, { once: true });
            this.img.src = src;
        });
    }

    async fetchScreencap() {
        const device = document.querySelector<HTMLSelectElement>('#selected-device')!.value;
        const url = new URL('/screencap', location.origin);
        url.searchParams.append('device', device);
        const res = await fetch(url);
        const blob = await res.blob();
        console.log(blob);
        const src = URL.createObjectURL(blob);
        await this.setImage(src);
    }
}

const cropper = new Cropper({
    canvas: document.querySelector('#screen') as HTMLCanvasElement,
    device_list: document.querySelector('#selected-device') as HTMLSelectElement
});

(async () => {

    await cropper.refreshDeviceList();

})();