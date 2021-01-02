import { css } from 'lit-element';

export const sharedStyles = css`
  .column {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
  }

  .title {
    font-size: 20px;
  }

  .fill {
    flex: 1;
  }

  .center-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :host {
    display: flex;
  }
`;
