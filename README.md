# preview-hub

micro-apps 预览门户。只做目录，不 loadRemote、不登录。

```bash
pnpm install
pnpm dev   # http://127.0.0.1:8999/
```

按访问环境读注册表，没有手动切换。地址写在 `.env`：

- 本地 `pnpm dev`：页面请求 `/registry`，Vite 转发到 `DEV_PLUGIN_REGISTRY_URL`（默认 `http://localhost:9002/remotes/plugins-registry.json`）
- 线上构建：页面请求 `VITE_PLUGIN_REGISTRY_URL`（默认 `https://dnhyxc.cn:9002/remotes/plugins-registry.json`）

改 `.env` 后需要重启 `pnpm dev`。卡片打开该条 `entry` 的源站加上 `routePath`。`enabled: false` 仍会显示。

目标没起来时卡片不可点，并显示注册表里的源站。`dnhyxc.cn` 提示线上未响应。本机 9008 上注册表路径若没有 mock 路由，卡片不可点。
