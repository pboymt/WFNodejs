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
function fetchScreencap() {
    return __awaiter(this, void 0, void 0, function () {
        var device, url, res, blob, canvas, img_1;
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
                    canvas = document.querySelector('canvas');
                    if (canvas) {
                        img_1 = new Image();
                        img_1.src = URL.createObjectURL(blob);
                        img_1.addEventListener('load', function () {
                            var ctx = canvas.getContext('2d');
                            canvas.width = img_1.width;
                            canvas.height = img_1.height;
                            ctx.drawImage(img_1, 0, 0);
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var Cropper = /** @class */ (function () {
    function Cropper(_a) {
        var canvas = _a.canvas, device_list = _a.device_list;
        this.device_list = [];
        this.el_device_list = device_list;
        this.el_canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.img = new Image();
    }
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
                            return [2 /*return*/, list];
                        }
                        else {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Cropper.prototype.setDeviceList = function (list) {
        return __awaiter(this, void 0, void 0, function () {
            var option_list, _i, list_1, device, option;
            var _a;
            return __generator(this, function (_b) {
                option_list = [];
                for (_i = 0, list_1 = list; _i < list_1.length; _i++) {
                    device = list_1[_i];
                    option = document.createElement('option');
                    option.value = device.id;
                    option.textContent = device.id;
                    option_list.push(option);
                }
                (_a = this.el_device_list).replaceChildren.apply(_a, option_list);
                return [2 /*return*/];
            });
        });
    };
    Cropper.prototype.refreshDeviceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchDeviceList()];
                    case 1:
                        list = _a.sent();
                        this.setDeviceList(list);
                        return [2 /*return*/];
                }
            });
        });
    };
    Cropper.prototype.setImage = function (src) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.img.addEventListener('load', function () {
                            _this.el_canvas.width = _this.img.width;
                            _this.el_canvas.height = _this.img.height;
                            _this.ctx.drawImage(_this.img, 0, 0);
                            resolve();
                        }, { once: true });
                        _this.img.src = src;
                    })];
            });
        });
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
    device_list: document.querySelector('#selected-device')
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
