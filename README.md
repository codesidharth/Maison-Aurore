# Maison Aurore | Fine Jewellery

A 3D jewellery website in plain HTML, CSS and JavaScript. No build step, no npm.
The diamond and ring are hand-written WebGL. Works on desktop and mobile, in Dark and Light themes.

## Run it locally (VS Code)
1. File > Open Folder, choose this folder.
2. Install the **Live Server** extension, then right-click `index.html` > **Open with Live Server**.
   (Double-clicking `index.html` also works.)

## Put it online with GitHub Pages (free live URL)
1. Create a GitHub account (github.com) and click **New repository**. Name it, for example, `maison-aurore`. Keep it Public. Click **Create repository**.
2. On the new repository page click **uploading an existing file**. Drag in **everything inside this folder**
   (`index.html`, `css`, `js`, `images`, `.nojekyll`, `README.md`). Click **Commit changes**.
   - `index.html` must be at the top level of the repository, not inside another folder.
3. Go to **Settings > Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**,
   choose **main** and **/(root)**, then click **Save**.
4. Wait one to two minutes and refresh. The page shows your live address:
   `https://YOUR-USERNAME.github.io/maison-aurore/`
5. Open that link on any phone or laptop. To update the site later, upload the changed files again and commit.

Using Git instead:
```
git init
git add .
git commit -m "Maison Aurore"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/maison-aurore.git
git push -u origin main
```
then do step 3 above.

## What is inside
- `index.html` page structure
- `css/style.css` design (dark with champagne gold, plus a Light theme)
- `js/gem.js` WebGL renderer for the diamond and ring
- `js/main.js` interactions: tilt cards, filters, wishlist, ring designer, cursor, scroll progress, theme switch
- `images/` product photos, ring designer photos and the Maison Aurore logo files

## Editing
- Product photos: `MAISON_PHOTOS` at the top of `js/main.js`. Replace a file with one of the same name to swap it.
- Ring designer photos: `images/ring-<metal>-<stone>.jpg`.
- Remove the Dark / Light switch: delete the `<div class="palette">` block in `index.html`.

Brand, reviews and prices are fictional demo content. The newsletter form sends nothing.
