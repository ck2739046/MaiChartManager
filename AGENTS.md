# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-26
**Commit:** 1cb9a70
**Branch:** feat/munet-ui

## OVERVIEW

MaiChartManager (Sitreamai) — maimai 音游谱面管理工具。C# ASP.NET Core 后端 + WinForms 桌面壳 + Vue 3 前端 SPA，内嵌本地 web server。

## STRUCTURE

```
Sitreamai/
├── MaiChartManager/          # 主程序：ASP.NET Core + WinForms 混合桌面应用
│   ├── Controllers/          # REST API 控制器（按领域分子目录）
│   ├── Front/                # Vue 3 + TypeScript 前端 SPA
│   ├── Models/               # DTO / XML 数据模型
│   ├── Services/             # 业务逻辑服务
│   ├── Utils/                # 音频/视频/图片转换、CRI 工具
│   ├── WannaCRI/             # CRI 音频格式处理
│   └── FFMpeg/               # 嵌入式 FFmpeg
├── MaiChartManager.CLI/      # 命令行工具 (mcm)，Spectre.Console
├── AquaMai/                  # [submodule] BepInEx/MelonLoader 游戏 mod
├── MaiLib/                   # [submodule] maimai 谱面解析库
├── SimaiSharp/               # [submodule] Simai 谱面格式解析
├── SonicAudioTools/          # [submodule] CRI 音频工具库
├── XV2-Tools/                # [submodule] ACB/HCA 音频格式处理
└── Packaging/                # MSIX 打包脚本和资源
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 添加/修改 API 接口 | `MaiChartManager/Controllers/` | 按领域分目录，见子目录 AGENTS.md |
| 前端 UI 修改 | `MaiChartManager/Front/src/` | Vue 3 + Naive UI，见子目录 AGENTS.md |
| 音频处理逻辑 | `MaiChartManager/Utils/Audio*.cs`, `CriUtils.cs` | FFmpeg + CRI SDK |
| 谱面导入/解析 | `MaiChartManager/Services/`, `MaiLib/`, `SimaiSharp/` | MaiLib 和 SimaiSharp 是 submodule |
| 应用启动流程 | `MaiChartManager/Program.cs` → `AppMain.cs` → `ServerManager.cs` | WinForms 单实例 + Kestrel |
| 桌面窗口 | `Browser.cs`, `Launcher.cs` | WinForms，WebView2 嵌入前端 |
| IAP/授权 | `IapManager.cs`, `OfflineReg.cs` | Windows Store IAP |
| CLI 工具 | `MaiChartManager.CLI/` | `makeusm`, `makeacb` 命令 |
| AquaMai mod 配置 | `Controllers/Mod/`, `Models/AquaMaiConfigDto.cs` | 管理游戏 mod 的安装和配置 |
| 打包发布 | `Packaging/Build.ps1` | PowerShell，MSIX 打包 |

## CONVENTIONS

- 构建配置：Debug / Release / Crack（三种，Crack 是特殊功能解锁）
- 平台：仅 x64
- 5 个 git submodule，各自有独立仓库，勿直接修改 submodule 内代码
- 前端 API client 由 `genClient.ts` 自动生成，勿手动编辑 `apiGen.ts`
- 前端包管理用 pnpm
- 后端 ASP.NET Core 控制器按领域分子目录（App/AssetDir/Catagory/Charts/Mod/Music/Tools）
- 注意：`Catagory` 是 typo（应为 Category），但已是既定命名，保持一致

## ANTI-PATTERNS

- 不要修改 submodule 内的代码（AquaMai/MaiLib/SimaiSharp/SonicAudioTools/XV2-Tools）
- 不要手动编辑 `Front/src/client/apiGen.ts` 和 `aquaMaiVersionConfigApiGen.ts`
- 不要修改 `*.Designer.cs` 文件（WinForms 自动生成）

## COMMANDS

```bash
# 构建（需要 Visual Studio 或 dotnet CLI）
dotnet build Sitreamai.slnx -c Release

# 前端开发
cd MaiChartManager/Front && pnpm install && pnpm dev

# 前端构建
cd MaiChartManager/Front && pnpm build

# 生成 API client
cd MaiChartManager/Front && npx ts-node genClient.ts

# 打包
powershell Packaging/Build.ps1
```

## NOTES

- 项目混合了 WinForms（桌面壳）+ ASP.NET Core（本地 API server）+ Vue 3（前端 SPA）的非常规架构
- Browser.cs 用 WebView2 加载前端，前端通过 localhost API 与后端通信
- Python 和 FFmpeg 是嵌入式运行时，打包在应用内
- MaiChartManager.CLI 共享主项目的部分代码，但是独立的 csproj
