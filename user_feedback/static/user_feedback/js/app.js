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
import { Snackbar } from "@rmwc/snackbar";
import { TextField, TextFieldHelperText } from "@rmwc/textfield";

import "@rmwc/button/node_modules/@material/button/dist/mdc.button.min.css";
import "@rmwc/dialog/node_modules/@material/dialog/dist/mdc.dialog.min.css";
import "@rmwc/icon-button/node_modules/@material/icon-button/dist/mdc.icon-button.min.css";
import "@rmwc/list/node_modules/@material/list/dist/mdc.list.min.css";
import "@rmwc/menu/node_modules/@material/menu/dist/mdc.menu.min.css";
import "@rmwc/menu/node_modules/@material/menu-surface/dist/mdc.menu-surface.min.css";
import "@rmwc/snackbar/node_modules/@material/snackbar/dist/mdc.snackbar.min.css";
import "@rmwc/textfield/node_modules/@material/textfield/dist/mdc.textfield.min.css";

export { h, render };

export class App extends Component {
  state = {
    characterCount: "",
    dialogIsOpen: false,
    feedbackText: "",
    feedbackType: 1,
    menuIsOpen: false,
    snackbarIsOpen: false,
    snackbarMessage: "",
  };

  characterLimit = 2000;

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
          onClose={(evt) => {
            this.setState({ dialogIsOpen: false });
          }}
        >
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            {this.props.text}
            <TextField
              fullwidth
              label={this.props.placeholder}
              rows="10"
              textarea
              value={this.state.feedbackText}
              onInput={(evt) => {
                if (evt.target.value.length <= this.characterLimit) {
                  this.setState({
                    characterCount: evt.target.value.length,
                    feedbackText: evt.target.value,
                  });
                } else {
                  evt.target.value = this.state.feedbackText;
                }
              }}
            />
            <TextFieldHelperText persistent>
              {this.characterLimit - this.state.characterCount} characters
              remaining.
            </TextFieldHelperText>
          </DialogContent>
          <DialogActions>
            <DialogButton ripple action="close">
              {this.props.cancelText}
            </DialogButton>
            <DialogButton ripple action="accept" isDefaultAction>
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
