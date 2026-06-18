// Suppress TS7016 "implicitly has 'any' type" for @mui/icons-material deep imports
// when using moduleResolution: "bundler" with strict mode.
declare module '@mui/icons-material/*' {
  import type { SvgIconComponent } from '@mui/icons-material'
  const Icon: SvgIconComponent
  export default Icon
}
