# FRONTEND KNOWLEDGE BASE

## OVERVIEW

Vue 3 + TypeScript 前端 SPA，通过 localhost API 与 ASP.NET Core 后端通信，内嵌于 WebView2 桌面窗口。

## STRUCTURE

```
Front/
├── src/
│   ├── client/         # API 客户端层
│   │   ├── api.ts                          # 手写 API 封装
│   │   ├── apiGen.ts                       # ⚠️ 自动生成，禁止手动编辑
│   │   └── aquaMaiVersionConfigApiGen.ts   # ⚠️ 自动生成，禁止手动编辑
│   ├── components/     # 可复用组件：DragDropDispatcher/, Sidebar/, Splash/, VersionInfo/
│   ├── hooks/          # Vue composables
│   ├── icons/          # 图标组件
│   ├── locales/        # i18n 翻译文件
│   ├── plugins/        # Vue 插件（posthog, sentry, i18n）
│   ├── store/          # 状态管理：refs.ts（核心）+ appUpdate.ts（更新/更新日志相关）
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图：BatchAction/, Charts/, GenreVersionManager/, ModManager/, Tools/
│   └── assets/         # 静态资源
├── genClient.ts        # API client 代码生成器
├── vite.config.ts      # Vite 配置
├── uno.config.ts       # UnoCSS 配置
└── tsconfig.json       # TypeScript 配置（strict，@ → ./src）
```

## WHERE TO LOOK

| 任务 | 位置 |
|------|------|
| 调用后端 API | `src/client/api.ts`（手写封装）|
| 添加新页面 | `src/views/` 对应子目录 |
| 全局状态 | `src/store/refs.ts`（核心状态）、`src/store/appUpdate.ts`（更新相关）|
| 复用组件 | `src/components/` |
| 国际化文本 | `src/locales/` |
| 重新生成 API client | 运行 `npx ts-node genClient.ts` |

## CONVENTIONS

- 包管理器：pnpm
- UI 组件库：Naive UI
- 样式方案：UnoCSS（原子化 CSS）
- 路径别名：`@` → `./src`
- 状态管理极简，核心全局 ref 集中在 `src/store/refs.ts`，更新/更新日志相关状态在 `src/store/appUpdate.ts`
- API client 由 `genClient.ts` 读取后端控制器自动生成，输出到 `apiGen.ts`
- 代码注释使用中文

## ANTI-PATTERNS

- 禁止手动编辑 `src/client/apiGen.ts` 和 `aquaMaiVersionConfigApiGen.ts`，修改会在下次生成时被覆盖
- 需要新增 API 调用时，在后端添加控制器后运行 `genClient.ts` 重新生成，再在 `api.ts` 中封装
- 不要用 npm 或 yarn，统一使用 pnpm
