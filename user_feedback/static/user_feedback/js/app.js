import { Component, h, render } from "preact";

import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import { Radio } from "@rmwc/radio";
import { Snackbar } from "@rmwc/snackbar";
import { TextField, TextFieldHelperText } from "@rmwc/textfield";

import "@rmwc/button/node_modules/@material/button/dist/mdc.button.min.css";
import "@rmwc/dialog/node_modules/@material/dialog/dist/mdc.dialog.min.css";
import "@rmwc/formfield/node_modules/@material/form-field/dist/mdc.form-field.min.css";
import "@rmwc/icon-button/node_modules/@material/icon-button/dist/mdc.icon-button.min.css";
import "@rmwc/list/node_modules/@material/list/dist/mdc.list.min.css";
import "@rmwc/menu/node_modules/@material/menu/dist/mdc.menu.min.css";
import "@rmwc/menu/node_modules/@material/menu-surface/dist/mdc.menu-surface.min.css";
import "@rmwc/radio/node_modules/@material/radio/dist/mdc.radio.min.css";
import "@rmwc/snackbar/node_modules/@material/snackbar/dist/mdc.snackbar.min.css";
import "@rmwc/textfield/node_modules/@material/textfield/dist/mdc.textfield.min.css";

export { h, render };

function getCsrfToken() {
  return document.querySelectorAll("input[name=csrfmiddlewaretoken]")[0].value;
}

async function handleResponse(response) {
  if (
    response.status == 200 || // OK
    response.status == 201 // CREATED
  ) {
    return await response.json();
  }

  // Default to error
  throw new Error(response);
}

const defaultSettings = {
  mode: "same-origin",
  cache: "no-cache",
  credentials: "same-origin",
  redirect: "follow",
  referrerPolicy: "same-origin",
};

export async function post(url, data) {
  const settings = {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    }),
    body: JSON.stringify(data),
  };
  Object.assign(settings, defaultSettings);
  const response = await fetch(url, settings);
  return await handleResponse(response);
}

export class App extends Component {
  state = {
    dialogIsOpen: false,
    feedbackText: "",
    feedbackType: null,
    menuIsOpen: false,
    snackbarIsOpen: false,
    snackbarMessage: "",
  };

  characterLimit = 2000;

  handleSubmit = async () => {
    try {
      await post(this.props.url, {
        text: this.state.feedbackText,
        type: this.state.feedbackType,
        url: window.location.pathname,
      });
      this.setState({
        dialogIsOpen: false,
        snackbarIsOpen: true,
        snackbarMessage: this.props.snackbarSuccess,
        feedbackText: "",
        feedbackType: null,
      });
    } catch (error) {
      this.setState({
        dialogIsOpen: false,
        snackbarIsOpen: true,
        snackbarMessage: this.props.snackbarError,
      });
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <MenuSurfaceAnchor>
          <Menu
            anchorCorner={
              this.props.anchorCorner ? this.props.anchorCorner : "bottomLeft"
            }
            open={this.state.menuIsOpen}
            onClose={() => this.setState({ menuIsOpen: false })}
            onSelect={() => this.setState({ menuIsOpen: false })}
            style={{ width: "max-content" }}
          >
            <MenuItem
              onClick={() => {
                window.location = this.props.menuHelpUrl;
              }}
            >
              {this.props.menuHelpText}
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setState({ dialogIsOpen: true });
              }}
            >
              {this.props.menuFeedbackText}
            </MenuItem>
          </Menu>

          <IconButton
            icon="live_help"
            onclick={() => {
              this.setState({ menuIsOpen: !this.state.menuIsOpen });
            }}
            title={this.props.description}
          />
        </MenuSurfaceAnchor>

        <Dialog
          open={this.state.dialogIsOpen}
          onClose={() => {
            this.setState({ dialogIsOpen: false });
          }}
        >
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            {this.props.text}
            <div style={{ paddingBottom: "10px" }}>
              {this.props.feedbackTypes.map((type) => {
                return (
                  <div>
                    <Radio
                      value={type.text}
                      checked={this.state.feedbackType === type.value}
                      onChange={() =>
                        this.setState({ feedbackType: type.value })
                      }
                    >
                      {type.text}
                    </Radio>
                  </div>
                );
              })}
            </div>
            <TextField
              fullwidth
              label={this.props.placeholder}
              rows="6"
              style={{ resize: "vertical" }}
              textarea
              value={this.state.feedbackText}
              onInput={(evt) => {
                if (evt.target.value.length <= this.characterLimit) {
                  this.setState({
                    feedbackText: evt.target.value,
                  });
                } else {
                  evt.target.value = this.state.feedbackText;
                }
              }}
            />
            <TextFieldHelperText persistent>
              {this.characterLimit - this.state.feedbackText.length}{" "}
              {this.props.charCountText}
            </TextFieldHelperText>
          </DialogContent>
          <DialogActions>
            <DialogButton ripple action="close">
              {this.props.cancelText}
            </DialogButton>
            <DialogButton
              ripple
              action="accept"
              isDefaultAction
              disabled={
                this.state.feedbackType === null ||
                this.state.feedbackText.length == 0
              }
              onClick={this.handleSubmit}
            >
              {this.props.acceptText}
            </DialogButton>
          </DialogActions>
        </Dialog>
        <Snackbar
          show={this.state.snackbarIsOpen}
          onHide={(evt) => this.setState({ snackbarIsOpen: false })}
          message={this.state.snackbarMessage}
          timeout={5000}
          actionHandler={() => {}}
          actionText="OK"
          dismissesOnAction={true}
        />
      </div>
    );
  }
}
