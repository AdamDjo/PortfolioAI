/**
 * Motion's animation features, isolated so they can be split off.
 *
 * This module exists only to be loaded through a dynamic `import()`. Importing
 * `motion/react` itself there would point at the same module every component
 * already imports statically, and the bundler would keep `domMax` in the initial
 * chunk of every page. Re-exported from a module of its own, the feature bundle
 * becomes a separate chunk fetched after hydration.
 */
export { domMax as default } from 'motion/react'
