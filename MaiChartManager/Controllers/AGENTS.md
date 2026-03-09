# CONTROLLERS 知识库

## OVERVIEW

ASP.NET Core REST API 控制器，按业务领域分 7 个子目录，共 25 个控制器文件。

## STRUCTURE

| 子目录 | 职责 | 主要文件 |
|--------|------|----------|
| `App/` | 应用状态、授权、版本、本地化 | AppLicenseController, AppStatusController, AppVersionController, LocaleController |
| `AssetDir/` | 资源目录管理、冲突检测、本地资源、曲目列表 | AssetDirController, CheckConflictController, LocalAssetsController, MusicListController |
| `Catagory/` | 版本分类、曲风分类管理 | AddVersionController, GenreController |
| `Charts/` | 谱面 CRUD、预览、导入 | ChartController, ChartPreviewController, ImportChartController |
| `Mod/` | AquaMai mod 配置、安装、路径管理 | ConfigurationController, InstallationController, ManualInstallController, ModPaths |
| `Music/` | 音乐 CRUD、音频/视频转换、批量操作、迁移、VRC 处理 | MusicController, MusicBatchController, CueConvertController, MovieConvertController, MusicTransferController, VrcProcessController |
| `Tools/` | 独立音频/视频转换工具接口 | AudioConvertToolController, VideoConvertToolController |

## WHERE TO LOOK

| 任务 | 去哪里 |
|------|--------|
| 应用授权 / IAP 状态查询 | `App/AppLicenseController.cs` |
| 应用版本检查 / 更新 | `App/AppVersionController.cs` |
| 多语言 / 本地化 | `App/LocaleController.cs` |
| 资源目录增删改查 | `AssetDir/AssetDirController.cs` |
| 导入时冲突检测 | `AssetDir/CheckConflictController.cs` |
| 曲目列表读取 | `AssetDir/MusicListController.cs` |
| 版本/曲风分类管理 | `Catagory/AddVersionController.cs`, `Catagory/GenreController.cs` |
| 谱面增删改查 | `Charts/ChartController.cs` |
| 谱面预览生成 | `Charts/ChartPreviewController.cs` |
| 谱面导入（Simai/Ma2） | `Charts/ImportChartController.cs` |
| AquaMai mod 配置读写 | `Mod/ConfigurationController.cs` |
| AquaMai mod 安装/卸载 | `Mod/InstallationController.cs` |
| 音乐增删改查 | `Music/MusicController.cs` |
| 音乐批量操作 | `Music/MusicBatchController.cs` |
| 音频格式转换（ACB/USM） | `Music/CueConvertController.cs` |
| 视频转换（movie） | `Music/MovieConvertController.cs` |
| 曲目迁移（跨目录） | `Music/MusicTransferController.cs` |
| VRC 音频处理 | `Music/VrcProcessController.cs` |
| 独立音频转换工具 | `Tools/AudioConvertToolController.cs` |
| 独立视频转换工具 | `Tools/VideoConvertToolController.cs` |

## CONVENTIONS

- 新增控制器请放入对应业务子目录，不要堆在根目录
- `Catagory/` 是历史 typo（正确拼写应为 Category），已是既定命名，保持一致，勿重命名
- 前端 API client（`Front/src/client/apiGen.ts`）由 `genClient.ts` 从这些控制器自动生成，修改接口后需重新运行生成脚本
- `Mod/ModPaths.cs` 不是控制器，是 Mod 子目录的路径常量辅助类
