# WFNodejs 运行于 Node.js 的游戏自动化脚本

## 介绍

WFNodejs 是一个运行于 Node.js 的游戏自动化脚本，目前可用于 **世界弹射物语**（国服） 。

### 开发目的

目前的 Python 版本的脚本已经能够满足部分玩家的需求，但是比较常用的 repo 对分辨率的支持不够友好（支持多开模拟器挂机，但是不支持直接在物理机上进行代理），并且开源等于没有开源，扩展性不足，因此我决定开发一个 Node.js 版本的脚本，以便于更多的玩家扩展使用。

## 目录

- [WFNodejs 运行于 Node.js 的游戏自动化脚本](#wfnodejs-运行于-nodejs-的游戏自动化脚本)
  - [介绍](#介绍)
    - [开发目的](#开发目的)
  - [目录](#目录)
  - [说明](#说明)
    - [运行环境说明](#运行环境说明)
      - [操作系统](#操作系统)
      - [Node.js](#nodejs)
    - [分辨率支持](#分辨率支持)
  - [安装](#安装)
    - [下载项目源码](#下载项目源码)
    - [安装前准备](#安装前准备)
    - [安装依赖](#安装依赖)
      - [外部依赖](#外部依赖)
      - [项目依赖](#项目依赖)
  - [使用](#使用)
  - [例子](#例子)

## 说明

### 运行环境说明

本脚本**目前**只能运行于 Windows 系统，且**需要安装 Node.js 环境**。其他系统的环境并未进行测试，但理论上也可以运行。

#### 操作系统

目前测试过的操作系统有：

- Windows 11 22H1
- Windows 11 21H2

#### Node.js

本脚本需要 Node.js 环境，目前测试过的 Node.js 版本有：

- Node.js 18.7.0

据各个依赖包分析，Node.js 14.0.0 及以上的 LTS 版本应该都可以运行。

### 分辨率支持

本脚本目前只支持 1080×1920+ 的分辨率，可以直接在各种 Android 手机上使用，其他分辨率的支持正在开发中（会很慢），预计使用缩放模板的方式进行支持。

## 安装

### 下载项目源码

- 使用 git 命令下载源代码

```pwsh
PS 父目录> git clone https://github.com/pboymt/WFNodejs.git
```

- 切换到项目目录

```pwsh
PS 父目录> cd WFNodejs
# 后续指令均在此目录下执行
PS WFNodejs>
```

### 安装前准备

本项目需要你单独安装的外部依赖有（**加粗为必须自行配置**）：

- **ADB**（[Google](https://developer.android.com/studio/releases/platform-tools)，[国内官方镜像](https://developer.android.google.cn/studio/releases/platform-tools)）
  - ADB 用于连接模拟器和手机，是获取屏幕截图和对手机进行手势操作的必要依赖。
  - 如果你安装过 Android Studio，那么你可以在 Android Studio 的安装目录下找到 ADB，请确保能够在命令行中使用 `adb` 命令。
  - 如果你没有安装过 Android Studio，那么你可以在链接中下载 Platform Tools 压缩包并解压。
  - 配置环境变量：将 ADB 的安装目录（包含 `adb.exe` 的文件夹）添加到环境变量 `PATH` 中。
- [OpenCV](https://opencv.org/releases/) 
  - 本项目开发时同时使用了 4.5.5 和 4.6.0 版本，均能够运行正常。
  - 可以不用自行配置，使用 `npm install` 安装依赖时会自动下载（网络不好请在命令行中设置代理环境）。
  - 如果你选择自动下载 OpenCV ，默认下载的版本为 4.6.0 版本，会下载到项目根目录下的 `opencv` 目录中，解压目录为 `opencv/opencv` 。
  - 如果你选择手动下载 OpenCV ，可以将 OpenCV 解压到项目根目录下的 `opencv` 目录中。
  - 如果你将 OpenCV 安装到了其他目录，那么你需要在环境变量中添加 OPENCV_INCLUDE_DIR 、 OPENCV_LIB_DIR 和 OPENCV_BIN_DIR 三个环境变量，分别指向 OpenCV安装目录下的 `build/include` 、 `build/x64/vc15/lib` 和 `build/x64/vc15/bin` 目录，并且设置为绝对路径（如：`C:\opencv\build\include` 、 `C:\opencv\build\x64\vc15\lib` 和 `C:\opencv\build\x64\vc15\bin`）。
  - 经测试，将 `vc15` 替换为 `vc14` 目录同样可以使用。
  - 项目的安装脚本能够自行探测项目根目录下的 OpenCV 的安装目录和环境变量，如果探测到了，那么就不会自动下载 OpenCV ，探测的优先级为：
    - 环境变量
    - 项目根目录下的 `opencv` 目录
    - 项目根目录下的 `opencv/opencv` 目录
  - 上述路径安装的 OpenCV 都会被自动探测并将绝对路径配置到 `.env` 文件中。

### 安装依赖

#### 外部依赖

参考[上一节](#安装前准备)的内容，确保你已经安装了 ADB 和 OpenCV（可选） 。

#### 项目依赖

在项目根目录下执行 `npm install` 安装项目依赖。

```pwsh
PS WFNodejs> npm install
```

## 使用

可以直接运行脚本

```pwsh
PS WFNodejs> node .
```

或者使用 `npm link` 将项目链接到全局，然后在任意目录下执行 `wfa` 命令即可。

```pwsh
PS WFNodejs> npm link
# 链接后可以在任意目录下执行 wfa 命令。
PS WFNodejs> wfa
```

输出：
```
Usage: wfa [options] [command]

WFNodejs 是一个运行于 Node.js 的游戏自动化脚本，目前可用于世界弹射物语（国服）。

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  play [options]             运行脚本
  ……
```

## 例子

目前只支持运行铃铛脚本， `wfa play` 即可运行。

```pwsh
PS WFNodejs> wfa play
[2022-08-07 19:14:33][INFO][wfa] 没有找到指定设备，请选择一个设备：
? 请选择一个设备：（使用方向键选择，回车键确认）
……
```

选择一个设备后，脚本会自动运行。