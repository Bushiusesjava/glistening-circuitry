# Glistening Circuitry is a social media platform for aspiring electrical engineers, EE students, and curiously minded people like me!
### GC can teach you from the bottom up, featuring lessons on the fundamentals of electricity and handy calculators for metrics like resistance and inductance. 
#### Lessons include:
- The relationship between voltage, current, and resistance
- Analog vs Digital signal processing
- Safety (most importantly), and so much more!

### And the best part is, when you feel like you've got the basics down, you can reinforce your knowledge by applying it through a catalog of projects with tutorials!
#### Play around with:
- Signal Processing
- H-Bridge Motor Drivers
- Solar Chargers

#### From blinking your first LED, to creating your own headphone amplifier, Glistening circuitry offers the path of least resistance to your learning.

### GC offers a public makerspace and a project log too!
#### In your dashboard, you can save private project logs to describe what a specific project taught you, what problems you faced, and pictures of your project! 
##### You always have the choice to either keep your logs private or share them to a public forum displayed within the Makerspace.
### If you prefer to explain your project live, create a live session for others to join in the Makerspace and share your projects over live video feed and chat!

--- 

## Upcoming changes

High-priority backlog items, largest change first. Full details live in `backlog/BACKLOG.md`.

1. **Built-in Multi Calculator** *(large)*: a general screen-based solver that computes any electronics quantity (Ohm's law, power, series/parallel, RC/RL/RLC, capacitor charge, LED resistor, voltage divider, battery energy, frequency/period) from whatever values you supply, leaving any single field blank to solve for it.
---
2. **Enforcing Censorship** *(medium-large)*: route makerspace text chat through Firestore as a moderated relay with Security Rules (auth required, blocked terms rejected, empty/oversized messages rejected, per-user rate limit) so the content filter can't be bypassed client-side. P2P video stays as-is.
---
3. **Makerspace Censorship System** *(medium: done)*: client-side filter over makerspace chat, room names, and usernames: severe terms are hard-blocked, lighter profanity is masked with `****`, with leetspeak/repeated-char bypasses caught.

**Build order:** censorship system (done) → enforcement → multi calculator.
