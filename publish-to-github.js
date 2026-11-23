/**
 * 发布 dsh-family-health 到 GitHub
 *
 * 用法：
 *   node publish-to-github.js <GitHub-PAT>
 *
 * 会用 GitHub REST API 完成：
 *   1. 创建公开仓库 gavin1014ad/dsh-family-health（已存在则复用）
 *   2. 上传目录内所有文件（base64 编码）
 *   3. 给仓库打上 dsh-plugin topic
 *
 * 注意：token 需要 repo + public_repo 权限。token 只在本脚本内使用，不会写盘。
 */
const fs = require("fs");
const path = require("path");

const OWNER = "gavin1014ad";
const REPO = "dsh-family-health";
const ROOT = __dirname;

const token = process.argv[2];
if (!token) {
  console.error("用法: node publish-to-github.js <GitHub-PAT>");
  process.exit(1);
}

const api = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "dsh-family-health-publish",
      ...(options.headers || {}),
    },
  }).then(async (r) => {
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }
    if (!r.ok) {
      const msg = json?.message || text || r.statusText;
      throw new Error(`${r.status} ${msg}`);
    }
    return json;
  });

// 要上传的文件（排除 node_modules、.git、market 提交模板可保留也可跳过）
const SKIP = new Set([".git", "node_modules"]);
function collectFiles(dir, base = "") {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...collectFiles(full, rel));
    else out.push({ rel, full });
  }
  return out;
}

async function main() {
  // 1. 确保仓库存在
  let repo;
  try {
    repo = await api(`https://api.github.com/repos/${OWNER}/${REPO}`);
    console.log(`✓ 仓库已存在: ${repo.html_url}`);
  } catch (e) {
    if (e.message.startsWith("404")) {
      repo = await api("https://api.github.com/user/repos", {
        method: "POST",
        body: JSON.stringify({
          name: REPO,
          description: "A family health manager for DeepSeek Harness — member profiles, exam records, disease-risk analysis, health advice, and HTML report export with PDF import.",
          homepage: "",
          private: false,
          auto_init: false,
        }),
      });
      console.log(`✓ 已创建仓库: ${repo.html_url}`);
    } else {
      throw e;
    }
  }

  // 2. 上传文件
  const files = collectFiles(ROOT).filter((f) => !f.rel.startsWith("market/"));
  console.log(`\n准备上传 ${files.length} 个文件...`);
  for (const f of files) {
    const content = fs.readFileSync(f.full);
    const b64 = content.toString("base64");
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(f.rel)}`;
    try {
      await api(url, {
        method: "PUT",
        body: JSON.stringify({ message: `Add ${f.rel}`, content: b64 }),
      });
      console.log(`  ✓ ${f.rel}`);
    } catch (e) {
      // 文件已存在则更新（需要 sha）
      if (e.message.startsWith("422")) {
        const existing = await api(url);
        await api(url, {
          method: "PUT",
          body: JSON.stringify({
            message: `Update ${f.rel}`,
            content: b64,
            sha: existing.sha,
          }),
        });
        console.log(`  ✓ ${f.rel} (updated)`);
      } else {
        throw e;
      }
    }
  }

  // 3. 设置 topic（需要 repo 权限）
  try {
    await api(`https://api.github.com/repos/${OWNER}/${REPO}/topics`, {
      method: "PUT",
      headers: { Accept: "application/vnd.github.mercy-preview+json" },
      body: JSON.stringify({ names: ["dsh-plugin", "health", "deepseek", "harness", "family-health"] }),
    });
    console.log("\n✓ 已设置 topic: dsh-plugin 等");
  } catch (e) {
    console.warn(`⚠ 设置 topic 失败（可稍后手动在仓库页添加）: ${e.message}`);
  }

  console.log(`\n✅ 发布完成: https://github.com/${OWNER}/${REPO}`);
  console.log("下一步：");
  console.log("  1. 在仓库页 About → Topics 确认已加 dsh-plugin");
  console.log("  2. 等仓库创建满 1 天后，Fork awesome-dsh-plugin 并提 PR（条目文件见 market/awesome-dsh-plugin-entry.yml）");
}

main().catch((e) => {
  console.error("❌ 发布失败:", e.message);
  process.exit(1);
});
