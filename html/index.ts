interface DeviceInfo {
    id: string;
    type: string;
}

interface CropperOptions {
    device_list: HTMLSelectElement;
    canvas: HTMLCanvasElement;
    preview: HTMLCanvasElement;
    cursor_x: HTMLTableCellElement;
    cursor_y: HTMLTableCellElement;
}

enum ChooseStage {
    BLUR,
    START,
    END,
}

class Cropper {
    private device_list: DeviceInfo[] = [];

    // Elements
    private el_device_list: HTMLSelectElement;
    private el_cursor_x: HTMLTableCellElement;
    private el_cursor_y: HTMLTableCellElement;
    // 显示的外部Canvas
    private el_canvas: HTMLCanvasElement;
    private el_ctx: CanvasRenderingContext2D;
    // 底部图层
    private img: HTMLImageElement;
    // 操作图层
    private ctl_canvas: HTMLCanvasElement;
    private ctl_ctx: CanvasRenderingContext2D;
    private ctl_cursor: [number, number] = [0, 0];
    private ctl_choosing: ChooseStage = ChooseStage.BLUR;
    private ctl_choose_start_point: [number, number] = [0, 0];
    private ctl_choose_end_point: [number, number] = [0, 0];
    // 指针Canvas
    private pv_canvas: HTMLCanvasElement;
    private pv_ctx: CanvasRenderingContext2D;


    constructor({ canvas, device_list, preview, cursor_x, cursor_y }: CropperOptions) {
        this.el_device_list = device_list;
        this.el_cursor_x = cursor_x;
        this.el_cursor_y = cursor_y;
        this.el_canvas = canvas;
        this.el_ctx = canvas.getContext('2d')!;
        this.img = new Image();
        this.ctl_canvas = document.createElement('canvas');
        this.ctl_ctx = this.ctl_canvas.getContext('2d')!;
        this.pv_canvas = preview;
        this.pv_ctx = preview.getContext('2d')!;
        this.initCanvas();
    }

