import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class ThemeWrapper extends PureComponent {
    render() {
        console.log(this.props);
        const theme = this.props && this.props.theme &&this.props.theme.className;
        console.log(theme);
        return (
            <div className={this.props && theme}>
                {this.props.children}
            </div>
        )
    }
}
export default connect(state => {
    return {
        theme: state.theme
    }
})(ThemeWrapper);
