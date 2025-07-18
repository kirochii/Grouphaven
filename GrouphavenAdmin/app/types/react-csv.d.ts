declare module 'react-csv' {
  import * as React from 'react';

  export interface CSVLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    data: object[] | string[][] | string;
    headers?: { label: string; key: string }[] | string[];
    filename?: string;
    target?: string;
    uFEFF?: boolean;
    separator?: string;
    enclosingCharacter?: string;
    asyncOnClick?: boolean;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>, done: () => void) => void;
  }

  export const CSVLink: React.FC<CSVLinkProps>;
}
