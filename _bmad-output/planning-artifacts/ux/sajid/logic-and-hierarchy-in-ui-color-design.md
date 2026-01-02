Briefing: A Practical Methodology for UI Color Palette Creation

Executive Summary

This document synthesizes a practical and systematic methodology for selecting and implementing user interface (UI) color palettes. The core philosophy posits that effective UI color design does not require deep expertise in color theory but rather a structured approach focused on a limited set of color types. The recommended system relies on three categories: neutral colors for foundational elements like backgrounds and text, a primary/brand color for key actions, and semantic colors for communicating states (e.g., success, error).

A central argument is the superiority of intuitive color formats like HSL (Hue, Saturation, Lightness) and the newer OKLCH over traditional Hex and RGB. These formats allow for the programmatic and logical creation of harmonic color shades. A step-by-step process is outlined, starting with a dark mode neutral palette built by manipulating only the lightness value, which is then systematically "flipped" and adjusted for light mode.

To move beyond a minimalist aesthetic, the methodology incorporates techniques for adding visual depth and character using borders, gradients derived from background colors, highlights to simulate light sources, and realistic, multi-layered shadows. Finally, the document introduces OKLCH as a more perceptually uniform and modern color model that avoids the saturation loss inherent in HSL, noting its adoption by frameworks like Tailwind CSS as evidence of its growing industry relevance.

---

I. Foundational Principles of UI Color Selection

A streamlined approach to UI color selection can be achieved by focusing on functional categories and intuitive color models.

The "Three-Category" System

An effective UI can be designed using a minimal set of color types, simplifying the selection process and ensuring a cohesive visual language.

- Neutral Colors: Form the backbone of the UI. They are used for backgrounds, text, borders, and other non-interactive elements.
- Brand/Primary Color: Used for main calls to action (e.g., buttons) and to inject brand character into the interface.
- Semantic Colors: Reserved for communicating specific system states to the user, such as success (green), warnings (yellow/orange), or errors (red).

The Importance of Color Formats: HSL vs. Hex/RGB

The choice of color format significantly impacts the ease of creating a harmonious color palette.

- Hex and RGB: These formats are described as "the worst when it comes to creating a color palette" because their numerical values do not intuitively correlate with visual appearance. For example, three visually similar shades of gray can have wildly different and seemingly unrelated Hex/RGB codes.
- HSL (Hue, Saturation, Lightness): This format is presented as a more intuitive alternative where the code logically corresponds to the visual output.
  - Hue: The color on the 0-360 degree color wheel.
  - Saturation: The intensity of the color, from 0% (grayscale) to 100%.
  - Lightness: The brightness of the color, from 0% (black) to 100% (white).
- By manipulating these values systematically—particularly lightness—designers can create harmonic shades without guesswork.

II. A Step-by-Step Guide to Creating a Neutral Palette

The methodology provides a prescriptive process for building a neutral color palette, starting with dark mode.

Starting with Dark Mode

The process begins with creating the dark theme, which serves as the foundation for the light theme. For a neutral palette, the initial settings are:

- Hue: Can be set to any value, as it is irrelevant when saturation is zero.
- Saturation: Set to 0% to ensure a neutral, grayscale palette.

Establishing Background Shades

Three distinct shades of gray are created for the dark mode background by adjusting only the lightness value. This creates a sense of depth and hierarchy.

- Base Color (0% Lightness): The darkest shade, used for the main background.
- Surface Color (5% Lightness): A slightly lighter shade for elements like cards that sit on top of the base.
- Raised Element Color (10% Lightness): The lightest shade, used to highlight the most important or elevated elements, as lighter surfaces appear closer to the user.

Defining Text Colors

Similarly, two shades are created for text to establish a clear hierarchy without creating harsh, uncomfortable contrast.

- Headings/Important Text: A high-contrast color, but not pure white (100% lightness), which would be "too harsh on the eyes."
- Body Text: A slightly muted, lower-contrast shade that is still legible but less prominent than headings.

Transitioning to Light Mode

A simple mathematical operation provides a starting point for the light mode palette.

1. Initial Inversion: Subtract the dark mode lightness values from 100 to get a preliminary set of light mode colors.
2. Manual Adjustment: Refine the inverted values using "eyes and some common sense." The logic presented is that since light typically comes from the top, the top-most surface elements should be the lightest, and the base background should be the darkest shade of the light palette. This requires reordering the inverted colors.

Logical Naming Conventions

Variable names should be semantic and mode-agnostic to work consistently across both light and dark themes.

- For Backgrounds: Use names like BG-dark and BG-light to represent the darkest and lightest shades within the current theme, regardless of whether it's dark or light mode.
- For Text: Use names that make sense in both contexts, as text colors cannot be named based on a light/dark hierarchy.

III. CSS Implementation and Theme Switching

The created color palette is implemented using CSS custom properties (variables) to enable easy theme switching.

Defining CSS Variables

