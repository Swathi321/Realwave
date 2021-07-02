import React from 'react'
import { getSetEventLikeData, getEventFeed } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';

export class Reactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            like: 0,
            unLike: 0,
            user: {
                like: 0,
                unLike: 0,
                className: '',
                id: ''
            },
        }
    }
    componentDidMount() {
        let { Likes, UnLikes, UserStatus, _id } = this.props.item;
        let userObject = Object.assign({}, this.state.user);
        switch (UserStatus) {
            case 0:
                userObject.like = 0
                userObject.unLike = 0
                break;
            case 1:
                userObject.like = 1
                userObject.className = "like_dislike";
                break;
            case 2:
                userObject.unLike = 1
                userObject.className = "like_dislike";
                break;
        }
        userObject.id = _id;
        this.setState({ user: userObject, like: Likes, unLike: UnLikes });
    }

    handleLikeClick = () => {
        let { item } = this.props,
            { like, unLike, user } = this.state,
            userLike = user.like,
            className = user.className,
            options = {};
        if (userLike) {
            options = { ...this.state, user: { like: 0, unLike: 0, id: item._id }, like: like - 1 };
        } else {
            let user = { like: 1, unLike: 0, className: "like_dislike", id: item._id };
            options = { ...this.state, user: user, like: like + 1 };
            if (className) {
                Object.assign(options, { unLike: unLike - 1 });
            }
        }
        this.setState(options, function () {
            let { like } = this.state.user
            this.props.dispatch(getSetEventLikeData.request({ id: item._id, status: like == "1" ? 1 : 0 }));
        });
    }

    handleDislikeClick = () => {

        let { item } = this.props,
            { like, unLike, user } = this.state,
            userUnLike = user.unLike,
            className = user.className,
            options = {};
        if (userUnLike) {
            options = { ...this.state, user: { like: 0, unLike: 0, id: item._id }, unLike: unLike - 1 };
        } else {
            let user = { like: 0, unLike: 1, className: "like_dislike", id: item._id };
            options = { ...this.state, user: user, unLike: unLike + 1 };
            if (className) {
                Object.assign(options, { like: like - 1 });
            }
        }
        this.setState(options, function () {
            let { unLike } = this.state.user
            this.props.dispatch(getSetEventLikeData.request({ id: item._id, status: unLike == "1" ? 2 : 0 }));
        });
    }

    render() {
        let { like, unLike, user } = this.state;
        return (
            <React.Fragment>
                <div className="thumbs">
                    <div><i className={user.like > 0 ? "fa fa-thumbs-up" + " " + user.className : "fa fa-thumbs-up"} onClick={this.handleLikeClick}></i></div>&emsp;
                    <div>{like}</div>&emsp;
                    <div><i className={user.unLike > 0 ? "fa fa-thumbs-down" + " " + user.className : "fa fa-thumbs-down"} onClick={this.handleDislikeClick}></i></div>&emsp;
                    <div>{unLike}</div>
                </div>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        getSetEventLikeData: state.getSetEventLikeData,
        getEventFeed: state.getEventFeed
    };
}

Reactions.defaultProps = {
    onActionComplete: null
}

var ReactionsModule = connect(mapStateToProps)(Reactions);
export default ReactionsModule;
