---
name: Leafy Friend
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#414844'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#53606a'
  on-secondary: '#ffffff'
  secondary-container: '#d7e4f0'
  on-secondary-container: '#596670'
  tertiary: '#4a1400'
  on-tertiary: '#ffffff'
  tertiary-container: '#68280d'
  on-tertiary-container: '#eb8e6c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#d7e4f0'
  secondary-fixed-dim: '#bbc8d3'
  on-secondary-fixed: '#111d25'
  on-secondary-fixed-variant: '#3c4851'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#763217'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style

The design system is rooted in the philosophy of "Digital Gardening"—a design language that prioritizes growth, serenity, and nurturing. It aims to evoke the feeling of a sun-drenched conservatory, using a mix of **Organic Minimalism** and **Tactile** design. 

The target audience ranges from first-time "plant parents" to seasoned botanists, requiring a UI that feels both expert and encouraging. The emotional response should be one of calm productivity; managing life shouldn't feel like a chore, but like tending to a living ecosystem. Surfaces are airy, interactions are soft, and the overall aesthetic avoids the coldness of traditional tech in favor of warmth and human-centric clarity.

## Colors

The palette is derived from a Mediterranean botanical garden. 
- **Primary (Forest Green):** Used for primary actions, deep headers, and high-importance status. It represents stability and life.
- **Secondary (Soft Sage):** A desaturated green-grey used for backgrounds, secondary containers, and subtle UI elements. It provides a restful visual break.
- **Tertiary (Terracotta):** A warm, earthy accent used sparingly for notifications, care alerts, and highlights. It contrasts against the greens to draw the eye to urgent needs (like watering).
- **Neutral (Cream):** The "Airy Cream" base replaces harsh whites, reducing eye strain and giving the app a premium, paper-like feel.

Success states should utilize a vibrant leaf-green, while warnings utilize the terracotta accent rather than a harsh clinical red.

## Typography

This design system utilizes a tiered typographic approach to balance personality with utility. 

**Quicksand** is reserved for headlines and "moments of joy." Its rounded terminals mimic the soft curves of a leaf and keep the brand voice friendly and accessible. 

**Plus Jakarta Sans** handles the heavy lifting for care instructions, plant descriptions, and data. It is a modern, high-legibility typeface that ensures users can quickly scan "Light Requirements" or "Watering Schedules" without fatigue. Use tighter tracking on display styles and generous line-height on body text to maintain the "airy" feel.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with an emphasis on "Negative Space as a Feature." 

- **Mobile:** 4-column grid with 20px side margins. Elements should mostly span the full width to maximize touch targets for outdoor use.
- **Desktop/Tablet:** 12-column grid. Content is centered within a 1200px container to prevent lines of text from becoming too long and unreadable.
- **Rhythm:** Use a 4px baseline grid. Spacing between cards should be generous (24px or 32px) to allow each plant or "actionable item" to breathe, avoiding a cluttered, overwhelming interface.

## Elevation & Depth

To maintain an organic feel, this design system avoids harsh, "floating" shadows. Instead, it uses **Tonal Layering** and **Ambient Tinted Shadows**.

- **Level 0 (Base):** The Cream background.
- **Level 1 (Cards):** Soft Sage or White surfaces with a very soft, diffused shadow tinted with Primary Green (e.g., `rgba(27, 67, 50, 0.04)`).
- **Level 2 (Active Elements/Modals):** A slightly more pronounced shadow to indicate interactivity.

Depth is also communicated through "Frosted Glass" overlays (Glassmorphism) when viewing plant photos, allowing the vibrant colors of the foliage to bleed through the UI without sacrificing text legibility.

## Shapes

The shape language is strictly **Rounded**. 

There are no sharp corners in the design system. Standard containers use a `0.5rem` radius, while large feature cards and "Plant Profile" images use `1rem`. 

Buttons and Chips utilize a "Squircle" or pill-shape to feel soft to the touch. This organic geometry reflects the natural, imperfect curves found in nature, distinguishing the UI from rigid, corporate fintech or enterprise software.

## Components

### Buttons
Primary buttons are Forest Green with White text, using a pill-shape. Secondary buttons use the Terracotta color for "Care Actions" (Watering, Pruning) to stand out against the green-dominated UI.

### Cards
Cards are the primary vessel for information. They feature a subtle border (1px, Sage) or a soft ambient shadow. Every card should have a "Header" area for the plant's common name and a "Footer" area for quick-glance status icons.

### Status Indicators
Plant health is visualized through "Vitality Rings"—circular progress bars that use Sage (Empty) to Forest Green (Full) to indicate moisture, light, and humidity levels.

### Inputs & Selection
Input fields are "Ghost Style" with a soft Sage bottom-border that transforms into a Forest Green border on focus. Checkboxes and Radio buttons are circular to match the organic theme.

### Care Chips
Small, rounded labels used for tags like "Low Light," "Pet Friendly," or "Weekly Watering." These should have low-saturation background tints to stay secondary in hierarchy.