
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
        <th className="mdl-data-table__cell--non-numeric">今週やる</th>
          <th className="mdl-data-table__cell--non-numeric" style={{width: 240 +"px"}}>タスク</th>
          <th className="mdl-data-table__cell--non-numeric" style={{width: 240 +"px"}}>メモ</th>
          <th className="mdl-data-table__cell--non-numeric">済回数</th>
          <th className="mdl-data-table__cell--non-numeric">ノルマ</th>
          <th>更新</th>
          <th>作成</th>
          <th>削除コピー</th>
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
      in_plan: this.props.w.in_plan,
    };

    this.changeInPlan = this.changeInPlan.bind(this);
    this.delete = this.delete.bind(this);
    this.copy = this.copy.bind(this);
  }

  changeInPlan(e) {
    e.preventDefault();

    var url = config.host + "/v1/task/" + this.props.w.id + "/edit.json";
    var new_w = {
      "in_plan" : this.state.in_plan ? false : true,
      "kind": "in_plan"
    };
    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(new_w),
      success: function(data) {
        this.props.doLoad();
        this.setState({in_plan: data.in_plan});
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

  copy(e) {
    e.preventDefault();

    var url = config.host + "/v1/task/" + this.props.w.id + "/copy.json";

    $.ajax({
      type: 'post',
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
     <td>
       <Switch id="switch2" checked={this.state.in_plan} onChange={this.changeInPlan}/>
     </td>
      <td className="mdl-data-table__cell--non-numeric" style={{fontColor: 'rgba(0, 0, 0, 0.5)'}}>
        <MemoInput text={this.props.w.text} kind="text" id={this.props.w.id} />
      </td>
      <td><MemoInput text={this.props.w.memo} kind="memo" id={this.props.w.id} /></td>
      <td className="mdl-data-table__cell--non-numeric" style={{fontColor: 'rgba(0, 0, 0, 0.5)'}}>
        <MemoInput text={this.props.w.count} kind="count" id={this.props.w.id} />
      </td>
      <td className="mdl-data-table__cell--non-numeric" style={{fontColor: 'rgba(0, 0, 0, 0.5)'}}>
        <MemoInput text={this.props.w.norm_count} kind="norm_count" id={this.props.w.id} />
      </td>
      <td>{this.to_friendly_date(now, this.props.w.updated_at)}</td>
      <td>{this.to_friendly_date(now, this.props.w.created_at)}</td>
      <td>
      <IconButton name="content_copy" onClick={this.copy}/>
      <div className="mdl-layout-spacer"></div>
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
      "kind": this.props.kind
    };
    new_w[this.props.kind] =  this.refs.text.value;
    if (this.props.kind != "text" && this.props.kind != "memo") {
      new_w[this.props.kind] =  Number(this.refs.text.value);
    }

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
