# SIPEDA Design System

> Pedoman visual & komponen untuk Sistem Informasi Pendonoran Darah PMI Kabupaten Indramayu.

---

## 1. Design Principles

| Prinsip | Artinya |
|---|---|
| **Clarity over cleverness** | Data darah adalah informasi kritis. Tampilkan dengan jelas, bukan cantik tapi ambigu. |
| **Human-first, not hospital-cold** | Hangat, manusiawi, warna merah PMI sebagai identitas. Bukan white sterile hospital. |
| **Mobile first** | Mayoritas akses dari HP Android mid-range dengan koneksi 4G. Setiap piksel berharga. |
| **Accessibility is not optional** | WCAG AA minimum. Kontras cukup, target sentuh besar, screen reader friendly. |

---

## 2. Color Palette

### Primary — PMI Red

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#C62828` | CTA buttons, active states, links |
| `--color-primary-dark` | `#8E0000` | Hover states, dark accents |
| `--color-primary-light` | `#FFEBEE` | Selected/hover backgrounds |
| `--color-primary-accent` | `#D32F2F` | Gradient partner, borders |
| `--color-primary-muted` | `#E57373` | Badges, labels, secondary indicators |
| `--color-primary-subtle` | `#FFF5F5` | Alert backgrounds, card accents |

### Neutral — Warm Cream

| Token | Value | Usage |
|---|---|---|
| `--color-cream` | `#FDFBF7` | Page body background |
| `--color-surface` | `#FFFFFF` | Cards, modals, dropdowns |
| `--color-section-alt` | `#F8F6F3` | Section backgrounds, table headers |
| `--color-border-muted` | `#EDE9E3` | Subtle borders, dividers |
| `--color-border` | `#D6D0C6` | Standard borders |

### Text

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#1A1410` | Headings, body copy |
| `--color-text-secondary` | `#6B6258` | Supporting text, labels |
| `--color-text-muted` | `#9C9488` | Placeholders, metadata |

### Semantic Status

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#16A34A` | Berhasil, normal, active |
| `--color-warning` | `#D97706` | Kritis, pending, warning |
| `--color-error` | `#DC2626` | Gagal, kosong, error |
| `--color-info` | `#2563EB` | Informasi, tips |

### Contrast Compliance

