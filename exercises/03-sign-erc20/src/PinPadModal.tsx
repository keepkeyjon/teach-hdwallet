import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

import { css } from "emotion";

interface Props {
  show: boolean;
  onSubmit: (pin: string) => void;
  onHide: () => void;
}

class PinPadModal extends React.Component {
  state: {
    pin: string;
  } = {
    pin: ""
  };

  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  backspace() {
    this.setState({ pin: this.state.pin.slice(0, -1) });
  }

  addDigit(val: number) {
    this.setState({ pin: this.state.pin + val });
    console.log(this.state.pin);
  }

  render() {
    return !this.props.show ? (
      <></>
    ) : (
      <>
        <Form>
          <Modal
            show={this.props.show}
            onHide={this.props.onHide}
            onAbort={this.props.onHide}
          >
            <Modal.Header closeButton>
              <h3>Enter PIN</h3>
            </Modal.Header>
            <Modal.Body>
              <p>
                Use the PIN layout on your device, and enter your PIN using the
                pad below:
              </p>
              <div
                className={css`
                  display: flex;
                  justify-content: center;
                `}
              >
                <div
                  className={css`
                    display: grid;
                    grid-template-columns: repeat(3, 75px);
                    grid-template-rows: repeat(3, 75px);
                    grid-row-gap: 5px;
                    grid-column-gap: 5px;
                  `}
                >
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(val => (
                    <Button
                      key={`pin-${val}`}
                      value={val}
                      onClick={() => this.addDigit(val)}
                    />
                  ))}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Form.Control
                type="password"
                autoComplete="off"
                value={this.state.pin}
                readOnly={true}
              />
              <Button onClick={() => this.backspace()}>Delete</Button>
              <Button
                type="submit"
                onClick={() => this.props.onSubmit(this.state.pin)}
              >
                Submit
              </Button>
            </Modal.Footer>
          </Modal>
        </Form>
      </>
    );
  }
}

export default PinPadModal;
