import 'styled-components';
import { theme } from '.';

type Theme = typeof theme;

declare module 'styled-components' {
  // DefaultTheme extends Theme, linter için açıklama
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
} 