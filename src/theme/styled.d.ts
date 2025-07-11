import "styled-components";
import { theme } from ".";

type Theme = typeof theme;

declare module "styled-components" {
  // DefaultTheme extends Theme, ek property yok, linter için açıklama eklendi
  export interface DefaultTheme extends Theme { /* extends Theme for type-safety */ }
} 