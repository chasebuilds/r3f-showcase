# r3f-showcase

[![CI](https://github.com/chasebuilds/r3f-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/chasebuilds/r3f-showcase/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Four interactive 3D pieces you can put on a small business website, each one a ready-to-use component: a product configurator, a scroll-driven landing hero, a floating gallery wall and a glowing lava planet. They run in the browser with no plugin, and they are tuned to stay fast on phones.

**Live demo:** https://chasebuilds.github.io/r3f-showcase/

![Overview of the four 3D demos](docs/preview.png)

## What a client gets

| Piece | What the visitor sees | Where it fits |
| --- | --- | --- |
| Product configurator | A 3D shoe. They pick a part, a colour and a material and the price updates. | Shoes, furniture, bikes, signs, jewellery |
| Scroll-driven hero | A 3D object that turns, moves and changes colour as they scroll. | Launch pages, product stories |
| Gallery wall | Panels floating in a ring around them. Hover to bring one forward, drag to look around. | Portfolios, menus, listings, case studies |
| Shader planet | A glowing lava planet with heat, speed and colour controls. | Landing pages, game sites, event banners |

All four work on a phone. If a visitor's device cannot show 3D, they see a plain text message instead of a broken page.

## Speed and comfort

Each scene goes through one shared wrapper (`src/lib/SceneCanvas.tsx`) that applies the same rules:

- **Loads only when opened.** Every scene is its own lazy-loaded route. The overview page has no 3D code at all.
- **Adapts to the device.** Sharpness (pixel ratio) moves between 0.75 and 2 based on measured frame rate.
- **Stops when you cannot see it.** The scene stops drawing when it is scrolled out of view or the tab is in the background.
- **Draws only when needed** for scenes with nothing animating (frame loop on demand).
- **Reduced motion.** If the visitor has "reduce motion" turned on, nothing drifts or spins by itself. The scenes still react to clicks, drags and scrolling.
- **Small models.** There are no model files. The shoe is built from basic shapes in code and the gallery images are drawn in code, so a scene costs no extra downloads.

A small badge in the corner of each scene shows its current mode (live, draws on change, paused) and pixel ratio, so you can see these rules working.

## Measured

Lighthouse performance score (mobile settings, Lighthouse 13.6.0, run against the live GitHub Pages site on 2026-11-22):

| Page | Performance | Largest paint | Blocking time | Layout shift |
| --- | --- | --- | --- | --- |
| Overview (no 3D) | 100 | 1.2 s | 40 ms | 0 |
| Product configurator | 81 | 2.4 s | 680 ms | 0.018 |
| Scroll-driven hero | 76 | 2.4 s | 980 ms | 0.018 |
| Gallery wall | 90 | 2.6 s | 310 ms | 0 |
| Shader planet | 82 | 2.4 s | 630 ms | 0.018 |

Each score is one run (`npx lighthouse@13.6.0 <url> --only-categories=performance`), not an average. The scene pages score lower because three.js is about 930 KB of JavaScript (246 KB gzipped) that the browser has to parse before it can draw.

- Production JavaScript: the overview page loads 226 KB (71 KB gzipped). A scene page adds one shared 3D chunk of 927 KB (246 KB gzipped) plus 5 to 13 KB for the page itself.
- 28 automated tests (logic, controls, routing, fallback).
- Scores change from run to run. Lighthouse uses a headless Chrome that draws 3D in software, so a real phone with a GPU should draw these scenes more easily. Treat the numbers as a guide, not a promise.

## Run it

```bash
npm ci
npm run dev        # local dev server
npm test           # Vitest
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # type-check and production build
```

## Use a scene in your own React project

Each scene is a component with typed props. Copy `src/lib/` and the scene folder you want.

```tsx
<LavaPlanet heat={0.7} speed={1} palette="magma" />

<GalleryWall items={myItems} activeIndex={active} onActiveChange={setActive} />

<ScrollHero steps={[{ title: 'Meet the product', body: 'One idea per screen.' }]} />

<ProductConfigurator onChange={(config) => addToCart(config)} />
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/lib/SceneCanvas.tsx` | Shared canvas wrapper with the performance rules |
| `src/lib/perf.ts` | Frame loop choice, pixel ratio mapping, reduced motion and visibility hooks |
| `src/scenes/ProductConfigurator.tsx` | Configurator (model in `configurator/`: shape, controls, price) |
| `src/scenes/ScrollHero.tsx` | Scroll-driven hero |
| `src/scenes/GalleryWall.tsx` | Gallery wall (ring layout and panel drawing in `gallery/`) |
| `src/scenes/LavaPlanet.tsx` | Planet; the GLSL is in `planet/shader.ts` |
| `src/pages/` | One lazy-loaded page per scene |
| `.github/workflows/` | CI (lint, type-check, tests, build) and Pages deploy |

Built with React 19, TypeScript (strict), Vite, three.js, `@react-three/fiber` and `@react-three/drei`. The shoe, the panel images, the planet shader (its own noise and crack code) and all layout maths are original to this repo. There are no downloaded models, textures or fonts.

## Limitations

- The shoe is a simple stylised model made from shapes. A real client product would use a modelled file (glTF), which this code can load with `useGLTF` but does not include.
- The configurator price is a made-up sample, not connected to a shop or cart.
- The tests cover logic, controls, routing and the no-3D fallback. The 3D drawing itself is checked by eye, not by automated image tests.
- Pointer hover on the gallery is for mouse users. On touch screens a tap or the Previous and Next buttons turn the ring.
- The scroll hero reads scroll position directly, so it assumes the page scrolls normally in the browser window.

## License

MIT, see [LICENSE](LICENSE).

## More from Chase Builds

- **[liquid-logo-studio](https://github.com/chasebuilds/liquid-logo-studio)**: Turns any logo into animated liquid chrome or gold, ready to export or embed. ([live demo](https://chasebuilds.github.io/liquid-logo-studio/))
- **[cursor-fluid](https://github.com/chasebuilds/cursor-fluid)**: A dependency-free WebGL2 fluid background that follows the cursor, keeps hero text readable and scales quality to hold frame rate on phones. ([live demo](https://chasebuilds.github.io/cursor-fluid/))
- **[notebook-shelf](https://github.com/chasebuilds/notebook-shelf)**: A shelf of notebooks that open in 3D. Great for portfolios, menus and catalogs. ([live demo](https://chasebuilds.github.io/notebook-shelf/))

[All projects, sorted by industry](https://github.com/chasebuilds) · [chasebuilds.github.io](https://chasebuilds.github.io)
