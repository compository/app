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
    font-weight: bold;
  }

  .centering-frame {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
