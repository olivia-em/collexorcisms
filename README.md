# Deploying to GitHub Pages with Vite + React

## 🚀 Quick Guide

### 1. Push your code to GitHub

Make sure all your changes are committed and pushed to the `main` branch:

```sh
git add .
git commit -m "Ready for GitHub Pages deploy"
git push origin main
```

### 2. GitHub Actions will build & deploy automatically

- The workflow in `.github/workflows/gh-pages.yml` will:
  - Install dependencies
  - Build your Vite app
  - Deploy the `dist/` folder to the `gh-pages` branch

You can monitor progress in the "Actions" tab of your GitHub repo.

### 3. Configure GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** > **Pages**
3. Set **Source** to `gh-pages` branch, `/ (root)` folder
4. Save

### 4. Your site will be live at

```
https://<your-username>.github.io/<repo-name>/
```

---

## ⚙️ Vite Config for GitHub Pages

Make sure your `vite.config.js` has:

```js
export default defineConfig({
  base: "/<repo-name>/",
  // ...other config
});
```

---

## 🛠 Local Development

```sh
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view your app locally.
