import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import s from './styles.css';
import $ from 'jquery';
import { Card, CardTitle, CardActions, Button, Grid, Icon, IconButton, Cell  } from 'react-mdl';
import config from '../../components/Config';

class ReviewPage extends React.Component {

  componentDidMount() {
    document.title = "レビュー";
  }

  constructor(props) {
    super(props);
  }

  render() {
    var tasks = this.props.tasks
    .map(function (t) {
      return (<li>{t.text} ({t.count}/{t.norm_count}) {t.memo}</li>);
    });

    return (
      <Layout className={s.content}>
      <div style={{margin: 'auto'}}>
            {tasks}
      </div>
      </Layout>
    );
  }

}

export default ReviewPage;
