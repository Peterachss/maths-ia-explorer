// MathML Core tags are supported by current browsers. React's JSX types do not list them.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type MathProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { display?: 'block' | 'inline'; width?: string };

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: MathProps; mi: MathProps; mo: MathProps; mn: MathProps;
      mrow: MathProps; mfrac: MathProps; msup: MathProps; mspace: MathProps;
    }
  }
}
