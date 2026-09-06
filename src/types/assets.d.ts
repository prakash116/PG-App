/**
 * Metro resolves image imports at bundle time and hands back an opaque handle
 * that only Image understands. Declaring it here lets screens `import logo
 * from ...` with types intact, instead of falling back to an untyped require.
 */
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  import type { ImageSourcePropType } from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}
