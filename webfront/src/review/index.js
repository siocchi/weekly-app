import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import s from './styles.css';
import $ from 'jquery';
import { Card, CardTitle, CardActions, Button, Grid, Icon, IconButton, Cell  } from 'react-mdl';
import config from '../../components/Config';

class ReviewPage extends React.Component {

  componentDidMount() {
    document.title = "単語レビュー";
  }

  constructor(props) {
    super(props);
    this.state = {data: []};
    this.load();
  }

  load() {
    $.ajax({
      url: config.host + "/v1/words.json?is_review=true&duration=12h",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("", status, err.toString());
      }.bind(this)
    });
  }


  render() {
    var words = this.state.data
    .map(function (t) {
      return (<Word w={t} key={t.id}/>);
    });

    return (
      <Layout className={s.content}>
      <div style={{margin: 'auto'}}>
          <Grid className="demo-grid-1">
            {words}
          </Grid>
      </div>
      </Layout>
    );
  }

}

class Word extends React.Component {

  constructor(props) {
    super(props);
    this.updateReview = this.updateReview.bind(this);
  }

  updateReview(e) {
    e.preventDefault();

    var url = config.host + "/v1/word/" + this.props.w.id + "/edit.json";
    var new_w = {"kind": "reviewed_at"};
    $.ajax({
      type: 'post',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(new_w),
      success: function(data) {
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });

  }

  render() {
      return (
        <Cell col={4}>
        <Card shadow={0} style={{width: '256px', height: '128px', background: '#009688'}}>
            <CardTitle expand style={{alignItems: 'flex-start', color: '#fff'}}>
                <h4 style={{marginTop: '0'}}>
                    {this.props.w.text}<br />
                    <small>{this.props.w.memo}</small>
                </h4>
            </CardTitle>
            <CardActions border style={{borderColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', boxSizing: 'border-box', alignItems: 'center', color: '#fff'}}>
                <IconButton colored name="done" onClick={this.updateReview} style={{color: '#fff'}} />
                <div className="mdl-layout-spacer"></div>
            </CardActions>
        </Card>
        </Cell>
      )
  }
}

export default ReviewPage;
