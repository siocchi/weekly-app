
import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import $ from 'jquery';
import { Switch, Chip, Checkbox, IconButton, Grid, Icon, Cell, Snackbar  } from 'react-mdl';
import config from '../../components/Config';
import history from 'history';

class SignupPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleShowSnackbar = this.handleShowSnackbar.bind(this);
    this.handleTimeoutSnackbar = this.handleTimeoutSnackbar.bind(this);
    this.state = { isSnackbarActive: false, input: false };
    this.loadProfile = this.loadProfile.bind(this);
  }

  handleShowSnackbar() {
    this.setState({ isSnackbarActive: true, profile: this.state.profile });
  }
  handleTimeoutSnackbar() {
    this.setState({ isSnackbarActive: false, profile: this.state.profile });
  }

  componentDidMount() {
    document.title = "Sign up...";
    this.loadProfile();
  }

  loadProfile() {
    $.ajax({
      url: config.host + "/v1/profile.json",
      dataType: 'json',
      cache: false,
      success: function(data) {
        history.push("/home");
        //this.setState({input: true}); // force to always input user_name
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({input: true});
      }.bind(this)
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    var user = {
      user: this.refs.user.value

    };

    $.ajax({
      type: 'post',
      url: config.host + "/v1/create_user.json",
      contentType: 'application/json',
      data: JSON.stringify(user),
      success: function(data) {
        history.push("/home");
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(user);
        this.handleShowSnackbar();
      }.bind(this)
    });
  }

  render() {
    if (this.state.input) {
    return (
      <Layout style={{}}>
      使用したいidを入力
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="mdl-textfield mdl-js-textfield" style={{display:"table-cell", padding: "5px 0"}}>
          <textarea className="mdl-textfield__input" type="text" rows= "1" ref="user" name="user" style={{width: 100+"%","font-size": 1+"em", border:"1px solid rgba(0,0,0,.12)"}} ></textarea>
        </div>
        <button type="submit" className="mdl-button mdl-js-button" style={{width: 80+"pt"}}>Submit</button>
      </form>
      <Snackbar active={this.state.isSnackbarActive} onTimeout={this.handleTimeoutSnackbar} timeout={1500}>
        Wrong...
      </Snackbar>
      </Layout>
    );
  } else {
    return (<Layout></Layout>);
  }
}

}

export default SignupPage;
