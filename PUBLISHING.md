# 发布 dsh-family-health 到 GitHub 与插件市场

## 一、发布到 GitHub（二选一）

### 方案 A：我用脚本自动发布（推荐，无需装 Git）

你的电脑上 GitHub API 完全可达（已验证），我准备了一个脚本用 API 直接建仓库、上传文件。

**前提**：需要一个 GitHub Personal Access Token（PAT），权限勾选 `repo`（或至少 `public_repo`）。

**获取 token 步骤**：
1. 打开 https://github.com/settings/tokens
2. 点 **Generate new token (classic)**
3. Note 填 `dsh-family-health`，Expiration 选 90 天
4. 勾选 **repo**（公开仓库只需 `public_repo`）
5. 生成后复制 token（形如 `ghp_xxxx...`，只显示一次）

**执行发布**（token 作为参数传入，不会写盘）：

```powershell
node "D:\dsh-workspace\dsh-family-health\publish-to-github.js" <你的token>
```

脚本会：建公开仓库 → 上传全部文件 → 打 `dsh-plugin` topic。

### 方案 B：装 Git 后手动 push

若你想自己控制 Git 流程：

1. 装 Git for Windows：https://git-scm.com/download/win
2. 在 GitHub 网页新建空仓库 `gavin1014ad/dsh-family-health`（不要勾 README）
3. 执行：

```powershell
cd D:\dsh-workspace\dsh-family-health
git init -b main
git add -A
git commit -m "feat: dsh-family-health 1.0.0"
git remote add origin https://github.com/gavin1014ad/dsh-family-health.git
git push -u origin main
```

---

## 二、给仓库加 topic（若脚本没加上）

在仓库页 **About 右侧齿轮 → Topics**，输入 `dsh-plugin` 保存。

---

## 三、提交到插件市场（awesome-dsh-plugin）

插件市场（dshmarket）不直接收插件，它读取精选列表 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)。上架 = 向该仓库提 PR，**一个插件一个 YAML 文件**。

**硬性门槛（CI 会检查）**：
- ✅ 仓库 `package.json` 声明了 `dsh.bundle`（我已配置）
- ✅ `@deepseek-ai/*` 用 peerDependencies 声明（我已配置）
- ✅ 有 `engines.dsh` 兼容声明（我已配置）
- ⚠️ 仓库**创建满 1 天**才能提 PR
- ⚠️ 仓库带 `dsh-plugin` topic
- ✅ 有真实可运行代码 + LICENSE

**步骤**：
1. 等仓库创建满 1 天。
2. Fork https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
3. 在 fork 的 `data/plugins/` 目录新建文件 `gavin1014ad__dsh-family-health.yml`，内容是：

```yaml
url: https://github.com/gavin1014ad/dsh-family-health
name: gavin1014ad/dsh-family-health
```

（这份内容我也准备好了：见 `market/awesome-dsh-plugin-entry.yml`）

4. 提交并提 PR，标题如 `add dsh-family-health`。
5. 等 CI 通过 + 维护者合并，通常**一天内**出现在插件市场。

---

## 四、已满足的上架要求清单

| 要求 | 状态 |
|---|---|
| `dsh.bundle` 声明 | ✅ |
| `dsh.client` 声明 | ✅ |
| `peerDependencies`（@deepseek-ai/*） | ✅ 两条，覆盖 0.1.x + 0.2.x |
| `engines.dsh` | ✅ `>=0.1.0-rc.6 <0.3.0-0` |
| `repository` 字段 | ✅ github.com/gavin1014ad/dsh-family-health |
| LICENSE | ✅ MIT |
| README + 详情文档 | ✅ |
| 图标 | ✅ icon.svg |
| `dsh-plugin` topic | ⏳ 发布后加 |

---

## 五、数据脱敏说明

已发布的代码**不含任何真实个人信息**：成员为虚构示例（示例·父亲/母亲/本人），体检数据为虚构示例，医院为「示例体检中心」。你可以放心公开。