The color palette is defined in CSS, with the default theme placed in the :root selector and the alternate theme defined within a separate class or selector.

/_ Example Structure _/
:root {
--background-color: HSL(0, 0, 0);
/_ ... other dark mode variables _/
}

body.light-mode {
--background-color: HSL(0, 0, 100);
/_ ... other light mode variables _/
}

Strategies for Toggling Themes

Several methods can be used to switch between the defined themes:

- JavaScript Toggle: A single line of JavaScript can be used to toggle the theme class (e.g., light-mode) on the body element.
- CSS Media Query: The prefers-color-scheme media query can be used to automatically adapt the theme to the user's operating system preference.

/_ Media Query Example _/
@media (prefers-color-scheme: light) {
:root {
/_ ... light mode variables go here _/
}
}

IV. Enhancing Visual Depth and Character

To prevent the neutral palette from appearing "boring," four additional properties are used to add detail and realism.

Property Dark Mode Implementation Light Mode Adjustments
Border Clearly visible but not distracting. The border color is changed to match the card's background, making it blend in.
Gradient A simple gradient using background color shades, which can be fully revealed on hover to create a "shiny" effect. The dark mode gradient is copied over.
Highlight A lighter color applied to the top border to simulate light from above. The lightness is increased ("all the way up") to make it look like a true highlight rather than a plain border.
Shadow Not applicable, as shadows are not visible on a dark background. A shadow is added to create depth. For a realistic effect, it is recommended to mix a darker, shorter shadow with a lighter, longer one. Shadows require an alpha value for transparency.

V. Advanced Color Models: An Introduction to OKLCH

While HSL is a significant improvement over Hex/RGB, newer color models like OKLCH offer superior perceptual uniformity. A provided design tool demonstrates this by allowing real-time manipulation of colors, defaulting to the OKLCH format.

Comparing HSL and OKLCH

- LCH: Stands for Lightness, Chroma, and Hue. Chroma is analogous to saturation but behaves more predictably across different hues.
- OKLCH: A newer, improved version of LCH. Its primary advantage is how it handles lightness. When creating shades in HSL, the darkest and lightest variants lose all saturation and become plain gray. In LCH and OKLCH, the shades retain their hue and look "way more natural."
- Industry Adoption: The significance of OKLCH is highlighted by its adoption as the default color format in Tailwind CSS v4.

Practical Application and Tooling

A tool is referenced that facilitates the creation of a full color theme, including primary and secondary colors. Users can adjust hue and saturation and instantly see the results in both dark and light modes. The tool allows for exporting the final color palette as CSS code in both HSL and OKLCH formats.

VI. Key Quotes

"For UI stuff you don't need to become a color scientist. In my experience colors are honestly the easiest part of the UI. The tricky bit is knowing when to stop playing and just pick something that works."

"Most people are familiar with hex and RGB color values but they are the worst when it comes to creating a color palette."

"With HSL the biggest issue is how it handles lightness. The dark and light shades lose all saturation... with LCH and OKLCH the increments look way more natural."

"Always mix a darker and shorter shadow with a lighter and longer one to achieve a more realistic effect."

"...where there's light there's a shadow."

Combining soft and dark shadows improves UI realism by **simulating the physical behavior of light hitting a three-dimensional object**. According to the sources, this technique moves beyond a "basic shadow" to create a sense of depth that feels natural to the human eye.

Here is how this combination enhances realism and depth:

- **Simulating Light Physics:** Realism is achieved by adding a **light border or glow on top** and a **dark shadow at the bottom** of an element. This mimics light coming from above, making the card or button appear **elevated and closer to the user**.
- **Defining Elevation and Importance:** By using these shadows to "sell the effect" of elevation, designers make important elements more prominent. For instance, a small shadow can make an element feel natural, while bumping up those values adds even more depth to emphasize specific components.
- **Creating Recessed Elements:** The same logic can be applied in reverse to create a "pushed-in" effect. By placing a **dark inset shadow on top and a light inset shadow at the bottom**, an element (like a table or progress bar) looks deeper than the surrounding surface.
- **Enhancing Visual Hierarchy:** Combining shadows with different shades of the same color allows elements to **"pop off the page"**. This layering ensures that even without heavy borders, users can distinguish between the background, the surface, and interactive elements.
- **Dynamic Interaction:** Realism is further improved by changing shadow depth during interaction, such as adding a **bigger shadow on hover**, which reinforces the idea that an element is being "lifted" toward the user.

Ultimately, this approach is considered a "sweet spot" in UI design because it provides a **high-quality, realistic look** with much less effort than complex "S-tier" design techniques.

---

**Analogy for Understanding:**
Think of combining shadows like **embossing a piece of paper.** If you just draw a gray line, it looks flat. But if you press a shape into the paper so that the top edge catches the light (the soft shadow) and the bottom edge casts a tiny dark line (the dark shadow), your brain immediately understands that the shape has physical height and weight.
