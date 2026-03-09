# MaiChartManager 主程序目录

## OVERVIEW

主应用目录，ASP.NET Core + WinForms 混合桌面应用的核心代码。包含后端 API、前端 SPA、业务逻辑、工具类等所有主体代码。

## STRUCTURE

```
MaiChartManager/
├── *.cs                  # 根级文件：启动流程、窗口、配置、授权
├── Controllers/          # REST API 控制器（见子目录 AGENTS.md）
├── Front/                # Vue 3 前端 SPA（见子目录 AGENTS.md）
├── Models/               # DTO / XML 数据模型
├── Services/             # 业务逻辑服务
├── Utils/                # 音频/视频/图片转换工具
├── Attributes/           # 自定义 Attribute
├── Locale/               # i18n 资源文件
├── Libs/                 # 打包进来的第三方库
├── Python/               # 嵌入式 Python 运行时（勿修改）
├── FFMpeg/               # 嵌入式 FFmpeg（勿修改）
├── WannaCRI/             # CRI 音频工具，Python 打包（勿修改）
├── Resources/            # 应用资源
└── wwwroot/              # 前端构建产物（勿手动修改）
```

## WHERE TO LOOK

| 任务 | 文件 | 说明 |
|------|------|------|
| 应用启动流程 | `Program.cs` → `AppMain.cs` → `ServerManager.cs` | 单实例 WinForms + Kestrel 启动 |
| 桌面窗口 | `Browser.cs`, `Launcher.cs` | Browser.cs 用 WebView2 嵌入前端 |
| Kestrel 配置 | `ServerManager.cs` | 本地 web server 设置 |
| 应用配置 | `Config.cs`, `StaticSettings.cs` | 运行时配置和静态常量 |
| IAP / 授权 | `IapManager.cs`, `OfflineReg.cs` | Windows Store IAP，离线注册 |
| 请求鉴权 | `AuthenticationMiddleware.cs` | ASP.NET Core 中间件 |
| XML 数据模型 | `Models/MusicXml.cs`, `GenreXml.cs`, `VersionXml.cs` | maimai 谱面元数据结构 |
| AquaMai 配置模型 | `Models/AquaMaiConfigDto.cs` | mod 配置 DTO |
| Simai 谱面导入 | `Services/MaidataImportService.cs` | 解析并导入 Simai 格式谱面 |
| 音频处理 | `Utils/Audio.cs`, `AudioConvert.cs`, `CriUtils.cs` | FFmpeg + CRI SDK 封装 |
| 视频/图片处理 | `Utils/VideoConvert.cs`, `ImageConvert.cs` | 媒体转换工具 |
| maimai 工具函数 | `Utils/MaiUtils.cs` | 谱面相关通用工具 |
| Windows 工具函数 | `Utils/WinUtils.cs` | Win32 API 封装 |
| AquaMai 工具 | `Utils/AquaMaiConfigExtensions.cs`, `AquaMaiSignatureV2.cs` | mod 配置扩展和签名 |
| i18n | `Locale/Locale.resx`, `zh-hans/`, `zh-hant/` | 简体/繁体中文本地化 |

## CONVENTIONS

- 启动顺序：`Program.cs`（入口）→ `AppMain.cs`（生命周期管理）→ `ServerManager.cs`（启动 Kestrel）
- `Browser.cs` 通过 WebView2 加载前端，前端通过 localhost API 与后端通信
- `*.Designer.cs` 是 WinForms 自动生成文件，**不要手动编辑**
- Controllers 按领域分 7 个子目录：App / AssetDir / Catagory / Charts / Mod / Music / Tools
- `Catagory` 是已知 typo（应为 Category），但已是既定命名，**保持一致，不要修改**
- `wwwroot/` 是 `Front/` 构建产物，不要手动修改，通过 `pnpm build` 生成

## ANTI-PATTERNS

- 不要修改 `Python/`、`FFMpeg/`、`WannaCRI/` 目录内容（嵌入式运行时）
- 不要手动编辑 `wwwroot/`（前端构建产物）
- 不要手动编辑 `*.Designer.cs`（WinForms 自动生成）
- 不要在 `Models/` 里写业务逻辑，只放纯数据结构
