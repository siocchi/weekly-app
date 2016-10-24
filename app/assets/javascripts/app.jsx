var Detail = React.createClass({
  load: function() {
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
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.load();
    setInterval(this.load, this.props.interval);
  },
  render: function() {
    return (<TaskList data={this.state.data} />);
  }
});

var TaskList = React.createClass({
  render: function() {
    var tasks = this.props.data.map(function (t) {
      return (<Task id={t.id} body={t.body} is_complete={t.is_complete} />);
    });

    return (
    <table id="tasks" className="table table-striped table-bordered" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>id</th>
          <th>Detail</th>
          <th>Complete</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks}
      </tbody>
    </table>
    );
  }
});

var Task = React.createClass({
  getInitialState: function() {
    return {
      body: this.props.body,
      is_complete: this.props.is_complete
    };
  },
  changeCheck: function(e) {
    var url = "tasks/" + this.props.id + "/edit.json";
    var task = {
      body: this.props.body,
      is_complete: !this.state.is_complete
    };
    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(task),
      success: function(data) {
        this.setState({
          is_complete: data.is_complete
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  changeText: function(e) {
    this.setState({
        edited: this.state.edited,
        body: this.refs.inputText.value,
        is_complete: this.state.is_complete
    });
  },
  clickEdit: function() {
     this.setState({
         edited: true,
         body: this.state.body,
         is_complete: this.state.is_complete
     });
  },
  send: function() {
    var url = "tasks/" + this.props.id + "/edit.json";
    var task = {
      body: this.state.body,
      is_complete: this.state.is_complete
    };
    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(task),
      success: function(data) {
         this.setState({
            edited: false,
            body: this.state.body,
            is_complete: this.state.is_complete
         });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    if (this.state.edited) {
       return (
         <tr>
           <td>{this.props.id}</td>
           <td><input type="text" ref="inputText" defaultValue={this.state.body} onChange={this.changeText}/></td>
           <td><input type="checkbox" checked={this.state.is_complete} defaultChecked={this.state.is_complete} onChange={this.changeCheck}/></td>
           <td>
            <button type="button" class="btn btn-default" aria-label="Left Align">
              <span className="glyphicon glyphicon-send" aria-hidden="true" onClick={this.send} ></span>
            </button>
            </td>
         </tr>
       );
    } else {
       return (
         <tr>
           <td>{this.props.id}</td>
           <td>{this.props.body}</td>
           <td><input type="checkbox" checked={this.state.is_complete} defaultChecked={this.state.is_complete} onChange={this.changeCheck}/></td>
           <td>
            <button type="button" class="btn btn-default" aria-label="Left Align">
              <span className="glyphicon glyphicon-edit" aria-hidden="true" onClick={this.clickEdit} ></span>
            </button>
            </td>
         </tr>
       );
    }
  }
});

ReactDOM.render(
    <Detail url="tasks.json" interval={3000} />, document.getElementById("content")
);
