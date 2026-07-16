# User Profile Dashboard Design & Layout Plan

This document details the layout, aesthetics, visual components, and interaction patterns for the User Profile Dashboard (`/profile`) in FlowState.

---

## 1. Dashboard Layout (Bento Grid)

The dashboard will use a CSS Grid layout, carrying over the Bento Grid aesthetic established on the home page. The cards will dynamically adjust to screen sizes (single column on mobile, dual-column on tablet, and multi-column on desktop).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              Navigation                                │
└────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────┐┌────────────────────────────────┐
│                                      ││        Daily Work Streak       │
│         User Profile Header          ││         [Glowing Flame]        │
│    [Avatar]  display_name  [Badge]   ││            7 Days              │
│                                      │└────────────────────────────────┘
└──────────────────────────────────────┘┌────────────────────────────────┐
┌──────────────────────────────────────┐│         Social Score           │
│         Total Focus Minutes          ││     [Messages Sent In Break]   │
│             2,450 min                ││           150 sent             │
│        [Radial Progress Arc]         │└────────────────────────────────┘
└──────────────────────────────────────┘┌────────────────────────────────┐
│                                                                        │
│                      Weekly Focus Heatmap (SVG)                        │
│                 "X minutes focused over the last year"                 │
│                                                                        │
│      [□] [■] [■] [■] [■] [■] [■]  <- SVG Grid (Green boxes)            │
│      (Hovering a box displays: "120 minutes focused on July 14th")      │
│                                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Card Specifications & Interactive Features

### A. User Profile Header
*   **Design**: A large horizontally styled card at the top-left containing user identity metadata.
*   **Visual Elements**:
    *   Left side: Avatar placeholder using the `.bento-icon-box` style with a default user icon.
    *   Right side:
        *   Display name styled with `.text-gradient-blue`.
        *   An authentication level badge (e.g., "Focus Member" vs. "Guest").
        *   Account creation timestamp (e.g., "Member since July 2026").

### B. Daily Work Streak (Glowing Flame Widget)
*   **Design**: A high-impact mini-widget showing the user's focus consistency.
*   **Visual Elements**:
    *   A flame icon centered inside a `.bento-icon-box`.
    *   A bold counter (e.g., `7 Days`).
    *   If the user has focused today, apply the `.navbar-pulse` class to the card outline, shifting the glow color from cyan/blue to orange to represent a "burning" active streak.
    *   If the streak is inactive, the flame icon scales back and transitions to grayscale.

### C. Total Focus Minutes & Weekly Focus Heatmap
*   **Design**: A combined panel featuring a textual overview header and a grid of interactive elements.
*   **Visual Elements**:
    *   **Text Title**: Large text stating `X minutes focused` where `X` is rendered in bright blue.
    *   **GitHub-Style Heatmap (SVG)**:
        *   A grid of SVG rectangle blocks (`<rect>`) representing the days of the week/month.
        *   **Color Scale**: Varying shades of green:
            *   No focus minutes: `#1e1e24` (dark gray matching the background).
            *   1–25 focus minutes: Light translucent green.
            *   26–50 focus minutes: Medium green.
            *   51+ focus minutes: Deep vibrant green.
        *   **Interactive Tooltip**: 
            *   Hovering any individual grid box displays a micro-tooltip overlay showing the exact statistic: `[X] minutes focused on [Date]`.
            *   Hover effects use smooth transitions (`transition: transform 0.2s ease`) to slightly scale up the hovered date box.

### D. Social Score Card (Break Chat Activity)
*   **Design**: Measures user community engagement during break phases.
*   **Visual Elements**:
    *   An icon (such as a speech bubble or coffee mug) in the top-left.
    *   Text statistics showing: `X messages sent in breaks`.
    *   A small encouragement tag below (e.g., "Active Socializer").

---

## 3. Guest Overlay / CTA State

If a guest user navigates to `/profile`, they should not be blocked by a blank page. Instead, they see a visually appealing preview of the dashboard:
*   Apply a blur filter (`filter: blur(5px)`) to all dashboard card containers.
*   Render a centered overlay dialog box with the `.bento-card` and `.navbar-pulse` class.
*   Show a clear message: 
    *   *“Save your milestones. Sign up to start tracking your focus minutes, daily streaks, and break messages.”*
    *   Include a primary blue "Sign Up Now" button and a secondary "Log In" button.

---

## 4. Technical Integration

*   **Endpoint**: `GET /api/users/profile` -> retrieves profile record, streak counters, and the daily activity list.
*   **State Hook**: Consume state from `useAuthStore` to pass the access token in the authorization header.
*   **Component Skeleton**: Use a structural skeleton loader for the SVG heatmap and the metrics cards while the API request is loading, avoiding layout shifts.
