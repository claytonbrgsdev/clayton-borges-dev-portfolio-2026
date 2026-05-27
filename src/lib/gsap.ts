// Shared GSAP config — single registration point; import from here, never from 'gsap' directly
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Motion grammar — consistent across all animations
export const EASE_OUT = "power3.out";
export const EASE_IN = "power3.in";
export const DURATION = 0.6;
export const STAGGER_SM = 0.06;
export const STAGGER_MD = 0.10;
