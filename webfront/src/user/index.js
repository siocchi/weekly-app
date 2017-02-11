import React, { PropTypes } from 'react';
import $ from 'jquery';
import {Button, Grid, Icon, IconButton, Checkbox,Cell  } from 'react-mdl';
import config from '../../components/Config';

class UserWordPage extends React.Component {

  componentDidMount() {
    document.title = this.props.route.params.id + "さんの単語帳";
  }

  constructor(props) {
    super(props);
  }

  render() {
    var words = this.props.words
      .map(function (t) {
        return (<Word w={t} key={t.id}/>);
      });

    return (
      <Layout name={this.props.route.params.id} >
      <div >
          <Grid className="demo-grid-1">
          <Cell col={12}>
            </Cell>
            <Cell col={12}>
            <table id="words" className="mdl-data-table" cellSpacing="0" width="100%" style={{width: '400px', borderRightStyle: 'none',borderLeftStyle: 'none'}}>
              <thead>
                <tr>
                  <th className="mdl-data-table__cell--non-numeric">No</th>
                  <th className="mdl-data-table__cell--non-numeric" >Word</th>
                </tr>
              </thead>
              <tbody>
                {words}
              </tbody>
            </table>
            </Cell>
        </Grid>
      </div>
      </Layout>
    );
  }

}

class Word extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
      return (
        <tr>
         <td></td>
         <td className="mdl-data-table__cell--non-numeric" ><strong>{this.props.w.text}</strong></td>
        </tr>
      )
  }
}

export default UserWordPage;

class Layout extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  };

  render() {
    return (
      <div className="mdl-layout mdl-js-layout" ref={node => (this.root = node)}>
        <div className="mdl-layout__inner-container">
        <header className="mdl-layout__header">
          <div className="mdl-layout__header-row" style={{paddingLeft: '10px'}}>
            <h4>{this.props.name} さんの単語一覧</h4>
            <div className="mdl-layout-spacer"></div>
            <Navigation name={this.props.name}/>
          </div>
        </header>
          <main className="mdl-layout__content">
            <div {...this.props} />
          </main>
        </div>
      </div>
    );
  }
}

class Navigation extends React.Component {
  static propTypes = {
    name: PropTypes.string,
  };

  constructor() {
    super();
  }

  render() {
      return (
        <nav className="mdl-navigation" >
          <a className="mdl-navigation__link" href={config.host +"/v1/login"}><Icon name="input"/>Login</a>
        </nav>
      );
    }
}
