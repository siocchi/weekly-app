
import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import $ from 'jquery';
import { Switch, Chip, Checkbox, IconButton, Grid, Icon, Cell, Snackbar  } from 'react-mdl';
import config from '../../components/Config';

class NewPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleShowSnackbar = this.handleShowSnackbar.bind(this);
    this.handleTimeoutSnackbar = this.handleTimeoutSnackbar.bind(this);
    this.state = { isSnackbarActive: false };
    this.url=config.host + "/v1/task.json";
  }

  handleShowSnackbar() {
    this.setState({ isSnackbarActive: true });
  }
  handleTimeoutSnackbar() {
    this.setState({ isSnackbarActive: false });
  }

  componentDidMount() {
    document.title = "タスクを登録";
    this.refs.text.focus();
  }

  handleSubmit(e) {
    e.preventDefault();
    var task = {
      text: this.refs.text.value
    };
    $.ajax({
      type: 'post',
      url: this.url,
      contentType: 'application/json',
      data: JSON.stringify(task),
      success: function(data) {
        this.refs.text.value = "";
        this.refs.text.focus();
        this.handleShowSnackbar();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  }

  render() {
    return (
      <Layout style={{}}>
      タスクを入力
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="mdl-textfield mdl-js-textfield" style={{display:"table-cell", padding: "5px 0px"}}>
          <textarea className="mdl-textfield__input" type="text" rows= "3" ref="text" name="text" style={{width: "320pt","font-size": 2+"em", border:"1px solid rgba(0,0,0,.12)"}} ></textarea>
        </div>
        <button type="submit" className="mdl-button mdl-js-button" style={{width: 100+"pt"}}>登録</button>
      </form>
      <Snackbar active={this.state.isSnackbarActive} onTimeout={this.handleTimeoutSnackbar} timeout={1500}>
        Done...
      </Snackbar>
      </Layout>
    );
  }

}

export default NewPage;
