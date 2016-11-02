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
  render: function() {
    return (
     <tr>
       <td>{this.props.id}</td>
       <td>{this.props.body}</td>
       <td>{this.props.is_complete}</td>
     </tr>
    );
  }
});

ReactDOM.render(
    <Detail url="tasks.json" interval={3000} />, document.getElementById("content")
);
