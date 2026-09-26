# AGENTS.md — 本仓库的协作规范

> 给所有在这个项目里干活的 AI / 人：**开工前先读这份规范，再读 `PLAN.md`（项目进度与历史）**。
> 本文件只放「怎么干活」的规矩；「项目是什么、做到哪了」都在 PLAN.md。

---

## 1. 项目速览

- 个人作品集网站（静态站，无构建步骤、无框架）：`index.html`（主页）/ `works.html`（全部作品）/ `about.html`（关于）
- 技术：原生 HTML / CSS / JS + WebGL（three.js、ogl，均已本地化在 `js/vendor/`）
- 运行环境：Windows + PowerShell 5.1，需 Node（仅用于本地预览）
- 语言：站点内容全中文；站内昵称「阿宇 Ahyu」，不出现真名

## 2. 本地预览（必须）

服务器脚本**不在仓库里**（在系统临时目录，可能被清理）。需要时用下面代码在项目根目录建 `serve.js` 并运行：

```powershell
node serve.js "E:\OpenCode\wangzhan" 8123
```

```js
const http=require("http"),fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd(),port=+(process.argv[3]||8123);
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".glb":"model/gltf-binary",".mp4":"video/mp4"};
http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split("?")[0]);if(p.endsWith("/"))p+="index.html";fs.readFile(path.join(root,p),(e,d)=>{if(e){s.writeHead(404);return s.end("404")}s.writeHead(200,{"Content-Type":mime[path.extname(p).toLowerCase()]||"application/octet-stream","Cache-Control":"no-cache"});s.end(d)})}).listen(port,()=>console.log("http://localhost:"+port));
```

注意：`fetch("data/works.json")` 等逻辑依赖 HTTP 协议，**不能用 file:// 直接打开**。

## 3. 硬性约定（违反会出事故）

1. **改 css/js 后必须升版本号**：三个 HTML 里 `?v=N` 同步 +1（如 `style.css?v=52`），否则浏览器缓存旧文件。
2. **文件编码是 UTF-8 无 BOM，中文极脆弱**：
   - 禁止用 PowerShell 默认编码的 `Get-Content`/`Set-Content` 批量改写文件（历史上把全站中文变乱码过）
   - 用专用编辑工具，或显式 `[System.IO.File]::WriteAllText($p,$s,(New-Object System.Text.UTF8Encoding($false)))`
   - 改完中文页面后抽查一次显示是否正常
3. **作品数据只有一个来源**：`data/works.json`（自带 `_readme` 说明字段）。首页精选、首页图集、作品页、快照页全从它渲染。加作品/改文案/换图/调标签只改这一个文件，**不要在 HTML/JS 里写死作品内容**。
4. **不要引入境外 CDN**：`importmap` 指向 `js/vendor/`（three、ogl 已本地化）。新增库同样下载进 `js/vendor/`。
5. **不要提交 `models/aodike.glb`**（185MB，超 GitHub 100MB 限制且未被使用），已在 `.gitignore`。
6. **每完成一处用户确认的改动就 git commit**（用户依赖它做一键回退）。提交信息用中文简述。

## 4. 内容与文案口径

- 定位：作品集，给**面试官**和**接单客户**看
- 分寸：**不显初学者**（忌「学习/尝试/探索中」），**不显傲慢**（忌「资深/专家/多年经验」）；用事实陈述代替自我评价
- 文字先沟通确认再替换，一处一处来
- 联系方式：邮箱 2827290813@qq.com、微信 zhenhaoya500

## 5. 关键文件

| 文件 | 作用 |
|------|------|
| `PLAN.md` | 项目计划、里程碑、**每轮开发记录**（新会话开工前必读） |
| `data/works.json` | 全站作品数据（用户自己编辑的入口） |
| `js/model-viewer.js` | 可复用 3D 模型查看器（拖拽旋转/惯性/自转），快照页用 |
| `js/scene3d.js` | 主页 hero 3D 模型系统 |
| `js/site-data.js` | 读 works.json 并渲染首页精选/图集 |
| `js/works.js` | 作品页：筛选、快照、模型切换 |
| `js/vendor/` | 本地化的第三方库（three、ogl） |
| `images/icons/` | 技能区软件图标 |
