# Fonts

The UI asks for `Baloo 2` then `Fredoka`, falling back to a heavy system font.
CrazyGames requires every asset to be bundled, so for the final build download
the font and self-host it:

1. Get `Baloo2-ExtraBold.woff2` from Google Fonts.
2. Save it in this folder.
3. Add to the top of `styles/main.css`:

```css
@font-face {
  font-family: "Baloo 2";
  src: url("../assets/fonts/Baloo2-ExtraBold.woff2") format("woff2");
  font-weight: 800;
  font-display: swap;
}
```
