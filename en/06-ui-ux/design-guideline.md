# Design Guidelines — Central Membership & SSO Hub

## 1. Document Purpose

This document serves as a design guide for visual design and user experience (UX) that must be followed in the development of the Central Membership & SSO Hub interface.

---

# 2. Design Principles

1. **Mobile-First**: Design is created for mobile screens first, then adapted for tablets and desktops.
2. **Premium & Minimal**: Clean elements, no excess, every element must have a purpose.
3. **Consistent**: Components, spacing, colors, and typography must be consistent throughout the page.
4. **Accessible**: Color contrast meets WCAG 2.1 AA standards.
5. **Responsive to State**: Each status (loading, error, success, empty) must have a suitable display.

---

# 3. Themes

The system supports two themes:

- **Dark Mode** (default)
- **Light Mode**

Users can switch between themes via a toggle on the profile or settings page. Theme preferences are stored locally.

---

# 4. Color Palette

## 4.1 Dark Mode

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#0F0F13` | Main page background |
| `bg-surface` | `#1A1A24` | Card, panel, modal |
| `bg-elevated` | `#22222F` | Dropdown, tooltip, popup |
| `border` | `#2A2A38` | Separator, input border |
| `accent-start` | `#7C3AED` | Gradient start (purple) |
| `accent-end` | `#A78BFA` | Gradient end (light purple) |
| `success` | `#10B981` | Active status, confirmation |
| `warning` | `#F59E0B` | Grace Period, warning |
| `danger` | `#EF4444` | Error, suspend, delete |
| `text-primary` | `#F1F0FF` | Main text |
| `text-secondary` | `#A1A1B5` | Secondary text |
| `text-muted` | `#6B7280` | Placeholder, inactive label |

## 4.2 Light Mode

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#F8F8FC` | Main background |
| `bg-surface` | `#FFFFFF` | Card, panel, modal |
| `bg-elevated` | `#F1F0FF` | Dropdown, tooltip |
| `border` | `#E2E2EE` | Separator, input border |
| `accent-start` | `#7C3AED` | Gradient start |
| `accent-end` | `#A78BFA` | Gradient end |
| `success` | `#059669` | Active status |
| `warning` | `#D97706` | Warning |
| `danger` | `#DC2626` | Error |
| `text-primary` | `#111118` | Main text |
| `text-secondary` | `#4B4B63` | Secondary text |
| `text-muted` | `#9CA3AF` | Placeholder |

## 4.3 Gradient Accent

Main buttons and highlight elements use a gradient:

```css
background: linear-gradient(135deg, #7C3AED, #A78BFA);
```

---

# 5. Typography

**Main Font**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

**Monospace Font** (for License-ID): `JetBrains Mono` or `Fira Code`

## 5.1 Font Scales

| Name | Size | Weight | Usage |
|---|---|---|---|
| `display` | 28px / 1.75rem | 700 | Main page title |
| `heading-1` | 22px / 1.375rem | 700 | Section title |
| `heading-2` | 18px / 1.125rem | 600 | Subtitle, product name |
| `body-lg` | 16px / 1rem | 400 | Main text |
| `body` | 14px / 0.875rem | 400 | General content text |
| `body-sm` | 12px / 0.75rem | 400 | Small text, labels |
| `caption` | 11px / 0.6875rem | 400 | Metadata, timestamp |
| `code` | 14px / 0.875rem | 500 | License-ID, technical code |

---

# 6. Spacing

Using a 4px multiplication system:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Very small gap |
| `space-2` | 8px | Small padding in small elements |
| `space-3` | 12px | Gap between inline elements |
| `space-4` | 16px | Card padding, gap between components |
| `space-5` | 20px | Section margin |
| `space-6` | 24px | Mobile page padding |
| `space-8` | 32px | Gap between large sections |
| `space-10` | 40px | High header |
| `space-12` | 48px | Gap between section pages |

**Mobile page padding**: `24px` left and right

---

# 7. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Small button, badge |
| `radius-md` | 12px | Input, main button |
| `radius-lg` | 16px | Product card, panel |
| `radius-xl` | 20px | Modal, bottom sheet |
| `radius-full` | 9999px | Pill badge, avatar |

---

# 8. Main Components

## 8.1 Button

| Variant | Appearance | Usage |
|---|---|---|
| Primary | Purple gradient, white text | Main action (Login, Activate, Pay) |
| Secondary | Purple border, purple text | Secondary action (Cancel, Back) |
| Danger | Pink background, red text | Delete, cancel |
| Ghost | Transparent, muted text | Link action |

- Default size: `height: 48px`, `border-radius: 12px`, `font-weight: 600`
- Full-width on mobile
- States: `default`, `hover`, `active`, `disabled`, `loading`

## 8.2 Input Field

- `height: 52px`
- `border-radius: 12px`
- `border: 1px solid border`
- Label always above input (not floating label)
- States: `default`, `focus`, `error`, `disabled`
- Error message appears below input, in red

## 8.3 Status Badge

| Status | Color | Example |
|---|---|---|
| Active | Green (`success`) + pulse dot | `● Active` |
| Free Forever | Purple accent | `Free Forever` |
| Grace Period | Yellow (`warning`) | `⚠ Grace Period · 3 days` |
| Suspended | Red (`danger`) | `✕ Suspended` |
| Unverified | Gray (`muted`) | `Email not verified` |

## 8.4 License-ID Card

- Background: `bg-elevated` with subtle border
- Font: monospace (`JetBrains Mono`)
- Copy button on the right side
- Displays "Copied!" feedback after clicking (2-second toast)

## 8.5 Product Card

Product subscription card in the dashboard:

```
┌──────────────────────────────────┐
│  [Logo] Product Name    [● Active] │
│  ─────────────────────────────── │
│  License ID                      │
│  NTO-A1B2-C3D4-E5F6     [Copy]  │
│  ─────────────────────────────── │
│  [Free Forever]    Open App →   │
└──────────────────────────────────┘
```

## 8.6 Toast / Snackbar

- Appears at the bottom of the screen (mobile), top right (desktop)
- Duration: 3 seconds, can be manually closed
- Types: `success`, `error`, `warning`, `info`

## 8.7 Bottom Navigation (Mobile)

4 navigation tabs:

| Tab | Icon | Label |
|---|---|---|
| Home | House | Home |
| Products | Grid | Products |
| History | Clock | History |
| Profile | Member | Profile |

---

# 9. Animations & Transitions

| Element | Animation | Duration |
|---|---|---|
| Page transition | Slide up (mobile) / Fade (desktop) | 250ms |
| Modal / Bottom Sheet | Slide up from bottom | 300ms |
| Toast | Slide in from bottom | 200ms |
| Button tap | Scale 0.97 | 100ms |
| Status badge | Pulse dot (green active) | Looping |
| Successful page | Checkmark draw + light confetti | 600ms |
| Skeleton loading | Shimmer left-to-right | Looping |

All animations use `ease-out` easing.

---

# 10. Responsive Breakpoints

| Name | Breakpoint | Layout |
|---|---|---|
| Mobile | < 640px | Full-width, bottom nav |
| Tablet |