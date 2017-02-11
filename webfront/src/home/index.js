
import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import s from './styles.css';
import $ from 'jquery';
import { Switch, Chip, Checkbox, IconButton, Grid, Icon, Cell  } from 'react-mdl';
import config from '../../components/Config';

class HomePage extends React.Component {

  componentDidMount() {
    document.title = "タスク一覧";
  }

  render() {
    return (
      <Layout className={s.content}>
      <Detail url={config.host + "/v1/tasks.json"} interval={8000} />
      </Layout>
    );
  }

}

export default HomePage;

class Detail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {data: []};
  }

  load() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  componentDidMount() {
    this.load();
    // setInterval(this.load.bind(this), this.props.interval);
  }

  render() {
    return (
      <div >
          <Grid className="demo-grid-1">
          <Cell col={12}>
            </Cell>
            <Cell col={12}>
            <TaskList data={this.state.data} doLoad={this.load.bind(this)}/>
            </Cell>
        </Grid>
      </div>);
  }
}

class TaskList extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    var tasks = this.props.data
        // .sort( (a, b) => {
        //   return a.priority - b.priority;
        // })
        .map( (t) => {
          return (<Task w={t} key={t.id} doLoad={this.props.doLoad}/>);
        });

    return (
    <table id="tasks" className="mdl-data-table" cellSpacing="0" width="100%">
      <thead>
        <tr>
          <th className="mdl-data-table__cell--non-numeric" style={{width: 320 +"px"}}>タスク</th>
          <th className="mdl-data-table__cell--non-numeric">済</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks}
      </tbody>
    </table>
    );
  }
}

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_review: this.props.w.is_review,
      is_input: this.props.w.is_input,
    };

    this.changeReview = this.changeReview.bind(this);
    this.changeInput = this.changeInput.bind(this);
    this.delete = this.delete.bind(this);
  }


  changeReview(e) {
    e.preventDefault();

    var url = config.host + "/v1/task/" + this.props.w.id + "/edit.json";
    var new_w = {
      "is_review" : this.state.is_review ? false : true,
      "kind": "is_review"
    };
    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(new_w),
      success: function(data) {
        this.props.doLoad();
        this.setState({is_review: data.is_review});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  }

  changeInput(e) {
    e.preventDefault();

    var url = config.host + "/v1/task/" + this.props.w.id + "/edit.json";
    var new_w = {
      "is_input" : this.state.is_input ? false : true,
      "kind": "is_input"
    };

    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(new_w),
      success: function(data) {
        this.props.doLoad();
        this.setState({is_input: data.is_input});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  }

  delete(e) {
    e.preventDefault();

    var url = config.host + "/v1/task/" + this.props.w.id + "/edit.json";

    $.ajax({
      type: 'delete',
      url: url,
      contentType: 'application/json',
      data: "",
      success: function(data) {
        this.props.doLoad();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  }

  to_friendly_date(now, created_at) {
    var s;
    s = (now - new Date(created_at))/1000/3600/24;
    if (s > 1.0) return Math.floor(s).toString() + '日前';
    s = (now - new Date(created_at))/1000/3600;
    if (s > 1.0) return Math.floor(s).toString() + '時間前';
    s = (now - new Date(created_at))/1000/60;
    if (s > 1.0) return Math.floor(s).toString() + '分前';
    s = (now - new Date(created_at))/1000;
    if (s < 0.0) s = 0.0;
    return Math.floor(s).toString() + '秒前';
  }

  render() {
    var now = new Date();
    return (
     <tr>
      <td className="mdl-data-table__cell--non-numeric" style={{fontColor: 'rgba(0, 0, 0, 0.5)'}}>
        <MemoInput text={this.props.w.text} id={this.props.w.id} />
      </td>
      <td>
        <Switch id="switch2" checked={this.state.is_review} onChange={this.changeReview}/>
      </td>
      <td>{this.to_friendly_date(now, this.props.w.created_at)}</td>
      <td>
      <IconButton name="delete" onClick={this.delete}/>
      </td>
     </tr>
    );
  }
}

class MemoInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {is_input: false, text: this.props.text };
    this.editMemo = this.editMemo.bind(this);
    this.changeMode = this.changeMode.bind(this);
  }

  changeMode() {
    if (this.state.is_input) {
      this.setState({is_input: false, text: this.state.text });
    } else {
      this.setState({is_input: true, text: this.state.text });
    }
  }

  editMemo(e) {
    e.preventDefault();

    if (this.refs.text.value.trim().length==0 ) return;

    var url = config.host + "/v1/task/" + this.props.id + "/edit.json";
    var new_w = {
      "text" :  this.refs.text.value,
      "kind": "text"
    };

    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(new_w),
      success: function(data) {
        this.setState({is_input: false, text: this.refs.text.value });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  }


  render() {
    if(this.state.is_input) {
    return (
      <div>
      <textarea className="mdl-textfield__input" type="text" rows= "3" ref="text" name="text" defaultValue={this.state.text} style={{width: "100%", border:"1px solid rgba(0,0,0,.12)"}} />
      <div className="mdl-layout-spacer" />
      <IconButton name="mode_edit" onClick={this.editMemo}/>
      </div>
    );
  } else {
    return (<div>
    {this.state.text}
    <IconButton name="mode_edit" onClick={this.changeMode}/>
    </div>);
  }
  }

}