| Pair | Ratio | Level |
|---|---|---|
| `--color-text-primary` (#1A1410) on `--color-cream` (#FDFBF7) | 14.2:1 | AAA ✅ |
| `--color-text-secondary` (#6B6258) on `--color-cream` (#FDFBF7) | 6.8:1 | AA ✅ |
| `--color-text-muted` (#9C9488) on `--color-cream` (#FDFBF7) | 3.9:1 | AA Large ✅ |
| `--color-primary` (#C62828) on white | 5.2:1 | AA ✅ |

---

## 3. Typography

### Font Family

**Primary:** `Inter` (via `next/font/google`, subset `latin`)

```css
--font-sans: 'Inter', sans-serif;
```

Hanya satu font — tidak loading dua font berbeda.

### Type Scale

```css
/* Utility classes — use these, NOT ad-hoc font-size */
.text-display  /* 4xl (2.25rem / 36px) — Hero headlines */
.text-h1       /* 3xl (1.875rem / 30px) — Page titles */
.text-h2       /* 2xl (1.5rem / 24px) — Section titles */
.text-h3       /* xl (1.25rem / 20px) — Card titles */
.text-h4       /* base (1rem / 16px) — Sub-headings */
.text-body     /* sm (0.875rem / 14px) — Body text */
.text-caption  /* xs (0.75rem / 12px) — Labels, metadata */
.text-micro    /* 2xs (0.625rem / 10px) — Badges, timestamps */
```

### Font Weights

| Weight | Usage |
|---|---|
| `400` (normal) | Body text |
| `500` (medium) | Labels, navigation |
| `600` (semibold) | Card titles, button text |
| `700` (bold) | Section headings |
| `800` (extrabold) | Page titles, hero |
| `900` (black) | Display text (rare) |

### Line Height

| Context | Line Height |
|---|---|
| Headlines (display, h1) | `1.1` |
| Section titles (h2, h3) | `1.2` |
| Body text | `1.6` |
| Captions | `1.4` |

---

## 4. Spacing & Layout

### Spacing Scale

Scale berbasis Tailwind default. Yang paling sering dipake:

| Class | Value | Usage |
|---|---|---|
| `gap-2` | `8px` | Icon + text, inline elements |
| `gap-3` | `12px` | Stacked elements inside cards |
| `gap-4` | `16px` | Between cards in grid |
| `gap-5` | `20px` | Section spacing |
| `gap-6` | `24px` | Between major sections |
| `p-5` | `20px` | Card padding |
| `p-6` | `24px` | Large card padding |
| `px-4 sm:px-6 lg:px-8` | Responsive page padding |

### Page Layout

```
Page max-width: 80rem (max-w-7xl)
Container: `.page-container` (max-w-80rem + responsive padding)
Section spacing: `py-24` (6rem) between major sections
Card grid gap: `gap-5` or `gap-6`
```

---

## 5. Shadows & Elevation

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 2px 8px rgba(26,20,16,0.04), 0 1px 2px rgba(26,20,16,0.02)` | Default card |
| `--shadow-elevated` | `0 8px 30px rgba(26,20,16,0.06), 0 2px 8px rgba(26,20,16,0.03)` | Modal, dropdown |
| `--shadow-hover` | `0 12px 40px rgba(198,40,40,0.08), 0 2px 8px rgba(26,20,16,0.04)` | Card hover |
| `--shadow-glass` | `0 4px 20px rgba(26,20,16,0.06)` | Glass elements |
| `--shadow-btn-primary` | `0 2px 12px rgba(198,40,40,0.3)` | Primary button |
| `--shadow-btn-primary-hover` | `0 4px 20px rgba(198,40,40,0.35)` | Primary button hover |

---

## 6. Border Radius System

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.5rem` | Small inputs, tags |
| `--radius-md` | `0.75rem` | Default buttons, inputs |
| `--radius-lg` | `1rem` | Cards, modals |
| `--radius-xl` | `1.25rem` | Large cards |
| `--radius-pill` | `9999px` | Badges, pills |
| `--radius-section` | `1.5rem` | Section containers |
| `--radius-card` | `1rem` | Cards |
| `--radius-button` | `1rem` | Buttons |
| `--radius-modal` | `1rem` | Modals |

---

## 7. Animation

### Motion Principles

1. **Motion must have purpose** — guide attention, not distract
2. **Duration**: 200-400ms for UI transitions, 500-800ms for emphasis
3. **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` — natural, not robotic
4. **Reduced motion**: `prefers-reduced-motion: reduce` respected

### Available Animations

| Token | Duration | Usage |
|---|---|---|
| `animate-fade-in-up` | 500ms | Elements entering viewport (staggered) |
| `animate-fade-in` | 400ms | Modal overlays, simple reveals |
| `animate-scale-in` | 300ms | Modal dialogs, dropdowns |
| `animate-scale-out` | 200ms | Closing elements |
| `animate-slide-up` | 300ms | Slide panels |
| `animate-slide-down` | 300ms | Accordion close |
| `animate-pulse-soft` | 2s | Loading, subtle attention |

---

## 8. Component API Standard

Setiap komponen harus mengikuti standar ini:

```tsx
// Standard props (where applicable):
type ComponentProps = {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;  // Extra utility classes dari parent
  children?: ReactNode;
};
```

### Controllers

| Prop | Type | Default |
|---|---|---|
| `variant` | sesuai komponen | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `className` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` (button) | `false` |

### New Components API

**Select** — Extended from `<select>`
| Prop | Type | Default |
|---|---|---|
| `options` | `{ value: string; label: string }[]` | required |
| `placeholder` | `string` | — |
| `label` | `ReactNode` | — |
| `error` | `string` | — |
| `helperText` | `string` | — |

**Textarea** — Extended from `<textarea>`
| Prop | Type | Default |
|---|---|---|
| `label` | `ReactNode` | — |
| `error` | `string` | — |
| `helperText` | `string` | — |

**Alert** — Standalone component
| Prop | Type | Default |
|---|---|---|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` |
| `title` | `string` | — |
| `children` | `ReactNode` | required |
| `dismissible` | `boolean` | `false` |
| `onDismiss` | `() => void` | — |
| `icon` | `ReactNode` | auto from variant |

**Table** — Generic data table
| Prop | Type | Default |
|---|---|---|
| `columns` | `Column<T>[]` | required |
| `data` | `T[]` | required |
| `loading` | `boolean` | `false` |
| `emptyState` | `ReactNode` | "Tidak ada data." |
| `onRowClick` | `(row: T) => void` | — |

```tsx
type Column<T> = {
  key: string;
  label: string;
  hide?: 'never' | 'sm' | 'md' | 'lg';   // Responsive breakpoint
  render?: (row: T) => ReactNode;         // Custom cell renderer
  className?: string;                      // Cell class override
  headerClassName?: string;                // Header cell class override
};
```

---

## 9. Component Inventory

### ✅ Existing — Selesai

| Komponen | Status | Notes |
|---|---|---|
| **Button** | ✅ | Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Loading state. |
| **Card** | ✅ | Variants: default, interactive, elevated, flush. Accent: top, left. |
| **Badge** | ✅ | Variants: default, success, warning, danger, info, premium. |
| **Input** | ✅ | Label, error, helperText, required indicator. |
| **Modal** | ✅ | Focus trap, Escape close, aria-modal, scroll lock. |
| **EmptyState** | ✅ | Icon, title, description, action slot. |
| **Skeleton** | ✅ | Page-level skeleton variants (StatCard, ScheduleCard, etc.). |
| **PageHeader** | ✅ | Badge, title, description, actions slot. |
| **StatCard** | ✅ | Icon, value, label, sub, alert variant. |
| **NavigationProgress** | ✅ | Route transition progress bar. |
| **Breadcrumb** | ✅ | Responsive breadcrumb with collapse on mobile. |

### 🟡 Existing — Butuh Refactor

| Komponen | Status | Notes |
|---|---|---|
| **PageHeader** | 🟡 | Content area header. Ada yg perlu diperbaiki. |
| **Select** | ✅ | Form dropdown with label, error, placeholder. |
| **Textarea** | ✅ | Form multi-line with label, error, resizable. |
| **Alert** | ✅ | Notification banners (success, error, warning, info). Dismissible. |
| **Table** | ✅ | Data table with responsive columns, loading, empty state. |

### ❌ Baru — Belum Dibuat

| Komponen | Priority | Notes |
|---|---|---|
| **Tabs** | 🟡 MEDIUM | Section filter |
| **Pagination** | 🟡 MEDIUM | List pagination |
| **Toggle** | 🟢 LOW | On/off switch |
| **Toast** | 🟢 LOW | Global notifications |
| **Tooltip** | 🟢 LOW | Info on hover |
| **Dropdown Menu** | 🟢 LOW | Action menus |

---

## 10. Accessibility Standards

### WCAG AA Minimum Checklist

| Kriteria | Implementasi |
|---|---|
| **Color contrast** | All text/background pairs min 4.5:1 (3:1 for large text) |
| **Focus indicators** | 2px solid `--color-primary` + 2px offset (`:focus-visible`) |
| **Touch targets** | Min 44x44px for interactive elements |
| **Keyboard navigation** | Logical tab order, no keyboard traps |
| **Screen reader** | `aria-label`, `aria-current="page"`, `role="dialog"`, `aria-modal` |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables all animations |
| **Skip link** | "Langsung ke konten" link at top of every page |
| **Form errors** | `aria-invalid`, error text associated with input |

### Touch Targets (Mobile)

```
Minimum tappable area: 44x44 CSS pixels
Exceptions: inline links within text
```

---

## 11. Iconography

### Library

**Lucide React** — semua icon dari [Lucide](https://lucide.dev).

### Naming Convention

| Context | Icon Example |
|---|---|
| Actions | `Heart`, `Calendar`, `MapPin` |
| Status | `AlertTriangle`, `CheckCircle`, `Info` |
| Navigation | `Menu`, `X`, `ChevronDown`, `ArrowRight` |
| Medical | `Droplets`, `HeartPulse`, `Syringe` |
| Communication | `Phone`, `MessageCircle`, `Mail`, `Share2` |

### Sizing

| Context | Size |
|---|---|
| Inline with text (sm) | `w-3.5 h-3.5` (14px) |
| Inline with text (md) | `w-4 h-4` (16px) |
| Button icon | `w-5 h-5` (20px) |
| Feature icon (card) | `w-6 h-6` (24px) |
| Stat icon | `w-7 h-7` (28px) |
| Large feature | `w-10 h-10` (40px) |
| Hero/display | `w-14 h-14` (56px) |

---

## 12. Writing & Copy Guidelines

### Tone

**Profesional, hangat, aksion-oriented.** Bukan "Pendaftaran Anda telah tercatat" — tapi "Pendaftaran berhasil! Simpan kode ini ya."

### Don'ts
- ❌ "Mohon maaf atas ketidaknyamanannya" (too formal, passive)
- ❌ "Silahkan menghubungi pihak terkait" (vague, no action)
- ❌ "Hi there! Ready to save some lives?" (too casual, English)

### Dos
- ✅ "Pendaftaran berhasil! Kode kamu: REG-2026-000123"
- ✅ "Stok darah golongan O- sedang kritis — ayo bantu!"
- ✅ "Hubungi PMI Indramayu di 0811-919-8611 (klik untuk telepon)"

### CTA Patterns

| Context | CTA |
|---|---|
| Hero / Primary action | **"Daftar Donor"** |
| Stock urgency | **"Bantu Sekarang"** |
| Schedule browsing | **"Lihat Semua"** |
| Detail page | **"Selengkapnya"** |
| Registration | **"Daftar Sekarang"** |
| Share | **"Bagikan"** |
| Contact | **"Hubungi Kami"** |

---

## 13. File Organization

```
src/
  components/
    ui/                # Design system components (Button, Card, etc.)
    layout/            # Layout components (Navbar, Footer, PublicShell)
    admin/             # Admin-specific components
    petugas/           # Petugas-specific components
    jadwal/            # Schedule feature components
    donor/             # Donor feature components
    map/               # Map feature components
    stok/              # Stock feature components

  lib/
    types.ts           # All TypeScript types
    utils.ts           # Date formatting, sanitization, helpers
    auth.ts            # Authentication functions
    api.ts             # Public API (browser-safe)
    admin-api.ts       # Admin API (server-side only)
    petugas-api.ts     # Petugas API (server-side only)
    supabase.ts        # Supabase client instances
    constants.ts       # Enums, labels, lookup constants ONLY
```

---

## 14. Quick Reference — Do's & Don'ts

### ✅ DO
- Use `--color-primary` for red (not `text-red-600`, `#dc2626`, etc.)
- Use `--color-cream` for page backgrounds
- Always use UI components (`<Button>`, `<Card>`, `<Badge>`) instead of raw HTML
- Use `size` and `variant` props rather than custom Tailwind classes
- Use the type scale (text-h1, text-body, text-caption)
- Import from `lucide-react` for all icons

### ❌ DON'T
- Don't write `className="btn btn-primary btn-lg"` — use `<Button variant="primary" size="lg">`
- Don't hardcode colors — use CSS variables
- Don't inline `style={{}}` — use Tailwind classes
- Don't load fonts via CSS `@import` — use `next/font/google`
- Don't create new components without checking existing ones first
