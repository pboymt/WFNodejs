import { imread, Mat, TM_CCOEFF_NORMED } from "@u4/opencv4nodejs";
import { randomInt } from "node:crypto";
import { join } from "node:path";
import { Device } from "../adb";

const TARGET_DIR = join(__dirname, '../../target');

export interface Point {
    x: number;
    y: number;
}

export interface PointWithTreshold extends Point {
    treshold: number;
}

export class Target {

    private image: Mat;

    constructor(
        private readonly device: Device,
        private readonly filename: string
    ) {
        this.image = imread(join(TARGET_DIR, `${filename}.png`));
    }

    get width(): number {
        return this.image.cols;
    }

    get height(): number {
        return this.image.rows;
    }

    async find(): Promise<PointWithTreshold>;
    async find(threshold: number): Promise<Point>;
    async find(threshold?: number): Promise<Point | PointWithTreshold> {
        const screen = await this.device.screenshot();
        const result = screen.matchTemplate(this.image, TM_CCOEFF_NORMED);
        const minMax = result.minMaxLoc();
        const { x, y } = minMax.maxLoc;
        if (typeof threshold === 'undefined') {
            return { x, y, treshold: minMax.maxVal };
        } else {
            if (minMax.maxVal >= threshold) {
                return { x, y };
            } else {
                return { x: -1, y: -1 };
            }
        }
    }

    async exists(threshold: number = 0.95): Promise<boolean> {
        const screen = await this.device.screenshot();
        const result = screen.matchTemplate(this.image, TM_CCOEFF_NORMED);
        const minMax = result.minMaxLoc();
        return minMax.maxVal > threshold;
    }

    async click(): Promise<void> {
        const { x, y } = await this.find();
        await this.device.click(randomInt(x, x + this.width), randomInt(y, y + this.height));
    }

}