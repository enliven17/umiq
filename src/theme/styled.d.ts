import 'styled-components';
import { theme } from '.';

type Theme = typeof theme;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {
    // This comment is here to prevent the interface from being considered empty by the linter.
  }
} 