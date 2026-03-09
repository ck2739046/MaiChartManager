// uno.config.ts
import { defineConfig, presetIcons, presetTypography, presetUno } from 'unocss';
import { globSync } from 'tinyglobby';
import { readFileSync } from 'node:fs';

const munetUiFiles = globSync(['node_modules/@munet/ui/dist/**/*.js'], { expandDirectories: false });
const munetUiCode = munetUiFiles.map(f => readFileSync(f, 'utf-8')).join('\n');

export default defineConfig({
  content: {
    inline: [munetUiCode],
  },
  presets: [
    presetUno(),
    presetTypography(),
    presetIcons(),
  ],
});