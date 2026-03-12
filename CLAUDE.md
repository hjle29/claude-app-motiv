# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start              # Start Metro bundler
yarn android            # Run on Android
yarn ios                # Run on iOS

yarn lint               # Run all lint checks (ESLint + Prettier + TypeScript)
yarn lint:fix           # Auto-fix lint issues
yarn lint:rules         # ESLint only
yarn lint:code-format   # Prettier check only
yarn lint:type-check    # TypeScript only

yarn test               # Run tests
yarn test --testPathPattern=Example   # Run a single test file
yarn test:report        # Run tests with coverage report
```

## Architecture

### Path Alias
`@/` maps to `src/`. All internal imports use this alias.

### Navigation
- `src/navigation/paths.ts` — `Paths` const enum (`Paths.Startup`, `Paths.Example`)
- `src/navigation/types.ts` — `RootStackParamList` and `RootScreenProps<Paths.X>` for typed screen props
- `src/navigation/Application.tsx` — root stack navigator

### Theme System
All styles come from the theme — no raw style values in components.

- **Config**: `src/theme/_config.ts` defines color tokens, sizes (`[12, 16, 24, 32, 40, 80]`), and variants (currently only `dark`)
- **Generation**: `ThemeProvider` generates utility style objects from config at runtime:
  - `fonts.size_16`, `fonts.gray800`, `fonts.bold` (font sizes and colors from config sizes/colors)
  - `gutters.marginTop_80`, `gutters.paddingHorizontal_32` (from config sizes)
  - `backgrounds.gray100`, `layout.flex_1`, `layout.row`, `borders.*`
  - `components.buttonCircle`, `components.circle250` (from `src/theme/components.ts`)
- **Adding a new size**: add to `sizes` array in `_config.ts` — all generators pick it up automatically
- **Adding a variant**: add to `config.variants` in `_config.ts` with partial color overrides
- **Access**: `const { fonts, gutters, layout, colors, variant } = useTheme()` — from `@/theme`

### Asset Loading
`src/theme/assets/getAssetsContext.ts` uses `require.context()` (enabled via `unstable_allowRequireContext: true` in `metro.config.js`) to dynamically load assets:
- Images: `src/theme/assets/images/` — PNG/JPG, with variant subdirectories (e.g. `dark/`)
- Icons: `src/theme/assets/icons/` — SVG files, with variant subdirectories
- `AssetByVariant` and `IconByVariant` atoms resolve assets by current theme variant, falling back to default

### Hooks
- `src/hooks/domain/` — domain hooks (e.g. `useUser`) that wrap TanStack Query calls
- `src/hooks/language/` — `useI18n` for language toggling; `SupportedLanguages` enum (en-EN, fr-FR)
- Domain hooks export a factory (e.g. `useUser()`) that returns query hooks

### API / Services
- `src/services/instance.ts` — `ky` HTTP client, base URL from `process.env.API_URL`
- `src/hooks/domain/*/userService.ts` — service functions using the instance
- All API responses validated with `zod` schemas

### Translations
`src/translations/` — i18next with `en-EN.json` and `fr-FR.json`. Default fallback is `fr-FR`. A `capitalize` formatter is registered. Import `useTranslation` from `react-i18next`.

### Component Structure (Atomic Design)
```
atoms/       — AssetByVariant, IconByVariant, Skeleton
molecules/   — DefaultError
organisms/   — ErrorBoundary
templates/   — SafeScreen (wraps SafeAreaView + StatusBar + ErrorBoundary)
```

### Testing
- Tests live alongside components (`Example.test.tsx`) or in `src/tests/`
- `src/tests/__mocks__/` — manual mocks loaded in `jest.setup.js`; `getAssetsContext` must be mocked (uses `require.context` which is unavailable in Jest)
- Mock libs are in `src/tests/__mocks__/libs/` (reanimated, safe-area-context)

## Key Conventions

**TypeScript**: Use `type` not `interface` (enforced by ESLint). `const enum` is used for `Paths`, `Variant`, and `SupportedLanguages`.

**Import order** (enforced by `perfectionist/sort-imports`): side-effects → types → external → theme/hooks/navigation/translations → components/screens → internal. Alphabetical within groups. One blank line between groups.

**No magic numbers** outside `src/theme/*.ts` — use theme values or named constants.

**No `console.log`** — only `console.warn` and `console.error` are allowed.