    /**
     * 初始化Canvas
     */
    public async initCanvas() {
        // Element
        this.el_ctx.globalCompositeOperation = 'destination-out';
        this.el_canvas.width = 100;
        this.el_canvas.height = 100;
        // Control
        this.ctl_canvas.width = 100;
        this.ctl_canvas.height = 100;
        // Element Event
        this.el_canvas.addEventListener('mousemove', (e) => {
            const rect = this.el_canvas.getBoundingClientRect();
            const [ox, oy] = [e.offsetX < 0 ? 0 : e.offsetX, e.offsetY < 0 ? 0 : e.offsetY];
            const x = Math.round(ox / rect.width * this.el_canvas.width);
            const y = Math.round(oy / rect.height * this.el_canvas.height);
            this.ctl_cursor = [x, y];
            this.el_cursor_x.textContent = `${x}`;
            this.el_cursor_y.textContent = `${y}`;
        });
        this.el_canvas.addEventListener('click', (e) => {
            switch (this.ctl_choosing) {
                case ChooseStage.BLUR:
                    this.ctl_choose_start_point = this.ctl_cursor;
                    this.ctl_choosing = ChooseStage.START;
                    break;
                case ChooseStage.START:
                    this.ctl_choose_end_point = this.ctl_cursor;
                    this.ctl_choosing = ChooseStage.END;
                    break;
                case ChooseStage.END:
                    this.ctl_choose_start_point = this.ctl_cursor;
                    this.ctl_choosing = ChooseStage.START;
                    break;
            }
        });
        this.el_canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.ctl_choosing = ChooseStage.BLUR;
        });
        this.drawCanvas();
    }

    /**
     * 获取设备列表
     */
    private async fetchDeviceList() {
        const res = await fetch('/devices');
        const list = await res.json();
        if (list instanceof Array) {
            this.device_list = list;
        } else {
            this.device_list = [];
        }
    }
    /**
     * 设置设备列表
     */
    private async setDeviceList() {
        const option_list: HTMLOptionElement[] = [];
        for (const device of this.device_list) {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.id;
            option_list.push(option);
        }
        this.el_device_list.replaceChildren(...option_list);
    }

    /**
     * 刷新设备列表
     */
    public async refreshDeviceList() {
        const list = await this.fetchDeviceList();
        this.setDeviceList();
    }

    /**
     * 设置图像
     * @param src 图片地址
     */
    public async setImage(src: string) {
        return new Promise<void>((resolve, reject) => {
            this.img.addEventListener('load', () => {
                this.el_canvas.width = this.img.width;
                this.el_canvas.height = this.img.height;
                this.ctl_canvas.width = this.img.width;
                this.ctl_canvas.height = this.img.height;
                this.ctl_choosing = ChooseStage.BLUR;
                resolve();
            }, { once: true });
            this.img.src = src;
        });
    }

    private drawCanvas() {
        console.log('drawCanvas');
        // 清空画布
        this.ctl_ctx.clearRect(0, 0, this.ctl_canvas.width, this.ctl_canvas.height);
        this.el_ctx.clearRect(0, 0, this.el_canvas.width, this.el_canvas.height);
        // 描绘实时光标
        const [x, y] = this.ctl_cursor;
        this.ctl_ctx.lineWidth = 2;
        this.ctl_ctx.beginPath();
        this.ctl_ctx.strokeStyle = '#888888';
        this.ctl_ctx.moveTo(x - 20, y - 20);
        this.ctl_ctx.lineTo(x + 20, y - 20);
        this.ctl_ctx.lineTo(x + 20, y + 20);
        this.ctl_ctx.lineTo(x - 20, y + 20);
        this.ctl_ctx.closePath();
        this.ctl_ctx.stroke();
        this.ctl_ctx.beginPath();
        this.ctl_ctx.strokeStyle = '#000000';
        this.ctl_ctx.moveTo(x, 0);
        this.ctl_ctx.lineTo(x, this.ctl_canvas.height);
        this.ctl_ctx.moveTo(0, y);
        this.ctl_ctx.lineTo(this.ctl_canvas.width, y);
        this.ctl_ctx.stroke();
        this.ctl_ctx.beginPath();
        this.ctl_ctx.strokeStyle = '#ffffff';
        this.ctl_ctx.moveTo(x - 2, 0);
        this.ctl_ctx.lineTo(x - 2, this.ctl_canvas.height);
        this.ctl_ctx.moveTo(0, y - 2);
        this.ctl_ctx.lineTo(this.ctl_canvas.width, y - 2);
        this.ctl_ctx.stroke();
        this.ctl_ctx.moveTo(x + 2, 0);
        this.ctl_ctx.lineTo(x + 2, this.ctl_canvas.height);
        this.ctl_ctx.moveTo(0, y + 2);
        this.ctl_ctx.lineTo(this.ctl_canvas.width, y + 2);
        this.ctl_ctx.stroke();

        // 描绘选择框
        switch (this.ctl_choosing) {
            case ChooseStage.BLUR:
                break;
            case ChooseStage.START: {
                const [sx, sy] = this.ctl_choose_start_point;
                this.ctl_ctx.strokeStyle = '#ff0000';
                this.ctl_ctx.lineWidth = 2;
                this.ctl_ctx.beginPath();
                this.ctl_ctx.moveTo(sx, sy);
                this.ctl_ctx.rect(sx, sy, x - sx, y - sy);
                this.ctl_ctx.stroke();
                break;
            }
            case ChooseStage.END: {
                const [sx, sy] = this.ctl_choose_start_point;
                const [ex, ey] = this.ctl_choose_end_point;
                this.ctl_ctx.strokeStyle = '#ff0000';
                this.ctl_ctx.lineWidth = 2;
                this.ctl_ctx.beginPath();
                this.ctl_ctx.moveTo(sx, sy);
                this.ctl_ctx.rect(sx, sy, ex - sx, ey - sy);
                this.ctl_ctx.stroke();
                break;
            }
        }
        // 填充画布
        this.el_ctx.drawImage(this.img, 0, 0);
        this.el_ctx.drawImage(this.ctl_canvas, 0, 0);

        this.pv_ctx.clearRect(0, 0, this.pv_canvas.width, this.pv_canvas.height);
        // 光标预览
        this.pv_ctx.drawImage(this.img, x - 10, y - 10, 20, 20, 0, 0, 100, 100);
        requestAnimationFrame(() => this.drawCanvas());
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
    device_list: document.querySelector('#selected-device') as HTMLSelectElement,
    preview: document.querySelector('#preview') as HTMLCanvasElement,
    cursor_x: document.querySelector('#cursor-x') as HTMLTableCellElement,
    cursor_y: document.querySelector('#cursor-y') as HTMLTableCellElement,
});

(async () => {

    await cropper.refreshDeviceList();

})();