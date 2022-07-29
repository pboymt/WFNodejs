var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var ChooseStage;
(function (ChooseStage) {
    ChooseStage[ChooseStage["BLUR"] = 0] = "BLUR";
    ChooseStage[ChooseStage["START"] = 1] = "START";
    ChooseStage[ChooseStage["END"] = 2] = "END";
})(ChooseStage || (ChooseStage = {}));
var Cropper = /** @class */ (function () {
    function Cropper(_a) {
        var canvas = _a.canvas, device_list = _a.device_list, preview = _a.preview, cursor_x = _a.cursor_x, cursor_y = _a.cursor_y;
        this.device_list = [];
        this.ctl_cursor = [0, 0];
        this.ctl_choosing = ChooseStage.BLUR;
        this.ctl_choose_start_point = [0, 0];
        this.ctl_choose_end_point = [0, 0];
        this.el_device_list = device_list;
        this.el_cursor_x = cursor_x;
        this.el_cursor_y = cursor_y;
        this.el_canvas = canvas;
        this.el_ctx = canvas.getContext('2d');
        this.img = new Image();
        this.ctl_canvas = document.createElement('canvas');
        this.ctl_ctx = this.ctl_canvas.getContext('2d');
        this.pv_canvas = preview;
        this.pv_ctx = preview.getContext('2d');
        this.initCanvas();
    }
    /**
     * 初始化Canvas
     */
    Cropper.prototype.initCanvas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Element
                this.el_ctx.globalCompositeOperation = 'destination-out';
                this.el_canvas.width = 100;
                this.el_canvas.height = 100;
                // Control
                this.ctl_canvas.width = 100;
                this.ctl_canvas.height = 100;
                // Element Event
                this.el_canvas.addEventListener('mousemove', function (e) {
                    var rect = _this.el_canvas.getBoundingClientRect();
                    var _a = [e.offsetX < 0 ? 0 : e.offsetX, e.offsetY < 0 ? 0 : e.offsetY], ox = _a[0], oy = _a[1];
                    var x = Math.round(ox / rect.width * _this.el_canvas.width);
                    var y = Math.round(oy / rect.height * _this.el_canvas.height);
                    _this.ctl_cursor = [x, y];
                    _this.el_cursor_x.textContent = "".concat(x);
                    _this.el_cursor_y.textContent = "".concat(y);
                });
                this.el_canvas.addEventListener('click', function (e) {
                    switch (_this.ctl_choosing) {
                        case ChooseStage.BLUR:
                            _this.ctl_choose_start_point = _this.ctl_cursor;
                            _this.ctl_choosing = ChooseStage.START;
                            break;
                        case ChooseStage.START:
                            _this.ctl_choose_end_point = _this.ctl_cursor;
                            _this.ctl_choosing = ChooseStage.END;
                            break;
                        case ChooseStage.END:
                            _this.ctl_choose_start_point = _this.ctl_cursor;
                            _this.ctl_choosing = ChooseStage.START;
                            break;
                    }
                });
                this.el_canvas.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    _this.ctl_choosing = ChooseStage.BLUR;
                });
                this.drawCanvas();
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取设备列表
     */
    Cropper.prototype.fetchDeviceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/devices')];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        list = _a.sent();
                        if (list instanceof Array) {
                            this.device_list = list;
                        }
                        else {
                            this.device_list = [];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置设备列表
     */
    Cropper.prototype.setDeviceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var option_list, _i, _a, device, option;
            var _b;
            return __generator(this, function (_c) {
                option_list = [];
                for (_i = 0, _a = this.device_list; _i < _a.length; _i++) {
                    device = _a[_i];
                    option = document.createElement('option');
                    option.value = device.id;
                    option.textContent = device.id;
                    option_list.push(option);
                }
                (_b = this.el_device_list).replaceChildren.apply(_b, option_list);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 刷新设备列表
     */
    Cropper.prototype.refreshDeviceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchDeviceList()];
                    case 1:
                        list = _a.sent();
                        this.setDeviceList();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置图像
     * @param src 图片地址
     */
    Cropper.prototype.setImage = function (src) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.img.addEventListener('load', function () {
                            _this.el_canvas.width = _this.img.width;
                            _this.el_canvas.height = _this.img.height;
                            _this.ctl_canvas.width = _this.img.width;
                            _this.ctl_canvas.height = _this.img.height;
                            _this.ctl_choosing = ChooseStage.BLUR;
                            resolve();
                        }, { once: true });
                        _this.img.src = src;
                    })];
            });
        });
    };
    Cropper.prototype.drawCanvas = function () {
        var _this = this;
        console.log('drawCanvas');
        // 清空画布
        this.ctl_ctx.clearRect(0, 0, this.ctl_canvas.width, this.ctl_canvas.height);
        this.el_ctx.clearRect(0, 0, this.el_canvas.width, this.el_canvas.height);
        // 描绘实时光标
        var _a = this.ctl_cursor, x = _a[0], y = _a[1];
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
                var _b = this.ctl_choose_start_point, sx = _b[0], sy = _b[1];
                this.ctl_ctx.strokeStyle = '#ff0000';
                this.ctl_ctx.lineWidth = 2;
                this.ctl_ctx.beginPath();
                this.ctl_ctx.moveTo(sx, sy);
                this.ctl_ctx.rect(sx, sy, x - sx, y - sy);
                this.ctl_ctx.stroke();
                break;
            }
            case ChooseStage.END: {
                var _c = this.ctl_choose_start_point, sx = _c[0], sy = _c[1];
                var _d = this.ctl_choose_end_point, ex = _d[0], ey = _d[1];
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
        requestAnimationFrame(function () { return _this.drawCanvas(); });
    };
    Cropper.prototype.fetchScreencap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var device, url, res, blob, src;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        device = document.querySelector('#selected-device').value;
                        url = new URL('/screencap', location.origin);
                        url.searchParams.append('device', device);
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.blob()];
                    case 2:
                        blob = _a.sent();
                        console.log(blob);
                        src = URL.createObjectURL(blob);
                        return [4 /*yield*/, this.setImage(src)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Cropper;
}());
var cropper = new Cropper({
    canvas: document.querySelector('#screen'),
    device_list: document.querySelector('#selected-device'),
    preview: document.querySelector('#preview'),
    cursor_x: document.querySelector('#cursor-x'),
    cursor_y: document.querySelector('#cursor-y')
});
(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cropper.refreshDeviceList()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
