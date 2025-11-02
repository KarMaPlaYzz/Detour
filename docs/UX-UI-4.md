Wireframe Walkthrough for Detour
1. Screen: Entry / Welcome
Purpose: Immediate immersion and brand hook.
Layout (top to bottom):
Background: Animated map gradient slowly zooming—pins pulse faintly.
Logo (top-center): minimalist wordmark “Detour.”
Tagline (center): “Go the long way. Find what others miss.”
Primary CTA (bottom-center):
Big rounded button: “Take a Detour”
Secondary link (smaller, below): “Choose your vibe.”
Interactions:
Tap “Take a Detour” → automatically runs a randomized detour (perfect for onboarding).
Tap “Choose your vibe” → goes to selection screen.
Accessibility note:
Ensure color contrast meets WCAG AA; animations must be subtle or toggleable to avoid motion sensitivity issues.
2. Screen: Vibe Selection
Purpose: Replace text-based interest inputs with emotional triggers.
Layout:
Header (top): “What kind of Detour are you in the mood for?”
Card grid (2x3 layout):
🔮 Curious
🖤 Romantic
🔥 Adventurous
🎭 Artsy
☕ Chill
🎲 Surprise Me
Action: Tap a card → light haptic feedback → progress indicator appears (“Finding your Detour...”).
Micro-interaction:
Cards slightly tilt and pulse on hover/tap, reinforcing playfulness.
Accessibility:
Each card has alt text and voice-over labels; don’t rely on color alone to convey meaning.
3. Screen: Detour Preview
Purpose: Visual confirmation of what the user’s about to experience.
Layout:
Top half: Mini-map showing route line with POI pins glowing.
Middle section:
Quick stats:
Duration (+12 min)
3 Points of Interest
Estimated Smiles: 7
POI carousel (horizontal):
Card with thumbnail, name, and teaser (“Mural Alley – hidden graffiti corridor”).
Bottom CTA bar:
[Start My Detour] – primary
[Shuffle Again] – secondary
Interaction detail:
Swipe up on POI carousel → expand to view brief list with micro stories.
4. Screen: On the Way
Purpose: Turn navigation into living storytelling.
Layout:
Full map view.
Floating prompt cards (bottom):
“You’re 30m from a hidden courtyard.”
“Want to add a photo?”
Top bar: Route progress + time left.
Bottom-right: camera icon → opens in-app “capture discovery” mode.
Accessibility:
Enable voice guidance for detour narration; allow screen-off audio prompts for walking mode.
5. Screen: Arrival / Reflection
Purpose: Emotional closure + loop back into contribution.
Layout:
Header: “You made it!”
Map snapshot: Highlights route traveled.
Summary:
“3 places discovered”
“2 new points added by others nearby”
Buttons:
[Add Something You Found]
[Share My Detour]
Micro-interaction:
Confetti burst animation (gentle, minimal), then fade to Detour home with a playful line:
“Ready to get lost again?”
6. Information Architecture Recap
Screen	Key Interaction	Primary Emotion	Success Metric
Entry	One-tap entry	Curiosity	Tap-through rate
Vibe Select	Mood selection	Anticipation	Completion rate
Preview	Route visualization	Excitement	Start CTA clicks
On the Way	Real-world discovery	Immersion	In-route engagement
Arrival	Reflection & sharing	Satisfaction	Post-detour contribution
7. Flow Logic Summary
Default Path: Open → Take a Detour → Auto-generated route → On the Way → Arrival
Custom Path: Open → Choose your vibe → Preview → Start → On the Way → Arrival
Exploration Loop: Arrival → Share/Add → Return to vibe selection
8. Design Psychology Touchpoints
Cognitive fluency: Every choice under 2 seconds, every screen under 2 options.
Variable rewards: New detours = dopamine-friendly unpredictability.
Emotional momentum: Micro-stories and tone of voice sustain curiosity.
Social validation: User-added POIs reinforce community and purpose.