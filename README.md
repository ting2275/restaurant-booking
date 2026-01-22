# Restaurant Booking System

本專案文檔包含所有開發相關的說明和指南。

## 開發環境說明與建置

### 開發環境說明

<details>
  <summary>展開 : 開發環境說明</summary>

  - **環境需求**
    - Node.js 21.7.3+
    - NPM 10.8.1+
    - Vue CLI 5.0.5+
    - Vite 5.3.3+
    - Vue Router 4.4.0+

  - **安裝步驟**
    - Clone 專案
    - 安裝依賴
    - 啟動開發伺服器

  - **開發流程**
    - GitFlow 分支管理
    - 代碼提交
    - 合併請求

</details>

<details>
  <summary>展開 : Vue開發版本</summary>

  - VueCLI      版本 5.0.5  (Vue3)
  - Vite        版本 5.3.3
  - Vue-router  版本 4.4.0
</details>


### 環境設置

#### 1. Clone專案至本機
```bash
git clone <repository-url>
cd restaurant-booking
```

#### 2. 安裝依賴並啟動開發伺服器
```bash
npm install
npm run dev
```

### GitFlow 開發流程

本專案採用 GitFlow 工作流程，主要分支說明：

- **main**: 主要分支，用於已開發並測試完成，確定可上線的版本
- **develop**: 開發分支，用於開發中版本，用於提交測試

#### 分支命名規範

- **feature/功能名稱**: 新功能開發分支
- **hotfix/修復名稱**: 緊急修復分支
- **refactor/重構功能名稱**: 舊有功能重構分支

#### 開發流程

##### 1. 新功能開發

從 `develop` 分支創建功能分支：
```bash
# 確保在 develop 分支並更新到最新
git checkout develop
git pull origin develop

# 創建功能分支
git checkout -b feature/member-register
```

開發完成後：
```bash
# 提交變更
git add .
git commit -m "feat: 新增會員註冊功能"

# 推送功能分支
git push origin feature/member-register
```

##### 2. 功能分支合併

1. 在 GitLab 創建合併請求 (Merge Request)
2. 從 `feature/member-register` 合併到 `develop`
3. 描述變更內容和目的
4. 請求代碼審查
5. 審查完成後合併至 `develop`

##### 3. 版本發布

當 `develop` 分支功能穩定後：
```bash
# 從 develop 創建 release 分支
git checkout develop
git checkout -b release/v1.2.0

# 進行最終測試和修復
# 修復完成後合併到 main 和 develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0

git checkout develop
git merge release/v1.2.0

# 刪除 release 分支
git branch -d release/v1.2.0
```

##### 4. 緊急修復

從 `main` 分支創建 hotfix 分支：
```bash
# 確保在 main 分支並更新到最新
git checkout main
git pull origin main

# 創建 hotfix 分支
git checkout -b hotfix/critical-bug-fix
```

修復完成後：
```bash
# 提交修復
git add .
git commit -m "fix: 修復關鍵性錯誤"

# 推送 hotfix 分支
git push origin hotfix/critical-bug-fix
```

合併 hotfix：
```bash
# 合併到 main
git checkout main
git merge hotfix/critical-bug-fix
git tag v1.2.1

# 合併到 develop
git checkout develop
git merge hotfix/critical-bug-fix

# 刪除 hotfix 分支
git branch -d hotfix/critical-bug-fix
```

#### 提交訊息規範

使用 Conventional Commits 格式：
- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文檔更新
- `style:` 程式碼格式調整
- `refactor:` 重構
- `test:` 測試相關

範例：
```bash
git commit -m "feat: 新增會員註冊功能"
git commit -m "fix: 修復登入頁面樣式問題"
git commit -m "docs: 更新 API 文檔"
```


## 開發指南

<details>
  <summary>展開 : 環境準備</summary>

  - 確保已安裝 Node.js (版本 >= 21.7.3)
  - 安裝依賴：`npm install`
  - 啟動開發伺服器：`npm run dev`
</details>

<details>
  <summary>展開 : 開發規範</summary>

  - **程式碼風格**: 使用 ESLint + Prettier
  - **組件命名**: 使用 PascalCase
  - **檔案命名**: 使用 kebab-case
  - **Git 提交**: 使用 Conventional Commits
</details>

---

## 文檔目錄

### 通用工具函數

<details>
  <summary>點擊展開通用工具函數說明</summary>

  - **工具總覽**: [`utils.md`](./README/utils/utils.md)
    - singletonFactory.js - 單例工廠
    - resetManager.js - 重置管理器
    - errorHandler.js - 錯誤處理器

  **使用範例**:
  - **基礎使用**: [`basic.md`](./README/utils/useExamples/basic.md) - 基礎使用場景和最佳實踐
  - **通知模組**: [`notification.md`](./README/utils/useExamples/notification.md) - 通知系統的完整實作範例

</details>

### 組件使用說明

<details>
  <summary>點擊展開組件使用說明</summary>

  **目錄路徑**: `src/components`

  - **DropdownMenu**: `Dropdown/DropdownMenu`
    - 下拉選單組件
    - 支援多層級選單
    - 自定義樣式和行為

  > **提示**: 更多組件說明將陸續添加...

</details>

### 專案結構

```
src/
├── components/          # Vue 組件
│   ├── Dropdown/       # 下拉選單組件
│   └── ...
├── composables/        # Vue Composables
│   ├── notification/   # 通知模組
│   ├── payment/        # 支付模組
│   └── ...
├── stores/             # Pinia 狀態管理
├── services/           # API 服務
├── utils/              # 通用工具函數
├── router/             # 路由配置
├── views/              # 頁面組件
└── assets/             # 靜態資源
```

## 文檔維護

### 添加新文檔

1. **開發工具文檔**: 放在 `common/` 目錄下
2. **工具函數文檔**: 放在 `utils/` 目錄下
3. **組件文檔**: 放在 `components/` 目錄下
4. **模組文檔**: 放在對應模組目錄下

### 文檔格式規範

- 使用 Markdown 格式
- 添加適當的標題層級
- 包含程式碼範例
- 使用 emoji 增加可讀性
- 保持結構一致性

## 相關連結

- [Vue 3 官方文檔](https://vuejs.org/)
- [Pinia 狀態管理](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vite 建置工具](https://vitejs.dev/)

## 支援

如有問題或建議，請聯繫開發團隊。

---

**最後更新**: 2025年06月

